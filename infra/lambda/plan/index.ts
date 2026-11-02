// The plan's "typical for this hour" history and the reasoning text are in
// Pacific time, like the app; Lambda defaults to UTC. Node reads TZ per Date call.
process.env.TZ = "America/Los_Angeles";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  buildPlan,
  departingTerminals,
  parsePlanQuery,
  PLAN_ROUTES,
  PlanInputs,
  hasSailingSpace,
  ScheduledSailing,
} from "./plan";

const WSF_API_KEY = process.env.WSF_API_KEY!;
const WSF_BASE_URL = "https://www.wsdot.wa.gov/ferries/api";
const DEPARTURES_TABLE = process.env.DEPARTURES_TABLE!;

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Warm-container cache: WSF live data refreshes about every 30 s anyway, and
// this keeps a polling client from turning into WSF traffic.
const LIVE_TTL_MS = 30_000;
const HISTORY_TTL_MS = 10 * 60_000;
const SCHEDULE_TTL_MS = 30 * 60_000;
const HISTORY_DAYS = 14;
const cache = new Map<string, { at: number; value: unknown }>();

async function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;
  const value = await load();
  cache.set(key, { at: Date.now(), value });
  return value;
}

async function wsf<T>(path: string, ttlMs = LIVE_TTL_MS): Promise<T> {
  return cached(`wsf:${path}`, ttlMs, async () => {
    const res = await fetch(
      `${WSF_BASE_URL}/${path}?apiaccesscode=${WSF_API_KEY}`,
    );
    if (!res.ok) throw new Error(`WSF ${path}: ${res.status}`);
    return (await res.json()) as T;
  });
}

// Optional signals degrade to "unknown" rather than failing the plan.
async function optional<T>(load: () => Promise<T>): Promise<T | undefined> {
  try {
    return await load();
  } catch (error) {
    console.warn("Optional plan input failed:", error);
    return undefined;
  }
}

// Pacific calendar date, `days` from now (TZ is set above).
function tripDate(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA");
}

// Today's and tomorrow's timetable (so late evenings still show the first boats).
async function timetable(route: string): Promise<ScheduledSailing[]> {
  const { from, to } = PLAN_ROUTES[route];
  const days = await Promise.all(
    [0, 1].map((d) =>
      optional(() =>
        wsf<{ TerminalCombos?: { Times?: ScheduledSailing[] }[] }>(
          `schedule/rest/schedule/${tripDate(d)}/${from}/${to}`,
          SCHEDULE_TTL_MS,
        ),
      ),
    ),
  );
  return days.flatMap((d) => d?.TerminalCombos?.[0]?.Times ?? []);
}

async function recentHistory(
  route: string,
): Promise<PlanInputs["history"][string]> {
  return cached(`history:${route}`, HISTORY_TTL_MS, async () => {
    const since = new Date(Date.now() - HISTORY_DAYS * 24 * 60 * 60 * 1000);
    const result = await docClient.send(
      new QueryCommand({
        TableName: DEPARTURES_TABLE,
        KeyConditionExpression: "#route = :route AND #ts >= :start",
        ExpressionAttributeNames: { "#route": "route", "#ts": "timestamp" },
        ExpressionAttributeValues: {
          ":route": route,
          ":start": since.toISOString(),
        },
      }),
    );
    return (result.Items ?? []) as PlanInputs["history"][string];
  });
}

function response(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

// GET /plan?lat=&lon=&routes=a,b&sailings=3&buffer=10
export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === "OPTIONS") return response(200, {});

  const parsed = parsePlanQuery(event.queryStringParameters);
  if (!parsed.ok) return response(400, { error: parsed.error });
  const { query } = parsed;

  try {
    const terminalIds = departingTerminals(query.routes);
    const [vessels, terminals, waitTimes, bulletins, history] =
      await Promise.all([
        wsf<PlanInputs["vessels"]>("vessels/rest/vessellocations"),
        wsf<PlanInputs["terminals"]>("terminals/rest/terminalsailingspace"),
        Promise.all(
          terminalIds.map((id) =>
            optional(() =>
              wsf<{ WaitTimes: PlanInputs["waitTimes"][number] }>(
                `terminals/rest/terminalwaittimes/${id}`,
              ),
            ),
          ),
        ),
        Promise.all(
          terminalIds.map((id) =>
            optional(() =>
              wsf<{ Bulletins: PlanInputs["bulletins"][number] }>(
                `terminals/rest/terminalbulletins/${id}`,
              ),
            ),
          ),
        ),
        Promise.all(
          query.routes.map((id) =>
            PLAN_ROUTES[id].hasHistory
              ? optional(() => recentHistory(id))
              : Promise.resolve(undefined),
          ),
        ),
      ]);

    const timetableRoutes = query.routes.filter(
      (id) => !hasSailingSpace(terminals, id),
    );
    const timetables = await Promise.all(timetableRoutes.map(timetable));

    const inputs: PlanInputs = {
      vessels,
      terminals,
      schedules: Object.fromEntries(
        timetableRoutes.map((id, i) => [id, timetables[i]]),
      ),
      waitTimes: Object.fromEntries(
        terminalIds.map((id, i) => [id, waitTimes[i]?.WaitTimes]),
      ),
      bulletins: Object.fromEntries(
        terminalIds.map((id, i) => [id, bulletins[i]?.Bulletins]),
      ),
      history: Object.fromEntries(
        query.routes.map((id, i) => [id, history[i]]),
      ),
    };
    return response(200, buildPlan(query, inputs, new Date()));
  } catch (error) {
    console.error("Plan error:", error);
    return response(502, { error: "Ferry data unavailable" });
  }
}
