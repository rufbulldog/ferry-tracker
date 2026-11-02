import {
  estimateDriveMinutes,
  planCandidate,
  pickBestSailing,
  SailingCandidate,
  SailingLike,
} from "./bestSailing";

const NOW = new Date("2026-11-01T17:00:00-08:00");
const at = (min: number) => new Date(NOW.getTime() + min * 60_000);

const sailing = (
  min: number,
  over: Partial<SailingLike> = {},
): SailingLike => ({
  status: "scheduled",
  scheduledDeparture: at(min),
  estimatedDeparture: null,
  actualDeparture: null,
  isCancelled: false,
  ...over,
});

const candidate = (
  over: Partial<SailingCandidate<SailingLike>>,
): SailingCandidate<SailingLike> => ({
  route: "bainbridge-seattle",
  terminalLabel: "Bainbridge",
  distanceMeters: 5000,
  departures: [sailing(20), sailing(70), sailing(120)],
  bufferMinutes: 10,
  carExtraSailings: 0,
  crossingMinutes: 35,
  ...over,
});

describe("estimateDriveMinutes", () => {
  test("zero when at the terminal", () => {
    expect(estimateDriveMinutes(100)).toBe(0);
  });

  test("scales with distance", () => {
    // 10 km straight → 14 km road at 50 km/h ≈ 17 min + 2 overhead
    expect(estimateDriveMinutes(10_000)).toBe(19);
  });
});

describe("planCandidate", () => {
  test("targets the first sailing you can reach", () => {
    // 5 km → 11 min drive + 10 buffer = board by +21: the +20 boat is missed
    const pick = planCandidate(candidate({}), NOW)!;
    expect(pick.driveMinutes).toBe(11);
    expect(pick.targetTime).toEqual(at(70));
    expect(pick.leaveBy).toEqual(at(49));
    expect(pick.slackMinutes).toBe(49);
    expect(pick.following?.scheduledDeparture).toEqual(at(120));
  });

  test("catches the next boat when close enough", () => {
    const pick = planCandidate(candidate({ distanceMeters: 100 }), NOW)!;
    expect(pick.targetTime).toEqual(at(20));
    expect(pick.leaveBy).toEqual(at(10));
  });

  test("skips departed and cancelled sailings", () => {
    const pick = planCandidate(
      candidate({
        distanceMeters: 100,
        departures: [
          sailing(-5, { status: "departed" }),
          sailing(20, { isCancelled: true }),
          sailing(70),
        ],
      }),
      NOW,
    )!;
    expect(pick.targetTime).toEqual(at(70));
  });

  test("plans against a delayed boat's estimated departure", () => {
    // Scheduled +5 is unreachable on schedule, but it's running 10 min late
    const pick = planCandidate(
      candidate({
        distanceMeters: 100,
        departures: [sailing(5, { estimatedDeparture: at(25) }), sailing(70)],
      }),
      NOW,
    )!;
    expect(pick.targetTime).toEqual(at(25));
  });

  test("ignores delay on a may-recover evening boat", () => {
    const pick = planCandidate(
      candidate({
        distanceMeters: 100,
        departures: [
          sailing(5, { estimatedDeparture: at(25), mayRecover: true }),
          sailing(70),
        ],
      }),
      NOW,
    )!;
    expect(pick.targetTime).toEqual(at(70));
  });

  test("bumps past a full next boat for cars", () => {
    const pick = planCandidate(
      candidate({ distanceMeters: 100, carExtraSailings: 1 }),
      NOW,
    )!;
    expect(pick.bumpedByOverflow).toBe(true);
    expect(pick.targetTime).toEqual(at(70));
  });

  test("overflow on the next boat does not affect a later target", () => {
    const pick = planCandidate(candidate({ carExtraSailings: 1 }), NOW)!;
    expect(pick.bumpedByOverflow).toBe(false);
    expect(pick.targetTime).toEqual(at(70));
  });

  test("null when nothing is reachable", () => {
    expect(
      planCandidate(candidate({ departures: [sailing(5)] }), NOW),
    ).toBeNull();
  });

  test("null when the terminal is too far", () => {
    expect(
      planCandidate(candidate({ distanceMeters: 120_000 }), NOW),
    ).toBeNull();
  });
});

describe("pickBestSailing", () => {
  test("ranks by landing time on the far side", () => {
    const bainbridge = candidate({
      distanceMeters: 15_000,
      departures: [sailing(30), sailing(90)],
    });
    const kingston = candidate({
      route: "kingston-edmonds",
      terminalLabel: "Kingston",
      distanceMeters: 8000,
      departures: [sailing(40), sailing(80)],
      bufferMinutes: 20,
      crossingMinutes: 30,
    });
    // Bainbridge: 23 min drive + 10 → +33 misses +30 → +90 sailing, lands +125
    // Kingston: 16 min drive + 20 → +36 catches +40, lands +70
    const { best, alternatives } = pickBestSailing([bainbridge, kingston], NOW);
    expect(best?.route).toBe("kingston-edmonds");
    expect(best?.targetTime).toEqual(at(40));
    expect(alternatives.map((a) => a.route)).toEqual(["bainbridge-seattle"]);
  });

  test("empty when no candidate works", () => {
    expect(pickBestSailing([candidate({ departures: [] })], NOW)).toEqual({
      best: null,
      alternatives: [],
    });
  });
});
