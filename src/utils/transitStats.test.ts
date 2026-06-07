import { computeTypicalTransitSeconds } from './transitStats';

const recs = (...durations: number[]) => durations.map(durationSeconds => ({ durationSeconds }));

describe('computeTypicalTransitSeconds', () => {
  test('returns null for no records', () => {
    expect(computeTypicalTransitSeconds([])).toBeNull();
  });

  test('N=1 → raw value', () => {
    expect(computeTypicalTransitSeconds(recs(300))).toEqual({
      seconds: 300,
      method: 'raw',
      sampleSize: 1,
    });
  });

  test('N=2 → median (mean of the two)', () => {
    expect(computeTypicalTransitSeconds(recs(100, 200))).toEqual({
      seconds: 150,
      method: 'median',
      sampleSize: 2,
    });
  });

  test('N=3 → median (middle value, input order independent)', () => {
    expect(computeTypicalTransitSeconds(recs(300, 100, 200))).toEqual({
      seconds: 200,
      method: 'median',
      sampleSize: 3,
    });
  });

  test('N=4 → median (mean of the middle two)', () => {
    expect(computeTypicalTransitSeconds(recs(400, 100, 300, 200))).toEqual({
      seconds: 250,
      method: 'median',
      sampleSize: 4,
    });
  });

  test('N=5 → 20% trimmed mean (drops one value each end)', () => {
    expect(computeTypicalTransitSeconds(recs(100, 200, 300, 400, 500))).toEqual({
      seconds: 300,
      method: 'trimmed-mean',
      sampleSize: 5,
    });
  });

  test('N=10 → trimmed mean drops the two extremes at each end', () => {
    // sorted: [1, 2, 100, 100, 100, 100, 100, 100, 9998, 9999]
    // trim 2 each end → middle six are all 100 → mean 100 (outliers dropped)
    expect(
      computeTypicalTransitSeconds(recs(1, 2, 100, 100, 100, 100, 100, 100, 9998, 9999)),
    ).toEqual({ seconds: 100, method: 'trimmed-mean', sampleSize: 10 });
  });
});
