import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const WSF_API_KEY = process.env.WSF_API_KEY!;
const TABLE_NAME = process.env.TABLE_NAME!;

// Terminal IDs
const TERMINALS = {
  SEATTLE: 7,
  BAINBRIDGE: 3,
  EDMONDS: 8,
  KINGSTON: 12,
};

// Routes we're tracking
const ROUTES = [
  { id: 'bainbridge-seattle', from: TERMINALS.BAINBRIDGE, to: TERMINALS.SEATTLE },
  { id: 'seattle-bainbridge', from: TERMINALS.SEATTLE, to: TERMINALS.BAINBRIDGE },
  { id: 'kingston-edmonds', from: TERMINALS.KINGSTON, to: TERMINALS.EDMONDS },
  { id: 'edmonds-kingston', from: TERMINALS.EDMONDS, to: TERMINALS.KINGSTON },
];

interface VesselLocation {
  VesselID: number;
  VesselName: string;
  DepartingTerminalID: number;
  ArrivingTerminalID: number;
  ScheduledDeparture: string | null;
  ActualDeparture: string | null;
  LeftDock: string | null;
  AtDock: boolean;
}

interface SpaceForArrivalTerminal {
  TerminalID: number;
  DriveUpSpaceCount: number | null;
  MaxSpaceCount: number;
}

interface TerminalSailing {
  Departure: string;  // Note: API uses "Departure" not "DepartureTime"
  VesselID: number;
  VesselName: string;
  MaxSpaceCount: number;
  SpaceForArrivalTerminals: SpaceForArrivalTerminal[];
}

interface TerminalSailingSpace {
  TerminalID: number;
  DepartingSpaces: TerminalSailing[];
}

async function fetchVesselLocations(): Promise<VesselLocation[]> {
  const url = `https://www.wsdot.wa.gov/ferries/api/vessels/rest/vessellocations?apiaccesscode=${WSF_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Vessel API error: ${response.status}`);
  return response.json() as Promise<VesselLocation[]>;
}

async function fetchTerminalSpace(): Promise<TerminalSailingSpace[]> {
  const url = `https://www.wsdot.wa.gov/ferries/api/terminals/rest/terminalsailingspace?apiaccesscode=${WSF_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Terminal API error: ${response.status}`);
  return response.json() as Promise<TerminalSailingSpace[]>;
}

function parseWsfDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const match = dateStr.match(/\/Date\((\d+)([+-]\d{4})?\)\//);
  if (match) {
    return new Date(parseInt(match[1], 10));
  }
  return null;
}

async function getRecentDepartures(route: string, since: Date): Promise<Set<string>> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: '#route = :route AND #ts >= :since',
    ExpressionAttributeNames: {
      '#route': 'route',
      '#ts': 'timestamp',
    },
    ExpressionAttributeValues: {
      ':route': route,
      ':since': since.toISOString(),
    },
  }));

  const keys = new Set<string>();
  for (const item of result.Items || []) {
    keys.add(`${item.vesselId}-${item.scheduledTime}`);
  }
  return keys;
}

// Get pending capacity data for a vessel loading at dock
async function getPendingCapacity(route: string, vesselId: number, scheduledTime: string): Promise<number | null> {
  const key = `pending#${route}`;
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: '#route = :route AND #ts = :ts',
    ExpressionAttributeNames: {
      '#route': 'route',
      '#ts': 'timestamp',
    },
    ExpressionAttributeValues: {
      ':route': key,
      ':ts': `${vesselId}#${scheduledTime}`,
    },
  }));

  if (result.Items && result.Items.length > 0) {
    return result.Items[0].capacityPercent as number;
  }
  return null;
}

// Save capacity data for a vessel currently loading at dock
async function savePendingCapacity(
  route: string,
  vesselId: number,
  scheduledTime: string,
  capacityPercent: number
): Promise<void> {
  const now = new Date();
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      route: `pending#${route}`,
      timestamp: `${vesselId}#${scheduledTime}`,
      capacityPercent,
      ttl: Math.floor(now.getTime() / 1000) + (4 * 60 * 60), // 4 hour TTL
    },
  }));
}

