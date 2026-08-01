import {
  effectiveFerryDeparture,
  deriveSailingIntervalMinutes,
  FerryDepartureLike,
} from './ferryDeparture';

const base = (over: Partial<FerryDepartureLike>): FerryDepartureLike => ({
  status: 'scheduled',
  scheduledDeparture: new Date('2026-08-03T16:45:00-07:00'),
  estimatedDeparture: null,
  actualDeparture: null,
  ...over,
});

describe('effectiveFerryDeparture', () => {
  test('scheduled with no estimate → scheduled, no delay', () => {
    const r = effectiveFerryDeparture(base({}));
    expect(r.basis).toBe('scheduled');
    expect(r.delayMinutes).toBe(0);
    expect(r.isDelayed).toBe(false);
  });

  test('actual departure drives time and delay', () => {
    const r = effectiveFerryDeparture(
      base({
        status: 'departed',
        actualDeparture: new Date('2026-08-03T16:49:00-07:00'),
      }),
    );
    expect(r.basis).toBe('actual');
    expect(r.delayMinutes).toBe(4);
    expect(r.isDelayed).toBe(true);
    expect(r.time.toISOString()).toBe(new Date('2026-08-03T16:49:00-07:00').toISOString());
  });

  test('actual earlier than scheduled floors delay at 0', () => {
    const r = effectiveFerryDeparture(
      base({
        status: 'departed',
        actualDeparture: new Date('2026-08-03T16:43:00-07:00'),
      }),
    );
    expect(r.delayMinutes).toBe(0);
    expect(r.isDelayed).toBe(false);
  });

  test('later estimate is used (arriving-late boat now shows a delay)', () => {
    const r = effectiveFerryDeparture(
      base({
        status: 'arriving',
        estimatedDeparture: new Date('2026-08-03T16:55:00-07:00'),
      }),
    );
    expect(r.basis).toBe('estimated');
    expect(r.delayMinutes).toBe(10);
    expect(r.isDelayed).toBe(true);
  });

  test('estimate earlier than scheduled keeps scheduled', () => {
    const r = effectiveFerryDeparture(
      base({
        status: 'arriving',
        estimatedDeparture: new Date('2026-08-03T16:40:00-07:00'),
      }),
    );
    expect(r.basis).toBe('scheduled');
    expect(r.delayMinutes).toBe(0);
  });

  test('actual wins over estimate', () => {
    const r = effectiveFerryDeparture(
      base({
        status: 'departed',
        estimatedDeparture: new Date('2026-08-03T17:10:00-07:00'),
        actualDeparture: new Date('2026-08-03T16:47:00-07:00'),
      }),
    );
    expect(r.basis).toBe('actual');
    expect(r.delayMinutes).toBe(2);
  });
});

describe('deriveSailingIntervalMinutes', () => {
  test('returns fallback with fewer than two sailings', () => {
    expect(deriveSailingIntervalMinutes([], 45)).toBe(45);
    expect(deriveSailingIntervalMinutes([new Date('2026-08-03T16:45:00-07:00')], 45)).toBe(45);
  });

  test('median gap of evenly spaced sailings', () => {
    const times = [
      new Date('2026-08-03T16:00:00-07:00'),
      new Date('2026-08-03T16:50:00-07:00'),
      new Date('2026-08-03T17:40:00-07:00'),
    ];
    expect(deriveSailingIntervalMinutes(times, 45)).toBe(50);
  });

  test('median ignores a single outsized gap', () => {
    const times = [
      new Date('2026-08-03T06:00:00-07:00'),
      new Date('2026-08-03T06:40:00-07:00'), // 40
      new Date('2026-08-03T07:20:00-07:00'), // 40
      new Date('2026-08-03T12:00:00-07:00'), // 280 (service gap)
    ];
    // gaps [40,40,280] → median 40
    expect(deriveSailingIntervalMinutes(times, 60)).toBe(40);
  });

  test('unsorted input is handled', () => {
    const times = [
      new Date('2026-08-03T17:40:00-07:00'),
      new Date('2026-08-03T16:00:00-07:00'),
      new Date('2026-08-03T16:50:00-07:00'),
    ];
    expect(deriveSailingIntervalMinutes(times, 45)).toBe(50);
  });
});
