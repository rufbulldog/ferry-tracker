import { computeCrossingMinutes } from '../lambda/collector';

describe('computeCrossingMinutes', () => {
  it('computes whole minutes between departure and arrival', () => {
    const dep = new Date('2026-08-03T08:00:00Z');
    const arr = new Date('2026-08-03T08:35:00Z');
    expect(computeCrossingMinutes(dep, arr)).toBe(35);
  });

  it('rounds to the nearest minute', () => {
    const dep = new Date('2026-08-03T08:00:00Z');
    const arr = new Date('2026-08-03T08:34:40Z'); // 34m40s → 35
    expect(computeCrossingMinutes(dep, arr)).toBe(35);
  });

  it('returns a negative value when arrival precedes departure (caller guards the band)', () => {
    const dep = new Date('2026-08-03T08:00:00Z');
    const arr = new Date('2026-08-03T07:50:00Z');
    expect(computeCrossingMinutes(dep, arr)).toBe(-10);
  });
});
