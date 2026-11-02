import {
  buildPlan,
  candidateRoutes,
  departingTerminals,
  parsePlanQuery,
  PlanInputs,
  PlanQuery,
} from "../lambda/plan/plan";
import type { DepartingSpace, TerminalSailingSpace } from "../../src/api/types";

// composeDepartures reads the wall clock for "minutes until", so fixtures are
// relative to the real now.
const NOW = new Date();
const wsfDate = (min: number) => `/Date(${NOW.getTime() + min * 60_000}-0800)/`;

// Lake Forest Park — Mike's starting point in kamilche-trip.
const LFP = { lat: 47.7568, lon: -122.2806 };

function departing(
  to: number,
  min: number,
  over: { spaces?: number; max?: number; cancelled?: boolean } = {},
): DepartingSpace {
  return {
    Departure: wsfDate(min),
    IsCancelled: over.cancelled ?? false,
    VesselID: 100 + min,
    VesselName: `Boat ${min}`,
    MaxSpaceCount: over.max ?? 200,
    SpaceForArrivalTerminals: [
      {
        TerminalID: to,
        DriveUpSpaceCount: over.spaces ?? 120,
      } as DepartingSpace["SpaceForArrivalTerminals"][number],
    ],
  };
}

function terminal(id: number, spaces: DepartingSpace[]): TerminalSailingSpace {
  return { TerminalID: id, DepartingSpaces: spaces } as TerminalSailingSpace;
}

function inputs(over: Partial<PlanInputs> = {}): PlanInputs {
  return {
    vessels: [],
    terminals: [
      terminal(8, [departing(12, 30), departing(12, 80), departing(12, 130)]), // Edmonds → Kingston
      terminal(7, [departing(4, 45), departing(4, 115), departing(3, 20)]), // Seattle → Bremerton / BI
      terminal(12, [departing(8, 25)]),
      terminal(4, [departing(7, 50)]),
    ],
    waitTimes: {},
    bulletins: {},
    history: {},
    ...over,
  };
}

const query = (over: Partial<PlanQuery> = {}): PlanQuery => ({
  location: LFP,
  routes: [
    "seattle-bremerton",
    "bremerton-seattle",
    "edmonds-kingston",
    "kingston-edmonds",
  ],
  sailings: 3,
  bufferMinutes: null,
  ...over,
});

describe("parsePlanQuery", () => {
  it("defaults to every route, three sailings, no location", () => {
    const r = parsePlanQuery(null);
    expect(r.ok && r.query).toMatchObject({
      location: null,
      sailings: 3,
      bufferMinutes: null,
    });
    expect(r.ok && r.query.routes).toContain("seattle-bremerton");
  });

  it("parses location, routes and overrides", () => {
    const r = parsePlanQuery({
      lat: "47.75",
      lon: "-122.28",
      routes: "edmonds-kingston, seattle-bremerton",
      sailings: "5",
      buffer: "15",
    });
    expect(r).toEqual({
      ok: true,
      query: {
        location: { lat: 47.75, lon: -122.28 },
        routes: ["edmonds-kingston", "seattle-bremerton"],
        sailings: 5,
        bufferMinutes: 15,
      },
    });
  });

  it.each([
    [{ lat: "47.7" }, /both lat and lon/],
    [{ lat: "x", lon: "-122" }, /lat must be/],
    [{ routes: "seattle-tacoma" }, /Unknown route/],
    [{ sailings: "0" }, /sailings must be/],
    [{ buffer: "-5" }, /buffer must be/],
  ])("rejects %j", (params, error) => {
    const r = parsePlanQuery(params);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toMatch(error);
  });
});

describe("candidateRoutes", () => {
  it("keeps only the direction leaving from your side of each crossing", () => {
    expect(candidateRoutes(query().routes, LFP).sort()).toEqual([
      "edmonds-kingston",
      "seattle-bremerton",
    ]);
  });
});

describe("departingTerminals", () => {
  it("dedupes shared departure terminals", () => {
    expect(
      departingTerminals([
        "seattle-bremerton",
        "seattle-bainbridge",
        "edmonds-kingston",
      ]),
    ).toEqual([7, 8]);
  });
});

