import {
  buildReliabilityGrid,
  delayBand,
  pickSailing,
  sailingLabel,
  windowAround,
  summarizeSailings,
} from './sailingStats';
import { DepartureSnapshot } from '../types/storage';

const snap = (scheduledTime: string, delayMinutes: number, capacityPercent = 0): DepartureSnapshot => ({
  id: scheduledTime,
  scheduledTime,
  actualTime: null,
  delayMinutes,
  capacityPercent,
  route: 'bainbridge-seattle',
  timestamp: scheduledTime,
});

describe('delayBand', () => {
  test('bands at 3 and 10 minutes', () => {
    expect(delayBand(0)).toBe('onTime');
    expect(delayBand(3)).toBe('onTime');
    expect(delayBand(4)).toBe('late');
    expect(delayBand(9)).toBe('late');
    expect(delayBand(10)).toBe('veryLate');
  });
});

describe('sailingLabel', () => {
  test('12-hour clock with AM/PM', () => {
    expect(sailingLabel(7 * 60 + 55)).toBe('7:55 AM');
    expect(sailingLabel(12 * 60 + 5)).toBe('12:05 PM');
    expect(sailingLabel(17 * 60 + 30)).toBe('5:30 PM');
    expect(sailingLabel(0)).toBe('12:00 AM');
  });
});

describe('summarizeSailings', () => {
  // 2026-10-26..30 is Mon..Fri; 2026-10-31 is a Saturday.
  const data = [
    snap('2026-10-26T07:55:00', 0, 70),
    snap('2026-10-27T07:55:00', 2, 72),
    snap('2026-10-28T07:55:00', 12, 0),
    snap('2026-10-29T07:55:00', 1, 74),
    snap('2026-10-27T08:45:00', 6, 60),
    snap('2026-10-31T07:55:00', 30, 20), // weekend — excluded from weekday
  ];

  test('groups by scheduled clock time, weekdays only', () => {
    const rows = summarizeSailings(data, 'weekday');
    expect(rows.map((r) => r.label)).toEqual(['7:55 AM', '8:45 AM']);
    const s755 = rows[0];
    expect(s755.sampleSize).toBe(4);
    expect(s755.onTimePercent).toBe(75); // 3 of 4 within 3 min
    expect(s755.typicalDelay).toBe(4); // trimmed mean of 0,1,2,12 (4 values trim none) = 3.75
    expect(s755.typicalCapacity).toBe(72); // zeros excluded
  });

  test('after-midnight sailings sort to the end of the service day', () => {
    const rows = summarizeSailings(
      [snap('2026-10-26T00:55:00', 0), snap('2026-10-26T05:20:00', 0), snap('2026-10-26T22:30:00', 0)],
      'weekday',
    );
    expect(rows.map((r) => r.label)).toEqual(['5:20 AM', '10:30 PM', '12:55 AM']);
  });

  test('weekend bucket is separate', () => {
    const rows = summarizeSailings(data, 'weekend');
    expect(rows).toHaveLength(1);
    expect(rows[0].typicalDelay).toBe(30);
  });

  test('empty input', () => {
    expect(summarizeSailings([], 'weekday')).toEqual([]);
    expect(summarizeSailings(undefined, 'weekday')).toEqual([]);
  });

  test('null capacity when none recorded', () => {
    expect(summarizeSailings([snap('2026-10-26T07:55:00', 0)], 'weekday')[0].typicalCapacity).toBeNull();
  });
});

describe('pickSailing', () => {
  const rows = summarizeSailings(
    [snap('2026-10-26T07:05:00', 0), snap('2026-10-26T07:55:00', 0), snap('2026-10-26T08:45:00', 0)],
    'weekday',
  );
  test('first sailing at or after the preferred minute', () => {
    expect(pickSailing(rows, 7 * 60 + 30)?.label).toBe('7:55 AM');
    expect(pickSailing(rows, 7 * 60 + 55)?.label).toBe('7:55 AM');
  });
  test('falls back to the last sailing late in the day', () => {
    expect(pickSailing(rows, 22 * 60)?.label).toBe('8:45 AM');
    expect(pickSailing(rows, 60)?.label).toBe('8:45 AM'); // 1 AM is late in the service day
  });
  test('null when nothing recorded', () => {
    expect(pickSailing([], 0)).toBeNull();
  });
});

describe('buildReliabilityGrid', () => {
  test('rows are sailings, columns the most recent matching days', () => {
    const data = [
      snap('2026-10-26T07:55:00', 0, 70),
      snap('2026-10-27T07:55:00', 5, 0),
      snap('2026-10-28T08:45:00', 11, 90),
      snap('2026-10-31T07:55:00', 2, 10), // Saturday — not in weekday grid
    ];
    const grid = buildReliabilityGrid(data, 'weekday', 10);
    expect(grid.days).toEqual(['2026-10-26', '2026-10-27', '2026-10-28']);
    expect(grid.rows.map((r) => r.label)).toEqual(['7:55 AM', '8:45 AM']);
    expect(grid.rows[0].cells).toEqual([
      { delayMinutes: 0, capacityPercent: 70 },
      { delayMinutes: 5, capacityPercent: null },
      null,
    ]);
    expect(grid.rows[1].cells[2]).toEqual({ delayMinutes: 11, capacityPercent: 90 });
  });

  test('keeps only the last maxDays dates', () => {
    const data = ['26', '27', '28', '29', '30'].map((d) => snap(`2026-10-${d}T07:55:00`, 0));
    const grid = buildReliabilityGrid(data, 'weekday', 3);
    expect(grid.days).toEqual(['2026-10-28', '2026-10-29', '2026-10-30']);
    expect(grid.rows[0].cells).toHaveLength(3);
  });
});

describe('windowAround', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => ({ minuteOfDay: m }));
  const mins = (xs: { minuteOfDay: number }[]) => xs.map((x) => x.minuteOfDay);

  test('centres on the match', () => {
    expect(mins(windowAround(items, 5, 3))).toEqual([4, 5, 6]);
  });
  test('clamps at either end', () => {
    expect(mins(windowAround(items, 1, 3))).toEqual([1, 2, 3]);
    expect(mins(windowAround(items, 9, 3))).toEqual([7, 8, 9]);
  });
  test('short lists and misses', () => {
    expect(windowAround(items.slice(0, 2), 1, 3)).toHaveLength(2);
    expect(mins(windowAround(items, undefined, 3))).toEqual([1, 2, 3]);
  });
});
