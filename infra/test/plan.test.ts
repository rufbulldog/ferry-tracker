import {
  buildPlan,
  buildTimetable,
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
  date: null,
  ...over,
});

describe("parsePlanQuery", () => {
  it("defaults to the app's default routes, three sailings, no location", () => {
    const r = parsePlanQuery(null);
    expect(r.ok && r.query).toMatchObject({
      location: null,
      sailings: 3,
      bufferMinutes: null,
    });
    expect(r.ok && r.query.routes).toEqual([
      "bainbridge-seattle", "seattle-bainbridge", "kingston-edmonds", "edmonds-kingston",
    ]);
  });

  it("plans Bremerton only when asked", () => {
    const r = parsePlanQuery({ routes: "seattle-bremerton" });
    expect(r.ok && r.query.routes).toEqual(["seattle-bremerton"]);
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
        date: null,
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

describe("date=", () => {
  it("takes a calendar date", () => {
    const r = parsePlanQuery({ date: "2026-11-06" });
    expect(r.ok && r.query.date).toBe("2026-11-06");
  });

  it.each(["soon", "2026-13-01", "2026-02-30", "11/06/2026"])(
    "rejects %s",
    (date) => {
      const r = parsePlanQuery({ date });
      expect(!r.ok && r.error).toMatch(/date must be/);
    },
  );

  it("lists the whole day on schedule, in order, with nothing live", () => {
    const at = (h: number) => Date.UTC(2026, 10, 6, h);
    const times = [20, 16, 18].map((h, i) => ({
      DepartingTime: `/Date(${at(h)}-0800)/`,
      VesselID: i,
      VesselName: `Boat ${h}`,
    }));
    const plan = buildTimetable(
      query({ location: null, routes: ["edmonds-kingston", "seattle-bremerton"] }),
      "2026-11-06",
      { "edmonds-kingston": times },
      NOW,
    );
    expect(plan.date).toBe("2026-11-06");
    expect(plan.best).toBeNull();
    const [ek, sb] = plan.routes;
    expect(ek.sailings.map((s) => s.vesselName)).toEqual(["Boat 16", "Boat 18", "Boat 20"]);
    expect(ek.sailings[0]).toMatchObject({
      scheduledDeparture: new Date(at(16)).toISOString(),
      departure: new Date(at(16)).toISOString(),
      arrival: new Date(at(16) + ek.crossingMinutes * 60_000).toISOString(),
      delayMinutes: 0,
      status: "scheduled",
      driveUpSpaces: null,
      isCancelled: false,
    });
    expect(ek.from.name).toBe("Edmonds");
    // A route WSF had nothing for is still listed, with no boats.
    expect(sb.sailings).toEqual([]);
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

  it("lists the boat on the water once, even with the whole day's timetable", () => {
    const leftDock = wsfDate(-20);
    const onWater = inputs({
      vessels: [
        {
          VesselID: 74, VesselName: "Chimacum", DepartingTerminalID: 4, ArrivingTerminalID: 7,
          AtDock: false, LeftDock: leftDock, Eta: wsfDate(40), ScheduledDeparture: wsfDate(-25),
        } as unknown as NonNullable<PlanInputs["vessels"]>[number],
      ],
    });
    onWater.terminals = onWater.terminals!.filter((t) => t.TerminalID !== 4);
    onWater.schedules = {
      "bremerton-seattle": [-300, -180, -25, 50].map((m) => ({ DepartingTime: wsfDate(m), VesselID: 74, VesselName: "Chimacum" })),
    };
    const plan = buildPlan(query({ location: null, routes: ["bremerton-seattle"] }), onWater, NOW);
    const departed = plan.routes[0].sailings.filter((x) => x.status === "departed");
    expect(departed).toHaveLength(1);
    expect(departed[0].scheduledDeparture).toBe(new Date(NOW.getTime() - 25 * 60_000).toISOString());
  });
});
