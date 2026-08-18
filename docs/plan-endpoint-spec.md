# `/plan` Endpoint Spec

Backend spec for the shared leave-by "brain" that powers the Watch + CarPlay companions
(see [companion-apps-plan.md](companion-apps-plan.md)). Backend is AWS CDK (`infra/`).

Goal: one thin, fast, glanceable payload — *nearest terminal, next ~3 sailings, when to
leave, will I make it* — that a native watch app (or CarPlay, or eventually the phone) can
consume without reimplementing the leave-by logic.

---

## 1. Data-source reality (why this drives the design)

| Data | Where it lives today | Notes |
|---|---|---|
| Future sailings + live vessel status | **Live WSF only** (`vessellocations`, `terminalsailingspace`) | Composed **client-side** in `useNextDepartures`; **not** in DynamoDB |
| Past departures (delay/capacity trends) | DynamoDB `ferry-departures` | Written by collector; read via `/trends*` |
| Pending capacity (loading vessels) | DynamoDB `ferry-departures` (`pending#` keys) | Written by collector |
| Recorded transit times | DynamoDB `transit-records` | Read via `/transit-records` |
| Personal home/work locations | **On-device only** (AsyncStorage) | Not server-visible — deferred for v1 (see §6) |

The key consequence: **the upcoming-sailings composition is not currently server-side.**
The collector (`infra/lambda/collector/index.ts`) already fetches the exact live WSF data
needed and has `WSF_API_KEY` — it just only writes *departed* vessels to history. It doesn't
persist "what's coming next."

### Freshness architecture (recommended: collector pre-composes)

Two ways to get live sailings into `/plan`:

- **Option A — fetch WSF live per request.** Always fresh, but WSF `terminalsailingspace` is
  a large/slow payload (the proxy Lambda runs a 29s timeout for schedule calls), adds ~1–3s
  latency to every watch glance, and hammers WSF under repeated polling.
- **Option B — collector pre-composes (recommended).** Extend the 2-min collector to also
  write a per-route **"upcoming sailings" snapshot** to DynamoDB. `/plan` becomes a single
  fast DynamoDB read + a cheap per-request leave-by computation. ≤2 min stale, which is fine
  for ferry departures (schedule granularity is 30–60 min; leave-by moves in minutes).

**This spec assumes Option B.** The split is clean:
- **Collector** owns *data freshness* — writes raw upcoming sailings every 2 min.
- **`/plan`** owns *per-request computation* — reads the snapshot, then computes `leaveBy` /
  `makeable` against `now` + the requested vehicle + transit records.

Option A is a valid fallback if we'd rather not touch the collector first; it's a drop-in swap
of the snapshot read for a live fetch inside the same handler.

---

## 2. Request contract

```
GET /plan
```

| Param | Type | Required | Default | Notes |
|---|---|---|---|---|
| `route` | `seattle-bainbridge \| bainbridge-seattle \| kingston-edmonds \| edmonds-kingston` | one of `route` **or** `lat`+`lon` | — | Explicit route (client already resolved it) |
| `lat`, `lon` | number | one of `route` **or** `lat`+`lon` | — | Server resolves nearest terminal → departing route (§5) |
| `vehicle` | `car \| bike` | no | `bike` | Selects `TRAVEL_TIMES` config + car-overflow handling |
| `count` | int (1–5) | no | `3` | Number of upcoming sailings to return |

Validation:
- Missing both `route` and (`lat`,`lon`) → `400 { error: "route or lat/lon required" }`.
- Unknown `route` → `400`.
- `vehicle` not in enum → `400`.
- Out-of-range `lat`/`lon` → `400`.

---

## 3. Response schema

```jsonc
{
  "terminal": {
    "id": "bi-terminal",
    "label": "Bainbridge Ferry Terminal",
    "distanceMeters": 420          // null when route passed explicitly (no lat/lon)
  },
  "route": "bainbridge-seattle",
  "vehicle": "bike",
  "generatedAt": "2026-08-17T14:55:03-07:00",   // server now()
  "snapshotAt": "2026-08-17T14:54:00-07:00",     // freshness of the sailings data (Option B)
  "sailings": [
    {
      "scheduled": "2026-08-17T15:20:00-07:00",
      "effectiveDeparture": "2026-08-17T15:20:00-07:00", // scheduled + live delay
      "status": "scheduled",       // scheduled | loading | departed | arriving | returning | cancelled
      "delayMin": 0,
      "capacityPct": 62,           // null when unknown
      "vesselName": "Tacoma",
      "leaveBy": "2026-08-17T14:58:00-07:00",
      "leadMinutes": 22,           // transitMinutes + bufferMinutes used
      "makeable": true,            // leaveBy > generatedAt
      "state": "make_it"           // go_now | make_it | missed  (see §4)
    }
    // ... up to `count`
  ]
}
```

