import { useMemo } from 'react';
import { useTerminalSailingSpace } from './useTerminalConditions';
import { useVesselLocations } from './useVesselLocations';
import { ROUTES, Route } from '../utils/constants';
import { calculateDelayMinutes, getMinutesUntil, parseDate, addMinutes } from '../utils/time';
import type { VesselLocation } from '../api/types';

// Parse WSF date format: "/Date(1234567890000-0800)/"
function parseWsfDate(dateStr: string): Date {
  const match = dateStr.match(/\/Date\((\d+)([+-]\d{4})?\)\//);
  if (match) {
    return new Date(parseInt(match[1], 10));
  }
  return new Date(dateStr);
}

export interface DepartureInfo {
  vessel: VesselLocation | null;
  vesselName: string;
  vesselId: number;
  scheduledDeparture: Date;
  estimatedDeparture: Date | null;
  minutesUntilDeparture: number;
  delayMinutes: number;
  status: 'departed' | 'loading' | 'scheduled' | 'arriving';
  driveUpSpaces: number | null;
  maxSpaces: number;
  isCancelled: boolean;
  etaRaw: string | null; // Raw string for UI to parse
  actualDeparture: Date | null;
  vesselArrivalEta: Date | null;
}

const TURNAROUND_MINUTES = 15;

export function useNextDepartures(route: Route) {
  const { data: allVessels, isLoading: vesselsLoading, error: vesselsError } = useVesselLocations();
  const { data: terminals, isLoading: terminalsLoading, error: terminalsError } = useTerminalSailingSpace();

  const departures = useMemo(() => {
    if (!terminals) return [];

    const routeConfig = ROUTES[route];
    const departingTerminalId = routeConfig.from;
    const arrivingTerminalId = routeConfig.to;

    // Get departing terminal data
    const departingTerminal = terminals.find(t => t.TerminalID === departingTerminalId);
    if (!departingTerminal) return [];

    // Get departures to destination terminal
    const relevantDepartures = departingTerminal.DepartingSpaces.filter(dep =>
      dep.SpaceForArrivalTerminals.some(arr => arr.TerminalID === arrivingTerminalId)
    );

    return relevantDepartures.map(dep => {
      const scheduledDeparture = parseWsfDate(dep.Departure);
      const minutesUntilDeparture = getMinutesUntil(scheduledDeparture);

      // Find matching vessel from real-time data
      const vesselInfo = allVessels?.find(v => v.VesselID === dep.VesselID) || null;

      // Get space info for our destination
      const spaceInfo = dep.SpaceForArrivalTerminals.find(
        arr => arr.TerminalID === arrivingTerminalId
      );

      // Determine status from real-time vessel data
      let status: 'departed' | 'loading' | 'scheduled' | 'arriving' = 'scheduled';
      let delayMinutes = 0;
      let etaRaw: string | null = null;
      let actualDeparture: Date | null = null;
      let estimatedDeparture: Date | null = null;
      let vesselArrivalEta: Date | null = null;

      if (vesselInfo) {
        // Check if vessel's current scheduled departure matches this sailing
        const vesselScheduledTime = vesselInfo.ScheduledDeparture
          ? parseWsfDate(vesselInfo.ScheduledDeparture).getTime()
          : null;
        const thisDepTime = scheduledDeparture.getTime();
        const isCurrentSailing = vesselScheduledTime &&
          Math.abs(vesselScheduledTime - thisDepTime) < 5 * 60 * 1000;

        if (vesselInfo.LeftDock && isCurrentSailing) {
          // Vessel has departed on this sailing
          status = 'departed';
          actualDeparture = parseDate(vesselInfo.LeftDock);
          delayMinutes = calculateDelayMinutes(
            vesselInfo.ScheduledDeparture,
            vesselInfo.LeftDock
          );
          etaRaw = vesselInfo.Eta; // Keep raw for UI to parse
        } else if (vesselInfo.AtDock && vesselInfo.DepartingTerminalID === departingTerminalId && isCurrentSailing) {
          // Vessel is at dock loading for this sailing
          status = 'loading';
          // If past scheduled time, estimate departure
          const now = new Date();
          if (now > scheduledDeparture) {
            estimatedDeparture = addMinutes(now, 3);
          }
        } else if (vesselInfo.ArrivingTerminalID === departingTerminalId && !vesselInfo.AtDock && vesselInfo.Eta) {
          // Vessel is en route TO this terminal (inbound)
          status = 'arriving';
          vesselArrivalEta = parseDate(vesselInfo.Eta);

          if (vesselArrivalEta) {
            const estDep = addMinutes(vesselArrivalEta, TURNAROUND_MINUTES);
            if (estDep > scheduledDeparture) {
              estimatedDeparture = estDep;
            }
          }
        }
      }

      return {
        vessel: vesselInfo,
        vesselName: dep.VesselName,
        vesselId: dep.VesselID,
        scheduledDeparture,
        estimatedDeparture,
        minutesUntilDeparture,
        delayMinutes,
        status,
        driveUpSpaces: spaceInfo?.DriveUpSpaceCount ?? null,
        maxSpaces: dep.MaxSpaceCount,
        isCancelled: dep.IsCancelled,
        etaRaw,
        actualDeparture,
        vesselArrivalEta,
      } as DepartureInfo;
    })
    .filter(dep => dep.minutesUntilDeparture > -60 || dep.status === 'departed')
    .sort((a, b) => a.scheduledDeparture.getTime() - b.scheduledDeparture.getTime());
  }, [allVessels, terminals, route]);

  return {
    data: departures,
    isLoading: vesselsLoading || terminalsLoading,
    error: vesselsError || terminalsError,
  };
}
