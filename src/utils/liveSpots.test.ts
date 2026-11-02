import { withEnRoute } from './liveSpots';
import type { FerryLiveState } from '../../modules/ferry-live';

const base: FerryLiveState = {
  routeLabel: 'Kingston → Edmonds',
  terminal: 'Kingston',
  departureMs: 10_000_000,
  leaveByMs: 8_000_000,
  arrivalMs: 11_800_000,
  driveMinutes: 20,
  note: null,
  spaces: 112,
  vesselName: 'Puyallup',
};

describe('withEnRoute', () => {
  test('before leave-by it is the countdown', () => {
    const s = withEnRoute({ state: base, car: true }, 7_000_000, true, false, new Map());
    expect(s.enRoute).toBe(false);
  });

  test('switches at "Leave now", within a minute of leave-by', () => {
    expect(withEnRoute({ state: base, car: true }, 7_950_000, true, false, new Map()).enRoute).toBe(true);
    expect(withEnRoute({ state: base, car: true }, 7_900_000, true, false, new Map()).enRoute).toBe(false);
  });

  test('after leave-by in a car it shows spaces and remembers the starting count', () => {
    const start = new Map<number, number>();
    const first = withEnRoute({ state: base, car: true }, 8_100_000, true, false, start);
    expect(first).toMatchObject({ enRoute: true, spaces: 112, startSpaces: 112 });
    const later = withEnRoute({ state: { ...base, spaces: 84 }, car: true }, 8_400_000, true, true, start);
    expect(later).toMatchObject({ enRoute: true, spaces: 84, startSpaces: 112 });
  });

  test('stays on the way once started, even if re-planning slides leave-by later', () => {
    const s = withEnRoute({ state: { ...base, leaveByMs: 9_000_000 }, car: true }, 8_500_000, true, true, new Map());
    expect(s.enRoute).toBe(true);
  });

  test('a bike never switches', () => {
    expect(withEnRoute({ state: base, car: false }, 9_000_000, true, true, new Map()).enRoute).toBe(false);
  });

  test('no space data keeps the count empty', () => {
    const s = withEnRoute({ state: { ...base, spaces: null }, car: true }, 8_100_000, true, false, new Map());
    expect(s).toMatchObject({ enRoute: true, startSpaces: null });
  });
});
