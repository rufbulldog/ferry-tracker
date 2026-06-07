import {
  selectActiveDeparture,
  projectedDockTime,
  etaDepartureBasis,
  MIN_TURNAROUND_MINUTES,
  DepartureLike,
} from './arrivalEtaLogic';
import { FERRY_CROSSING_MINUTES } from './constants';

// Fixed "now" so selectActiveDeparture's Date.now() is deterministic.
const NOW = new Date('2026-06-07T18:00:00.000Z').getTime();
const minsAgo = (m: number): Date => new Date(NOW - m * 60_000);
const minsAhead = (m: number): Date => new Date(NOW + m * 60_000);

beforeEach(() => {
  jest.spyOn(Date, 'now').mockReturnValue(NOW);
});
afterEach(() => {
  jest.restoreAllMocks();
});

function dep(overrides: Partial<DepartureLike> = {}): DepartureLike {
  return {
    status: 'scheduled',
    isCancelled: false,
    actualDeparture: null,
    scheduledDeparture: minsAhead(30),
    vesselArrivalEta: null,
    vessel: null,
    ...overrides,
  };
}

describe('selectActiveDeparture', () => {
  test('returns null for undefined or empty input', () => {
    expect(selectActiveDeparture(undefined)).toBeNull();
    expect(selectActiveDeparture([])).toBeNull();
  });

  test('defaults to the first non-departed sailing', () => {
    const loading = dep({ status: 'loading', scheduledDeparture: minsAhead(10) });
    const scheduled = dep({ status: 'scheduled', scheduledDeparture: minsAhead(60) });
    expect(selectActiveDeparture([loading, scheduled])).toBe(loading);
  });

  test('prefers a boat that left within the last 5 min over the next sailing', () => {
    const justLeft = dep({ status: 'departed', actualDeparture: minsAgo(3) });
    const nextSailing = dep({ status: 'loading', scheduledDeparture: minsAhead(20) });
    expect(selectActiveDeparture([justLeft, nextSailing])).toBe(justLeft);
  });

  test('ignores a boat already well into its crossing (left > 5 min ago)', () => {
    const midCrossing = dep({ status: 'departed', actualDeparture: minsAgo(13) });
    const nextSailing = dep({
      status: 'arriving',
      vesselArrivalEta: minsAhead(8),
      scheduledDeparture: minsAhead(15),
    });
    expect(selectActiveDeparture([midCrossing, nextSailing])).toBe(nextSailing);
  });

  test('ignores a cancelled just-departed boat', () => {
    const cancelledDeparted = dep({
      status: 'departed',
      actualDeparture: minsAgo(2),
      isCancelled: true,
    });
    const nextSailing = dep({ status: 'scheduled', scheduledDeparture: minsAhead(25) });
    expect(selectActiveDeparture([cancelledDeparted, nextSailing])).toBe(nextSailing);
  });

  test('skips cancelled non-departed sailings', () => {
    const cancelled = dep({ status: 'scheduled', isCancelled: true, scheduledDeparture: minsAhead(10) });
    const loading = dep({ status: 'loading', scheduledDeparture: minsAhead(20) });
    expect(selectActiveDeparture([cancelled, loading])).toBe(loading);
  });

  test('ignores a departed boat with no actualDeparture timestamp', () => {
    const departedNoTs = dep({ status: 'departed', actualDeparture: null });
    const nextSailing = dep({ status: 'scheduled', scheduledDeparture: minsAhead(20) });
    expect(selectActiveDeparture([departedNoTs, nextSailing])).toBe(nextSailing);
  });

  test('picks the most recently departed of two just-left boats', () => {
    const older = dep({ status: 'departed', actualDeparture: minsAgo(4) });
    const newer = dep({ status: 'departed', actualDeparture: minsAgo(1) });
    expect(selectActiveDeparture([older, newer])).toBe(newer);
  });

  test('returns null when everything has departed outside the window', () => {
    const a = dep({ status: 'departed', actualDeparture: minsAgo(10) });
    const b = dep({ status: 'departed', actualDeparture: minsAgo(20) });
    expect(selectActiveDeparture([a, b])).toBeNull();
  });

  test('ignores a departed boat with a future actualDeparture (clock skew)', () => {
    const future = dep({ status: 'departed', actualDeparture: minsAhead(2) });
    const nextSailing = dep({ status: 'scheduled', scheduledDeparture: minsAhead(25) });
    expect(selectActiveDeparture([future, nextSailing])).toBe(nextSailing);
  });
});