describe("buildPlan", () => {
  it("picks the sailing that lands first and offers the other crossing", () => {
    const plan = buildPlan(query(), inputs(), NOW);
    expect(plan.best?.route).toBe("edmonds-kingston");
    expect(plan.best?.departure).toBe(
      new Date(NOW.getTime() + 30 * 60_000).toISOString(),
    );
    expect(plan.best?.terminal).toBe("Edmonds");
    expect(plan.alternatives.map((a) => a.route)).toEqual([
      "seattle-bremerton",
    ]);
    // Seattle → Bremerton lands an hour after it leaves.
    const bremerton = plan.alternatives[0];
    expect(
      new Date(bremerton.arrival).getTime() -
        new Date(bremerton.departure).getTime(),
    ).toBe(60 * 60_000);
  });

  it("lists sailings per route without a location, and plans nothing", () => {
    const plan = buildPlan(
      query({ location: null, routes: ["edmonds-kingston"], sailings: 2 }),
      inputs(),
      NOW,
    );
    expect(plan.best).toBeNull();
    expect(plan.routes).toHaveLength(1);
    expect(plan.routes[0]).toMatchObject({
      route: "edmonds-kingston",
      from: { id: 8, name: "Edmonds" },
      to: { id: 12, name: "Kingston" },
    });
    expect(plan.routes[0].sailings).toHaveLength(2);
    expect(plan.routes[0].sailings[0].arrival).toBe(
      new Date(NOW.getTime() + 60 * 60_000).toISOString(),
    );
  });

  it("skips a boat that is full for cars", () => {
    const full = inputs();
    full.terminals![0] = terminal(8, [
      departing(12, 30, { spaces: 1 }),
      departing(12, 80),
      departing(12, 130),
    ]);
    const plan = buildPlan(query({ routes: ["edmonds-kingston"] }), full, NOW);
    expect(plan.routes[0].carWait).toMatchObject({
      extraSailings: 1,
      reason: "live-full",
    });
    expect(plan.best?.bumpedByOverflow).toBe(true);
    expect(plan.best?.departure).toBe(
      new Date(NOW.getTime() + 80 * 60_000).toISOString(),
    );
  });

  it("reads a WSF vehicle wait note for the departing terminal", () => {
    const plan = buildPlan(
      query({ location: null, routes: ["edmonds-kingston"] }),
      inputs({
        waitTimes: {
          8: [
            {
              RouteID: 6,
              RouteName: "Edmonds / Kingston",
              WaitTimeNotes: "2 sailing wait for vehicles",
              WaitTimeLastUpdated: null,
              WaitTimeIVRNotes: null,
            },
          ],
        },
      }),
      NOW,
    );
    expect(plan.routes[0].carWait).toMatchObject({
      extraSailings: 2,
      reason: "wait-note",
      confidence: "high",
    });
  });

  it("applies a buffer override", () => {
    // 40 min of buffer misses the +30 Edmonds boat.
    const plan = buildPlan(
      query({ routes: ["edmonds-kingston"], bufferMinutes: 40 }),
      inputs(),
      NOW,
    );
    expect(plan.best?.departure).toBe(
      new Date(NOW.getTime() + 80 * 60_000).toISOString(),
    );
  });

  it("falls back to the timetable when WSF has no sailing space for a route", () => {
    const noSeattle = inputs();
    noSeattle.terminals = noSeattle.terminals!.filter((t) => t.TerminalID !== 7);
    noSeattle.schedules = {
      "seattle-bremerton": [
        { DepartingTime: wsfDate(45), VesselID: 18, VesselName: "Kitsap" },
        { DepartingTime: wsfDate(115), VesselID: 74, VesselName: "Chimacum" },
      ],
    };
    const plan = buildPlan(query({ routes: ["seattle-bremerton"] }), noSeattle, NOW);
    expect(plan.routes[0].sailings.map((x) => x.vesselName)).toEqual(["Kitsap", "Chimacum"]);
    expect(plan.routes[0].sailings[0].driveUpSpaces).toBeNull();
    expect(plan.routes[0].carWait.reason).toBe("none");
    expect(plan.best?.route).toBe("seattle-bremerton");
  });
});