Type sketch (shared module, §7):

```ts
type PlanState = 'go_now' | 'make_it' | 'missed';
type SailingStatus = 'scheduled' | 'loading' | 'departed' | 'arriving' | 'returning' | 'cancelled';

interface PlanSailing {
  scheduled: string;             // ISO 8601 with tz offset
  effectiveDeparture: string;
  status: SailingStatus;
  delayMin: number;
  capacityPct: number | null;
  vesselName: string | null;
  leaveBy: string | null;        // null when vehicle mode unavailable for route
  leadMinutes: number;
  makeable: boolean;
  state: PlanState;
}

interface PlanResponse {
  terminal: { id: string; label: string; distanceMeters: number | null };
  route: Route;
  vehicle: Vehicle;
  generatedAt: string;
  snapshotAt: string | null;
  sailings: PlanSailing[];
}
```

---

## 4. Leave-by computation (per request)

Ports the essentials of `src/hooks/useRecommendation.ts` + `src/utils/planEstimate.ts`,
computed at request time so `leaveBy` is always relative to a fresh `now`.

For each upcoming sailing:

1. **Effective departure** — `scheduled + delayMin` (mirrors `effectiveFerryDeparture`).
   `delayMin` comes from live vessel status in the snapshot.
2. **Transit + buffer** — from `TRAVEL_TIMES[route][vehicle]`. If ≥5 matching
   `transit-records` exist, replace transit with the robust typical (`computeTypicalTransitSeconds`)
   and drop the buffer to a 1-min floor. (Same thresholds as the phone:
   `RECORDED_MIN_SAMPLES = 5`, `RECORDED_BUFFER_FLOOR = 1`.)
3. **Car overflow (v1: optional)** — the phone bumps drivers to a later boardable sailing when
   a boat fills (`useCarWait`). **Deferred for v1** unless cheap to port; note it in the payload
   later via `boardableDeparture`. Bike/walk-on path is the v1 target.
4. **`leaveBy`** = `effectiveDeparture − (transitMinutes + bufferMinutes)`.
5. **`makeable`** = `leaveBy > generatedAt`.
6. **`state`**:
   - `missed` — `leaveBy < now`
   - `go_now` — `leaveBy` within a small threshold of now (recommend **2 min**)
   - `make_it` — otherwise
7. **`leaveBy: null` / mode unavailable** — when `TRAVEL_TIMES[route][vehicle]` is absent
   (mirrors `computePlanEstimate.available === false`); `state` omitted or `missed`-neutral.

Delay-alert buffer (`useTerminalBulletins` → +5 min) is **deferred for v1** — it needs the
bulletins fetch server-side. Flag as a follow-up.

---

## 5. Nearest-terminal resolution (`lat`/`lon` path)

Reuse the existing pure logic from `src/utils/locations.ts` (extract to the shared module, §7):

- `haversineDistance` over the four **public** terminal coords (`PUBLIC_TERMINALS`,
  `locations.ts:7`) → nearest terminal.
- Nearest terminal = **departing** terminal → outbound route:
  - `bi-terminal` → `bainbridge-seattle`
  - `seattle-terminal` → `seattle-bainbridge`
  - `kingston-terminal` → `kingston-edmonds`
  - `edmonds-terminal` → `edmonds-kingston`

v1 caveat: without personal home/work locations, "nearest" is purely terminal-based. For a
commuter near a terminal this is correct; from farther away it still picks the closest
terminal, which is the sensible default. Personalization deferred (§6).

---

## 6. Deferred for v1 (documented, not built)

- **Personal home/work locations** — on-device only. v1 leave-by uses static `TRAVEL_TIMES`
  defaults + server-side `transit-records`. Later: pass a transit override param, or sync
  personal locations server-side.
- **Car-overflow bumping** (`useCarWait`) — bike/walk-on path first.
- **Delay-alert buffer** (bulletins) — needs server-side bulletins fetch.

---

## 7. Shared module extraction (avoid a third fork)

The leave-by math currently lives in TS used by the app. To avoid re-implementing it a third
time, extract the **pure** pieces into a module the Lambda imports (the collector and api
Lambdas are already `NodejsFunction` bundles, so importing shared TS is straightforward):

- `parseWsfDate`, effective-departure + delay math (already duplicated in collector — dedupe).
- `computeTypicalTransitSeconds` (`src/utils/transitStats.ts`).
- `computePlanEstimate` core (`src/utils/planEstimate.ts`) — already a pure function, the
  closest existing fit.