describe('projectedDockTime', () => {
  test('returns vesselArrivalEta when present', () => {
    const eta = minsAhead(10);
    expect(projectedDockTime(dep({ vesselArrivalEta: eta }))).toBe(eta);
  });

  test('loading + LeftDock projects LeftDock + one crossing', () => {
    const leftDock = minsAgo(20);
    const result = projectedDockTime(
      dep({
        status: 'loading',
        vesselArrivalEta: null,
        vessel: { LeftDock: leftDock.toISOString() },
      }),
    );
    expect(result).not.toBeNull();
    expect(result!.getTime()).toBe(leftDock.getTime() + FERRY_CROSSING_MINUTES * 60_000);
  });

  test('returns null for a non-loading sailing with no ETA', () => {
    expect(
      projectedDockTime(dep({ status: 'scheduled', vesselArrivalEta: null, vessel: null })),
    ).toBeNull();
  });

  test('returns null for loading with no LeftDock', () => {
    expect(
      projectedDockTime(dep({ status: 'loading', vesselArrivalEta: null, vessel: { LeftDock: null } })),
    ).toBeNull();
    expect(
      projectedDockTime(dep({ status: 'loading', vesselArrivalEta: null, vessel: null })),
    ).toBeNull();
  });

  test('vesselArrivalEta takes priority over LeftDock', () => {
    const eta = minsAhead(5);
    const result = projectedDockTime(
      dep({
        status: 'loading',
        vesselArrivalEta: eta,
        vessel: { LeftDock: minsAgo(60).toISOString() },
      }),
    );
    expect(result).toBe(eta);
  });
});

describe('etaDepartureBasis', () => {
  test('uses the actual departure once the boat has left', () => {
    const actual = minsAgo(3);
    const result = etaDepartureBasis(dep({ actualDeparture: actual, scheduledDeparture: minsAgo(10) }));
    expect(result).toBe(actual);
  });

  test('uses the scheduled departure when the vessel docks before it', () => {
    const scheduled = minsAhead(20);
    const result = etaDepartureBasis(
      dep({ status: 'arriving', vesselArrivalEta: minsAhead(5), scheduledDeparture: scheduled }),
    );
    expect(result).toBe(scheduled);
  });

  test('projects dock-time + turnaround when the vessel docks after the scheduled departure', () => {
    const dockAfter = minsAhead(25);
    const result = etaDepartureBasis(
      dep({ status: 'arriving', vesselArrivalEta: dockAfter, scheduledDeparture: minsAhead(20) }),
    );
    expect(result.getTime()).toBe(dockAfter.getTime() + MIN_TURNAROUND_MINUTES * 60_000);
  });

  test('falls back to the scheduled departure when there is no dock-time signal', () => {
    const scheduled = minsAhead(20);
    const result = etaDepartureBasis(
      dep({ status: 'scheduled', vesselArrivalEta: null, vessel: null, scheduledDeparture: scheduled }),
    );
    expect(result).toBe(scheduled);
  });

  test('actual departure beats a late dock projection', () => {
    const actual = minsAgo(2);
    const result = etaDepartureBasis(
      dep({
        actualDeparture: actual,
        status: 'arriving',
        vesselArrivalEta: minsAhead(25),
        scheduledDeparture: minsAhead(20),
      }),
    );
    expect(result).toBe(actual);
  });

  test('no delay when dock-time exactly equals the scheduled departure', () => {
    const scheduled = minsAhead(20);
    const result = etaDepartureBasis(
      dep({
        status: 'arriving',
        vesselArrivalEta: new Date(scheduled.getTime()),
        scheduledDeparture: scheduled,
      }),
    );
    expect(result).toBe(scheduled);
  });
});