export async function handler() {
  console.log('Starting ferry departure collection...');

  try {
    const [vessels, terminalSpaces] = await Promise.all([
      fetchVesselLocations(),
      fetchTerminalSpace(),
    ]);

    console.log(`Fetched ${vessels.length} vessels, ${terminalSpaces.length} terminals`);

    // Build terminal space lookup
    const spaceByTerminal = new Map<number, TerminalSailing[]>();
    for (const terminal of terminalSpaces) {
      spaceByTerminal.set(terminal.TerminalID, terminal.DepartingSpaces || []);
    }

    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    let savedCount = 0;

    for (const route of ROUTES) {
      // Get recently saved departures to avoid duplicates
      const recentKeys = await getRecentDepartures(route.id, twoHoursAgo);

      // PHASE 1: Track vessels currently loading at dock
      const loadingVessels = vessels.filter(v =>
        v.DepartingTerminalID === route.from &&
        v.ArrivingTerminalID === route.to &&
        v.AtDock === true &&
        v.ScheduledDeparture !== null
      );

      for (const vessel of loadingVessels) {
        const scheduledDep = parseWsfDate(vessel.ScheduledDeparture);
        if (!scheduledDep) continue;

        // Get current capacity from terminal space data
        const sailings = spaceByTerminal.get(route.from) || [];
        const sailing = sailings.find(s =>
          s.VesselID === vessel.VesselID &&
          parseWsfDate(s.Departure)?.getTime() === scheduledDep.getTime()
        );

        if (sailing && sailing.MaxSpaceCount > 0) {
          // Get DriveUpSpaceCount from the SpaceForArrivalTerminals for our destination
          const arrivalSpace = sailing.SpaceForArrivalTerminals?.find(
            t => t.TerminalID === route.to
          );
          const driveUpCount = arrivalSpace?.DriveUpSpaceCount ?? 0;
          const maxCount = arrivalSpace?.MaxSpaceCount ?? sailing.MaxSpaceCount;
          const usedSpaces = maxCount - driveUpCount;
          const capacityPercent = Math.round((usedSpaces / maxCount) * 100);

          // Save/update pending capacity
          await savePendingCapacity(route.id, vessel.VesselID, scheduledDep.toISOString(), capacityPercent);
          console.log(`Tracking loading: ${vessel.VesselName} on ${route.id}, capacity: ${capacityPercent}%`);
        }
      }

      // PHASE 2: Record vessels that have departed
      const departedVessels = vessels.filter(v =>
        v.DepartingTerminalID === route.from &&
        v.ArrivingTerminalID === route.to &&
        v.LeftDock !== null &&
        !v.AtDock
      );

      for (const vessel of departedVessels) {
        const scheduledDep = parseWsfDate(vessel.ScheduledDeparture);
        const actualDep = parseWsfDate(vessel.ActualDeparture || vessel.LeftDock);

        if (!scheduledDep || !actualDep) continue;

        // Only process recent departures (within last 2 hours)
        if (actualDep < twoHoursAgo) continue;

        const depKey = `${vessel.VesselID}-${scheduledDep.toISOString()}`;
        if (recentKeys.has(depKey)) {
          console.log(`Skipping already recorded: ${vessel.VesselName} at ${scheduledDep.toISOString()}`);
          continue;
        }

        // Calculate delay
        const delayMinutes = Math.round((actualDep.getTime() - scheduledDep.getTime()) / 60000);

        // Get capacity from pending data (captured while loading)
        let capacityPercent = await getPendingCapacity(route.id, vessel.VesselID, scheduledDep.toISOString());

        // Fallback: try terminal space data (usually won't have it after departure)
        if (capacityPercent === null) {
          const sailings = spaceByTerminal.get(route.from) || [];
          const sailing = sailings.find(s =>
            s.VesselID === vessel.VesselID &&
            parseWsfDate(s.Departure)?.getTime() === scheduledDep.getTime()
          );

          if (sailing && sailing.MaxSpaceCount > 0) {
            const arrivalSpace = sailing.SpaceForArrivalTerminals?.find(
              t => t.TerminalID === route.to
            );
            const driveUpCount = arrivalSpace?.DriveUpSpaceCount ?? 0;
            const maxCount = arrivalSpace?.MaxSpaceCount ?? sailing.MaxSpaceCount;
            const usedSpaces = maxCount - driveUpCount;
            capacityPercent = Math.round((usedSpaces / maxCount) * 100);
          } else {
            capacityPercent = 0;
          }
        }

        // Save to DynamoDB
        const item = {
          route: route.id,
          timestamp: actualDep.toISOString(),
          vesselId: vessel.VesselID,
          vesselName: vessel.VesselName.replace(/^M\/V\s*/, ''), // Remove M/V prefix
          scheduledTime: scheduledDep.toISOString(),
          actualTime: actualDep.toISOString(),
          delayMinutes,
          capacityPercent,
          ttl: Math.floor(now.getTime() / 1000) + (365 * 24 * 60 * 60), // 1 year TTL
        };

        await docClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: item,
        }));

        console.log(`Saved: ${vessel.VesselName} on ${route.id}, delay: ${delayMinutes}min, capacity: ${capacityPercent}%`);
        savedCount++;
      }
    }

    console.log(`Collection complete. Saved ${savedCount} new departures.`);
    return { statusCode: 200, body: JSON.stringify({ saved: savedCount }) };

  } catch (error) {
    console.error('Collection error:', error);
    throw error;
  }
}
