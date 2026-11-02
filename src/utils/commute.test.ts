import { isAwayFromCommute } from './commute';
import type { KnownLocation } from '../types/location';

const home: KnownLocation = { id: 'home', label: 'Home', lat: 47.64, lon: -122.52 };
const work: KnownLocation = { id: 'work', label: 'Work', lat: 47.61, lon: -122.33 };
const seattleTerminal: KnownLocation = { id: 'seattle-terminal', label: 'Seattle', lat: 47.6023, lon: -122.3384 };

describe('isAwayFromCommute', () => {
  test('near home or work is the commute', () => {
    expect(isAwayFromCommute(47.6405, -122.5205, [home, work], [seattleTerminal])).toBe(false);
    expect(isAwayFromCommute(47.6105, -122.3305, [home, work], [seattleTerminal])).toBe(false);
  });

  test('at a terminal is the commute', () => {
    expect(isAwayFromCommute(47.6025, -122.3386, [home, work], [seattleTerminal])).toBe(false);
  });

  test('Renton or Northgate is away', () => {
    expect(isAwayFromCommute(47.4829, -122.2171, [home, work], [seattleTerminal])).toBe(true);
    expect(isAwayFromCommute(47.7066, -122.3255, [home, work], [seattleTerminal])).toBe(true);
  });

  test('with no saved home/work, only terminals count', () => {
    expect(isAwayFromCommute(47.6105, -122.3305, [], [seattleTerminal])).toBe(true);
    expect(isAwayFromCommute(47.6025, -122.3386, [], [seattleTerminal])).toBe(false);
  });
});