- `haversineDistance` / nearest-terminal / route mapping (`src/utils/locations.ts`).

Placement options: a small package under `infra/lambda/shared/`, or lift the pure utils into a
location both the app and `infra/` can import. Decision left open — see §11.

---

## 8. CDK / infra wiring

Add a **dedicated `ferry-plan` Lambda** — it needs *both* the WSF key (Option A) or the
DynamoDB snapshot (Option B) *and* read access to the trends + transit tables. Keeping it
separate leaves the pure-DynamoDB `ferry-api` Lambda untouched.

```ts
// lib/infra-stack.ts
const planFn = new nodejs.NodejsFunction(this, 'PlanFunction', {
  functionName: 'ferry-plan',
  entry: path.join(__dirname, '../lambda/plan/index.ts'),
  handler: 'handler',
  runtime: lambda.Runtime.NODEJS_22_X,
  timeout: cdk.Duration.seconds(10),
  memorySize: 256,
  environment: {
    DEPARTURES_TABLE: departuresTable.tableName, // snapshot + trends + pending capacity
    TRANSIT_TABLE: transitTable.tableName,
    // WSF_API_KEY: wsfApiKey.valueAsString,      // only if Option A (live fetch)
  },
});
departuresTable.grantReadData(planFn);
transitTable.grantReadData(planFn);

const planIntegration = new apigateway.LambdaIntegration(planFn);
const plan = api.root.addResource('plan');
plan.addMethod('GET', planIntegration);
```

Collector change (Option B): after composing per-route sailings, write one snapshot item per
route, e.g. partition `upcoming#<route>` with a fixed sort key (latest-wins) or a short TTL,
carrying the next N sailings (scheduled time, status, delayMin, capacityPct, vesselName).
This reuses the vessel/terminal-space data the collector already fetches each cycle.

---

## 9. ⚠️ Pre-existing drift to fix alongside

`/trends/latest` is **handled in the api Lambda** (`lambda/api/index.ts:181`) but **not wired
as a resource** in `lib/infra-stack.ts` (only `/trends` and `/trends/recent` exist). The app
calls it via `getLatestDepartures` (`src/api/backend.ts:83`), so it is currently **404-ing at
API Gateway** unless the deployed stack has drifted from source. Wire it (or confirm the
drift) when adding `/plan`, and don't repeat the pattern — every handler branch needs a
matching `addResource(...).addMethod(...)`.

---

## 10. Errors, edge cases, non-functionals

- **No upcoming sailings** (end of service day) → `200` with `sailings: []`. Client shows
  "No more ferries today." Not an error.
- **Cancelled sailing** → include with `status: "cancelled"`, `makeable: false`.
- **Snapshot missing/stale** (Option B, collector lagging) → if `snapshotAt` older than ~6 min,
  either return `200` with a `stale: true` flag or fall back to a live fetch. Recommend the
  flag + let the client decide.
- **CORS** — mirror existing Lambdas (`Access-Control-Allow-Origin: *`); watch/CarPlay don't
  need CORS but the phone/web would.
- **Throttling** — add a modest API Gateway usage plan / rate limit; the watch may poll on
  wrist-raise. WSF data is public so no auth, but protect against runaway polling.
- **Timezone** — emit ISO 8601 **with offset** (`-07:00`); the watch renders in local time.
- **Latency budget** — Option B target < 300 ms (single DynamoDB query + compute).

---

## 11. Open decisions

1. **Freshness: Option B (collector pre-composes) vs A (live fetch).** Spec assumes B. Confirm.
2. **Shared-module placement** — `infra/lambda/shared/` vs a cross-importable utils location
   (§7). Affects how much app/infra coupling we introduce.
3. **Snapshot storage shape** (Option B) — reuse `ferry-departures` with an `upcoming#<route>`
   partition, or a small separate table.
4. **Route vs lat/lon** — ship both from day one, or start with explicit `route` (client does
   nearest-terminal locally with the same haversine) and add server-side `lat/lon` later?

---

## 12. Test plan

- **Unit (pure module):** leave-by math, `state` thresholds (`go_now` boundary at 2 min),
  `makeable`, mode-unavailable → `leaveBy: null`, nearest-terminal resolution, WSF date parsing.
  Lands in the existing `infra/` Jest suite (`cd infra && npm test`) and/or the app `src` suite
  wherever the shared module lives.
- **Handler:** param validation (400s), empty-sailings 200, stale-snapshot flag, route vs
  lat/lon paths.
- **Collector (Option B):** snapshot written per route each cycle; shape matches `/plan` reader.
- **Manual:** `curl` the deployed endpoint for each route + vehicle; eyeball against the phone's
  Leave card for the same moment.
