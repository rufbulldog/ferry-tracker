import { capacityTone, percentFull, filledBars, carsPerBar } from './capacityMeter';

describe('capacityTone', () => {
  test('room below 50%, filling to 85%, nearly full above', () => {
    expect(capacityTone(0)).toBe('room');
    expect(capacityTone(49)).toBe('room');
    expect(capacityTone(50)).toBe('filling');
    expect(capacityTone(84)).toBe('filling');
    expect(capacityTone(85)).toBe('nearlyFull');
    expect(capacityTone(100)).toBe('nearlyFull');
  });
});

describe('percentFull', () => {
  test('null without space data', () => {
    expect(percentFull(null, 200)).toBeNull();
    expect(percentFull(10, 0)).toBeNull();
  });

  test('share of spaces taken, clamped to 0–100', () => {
    expect(percentFull(161, 196)).toBeCloseTo(17.86, 1);
    expect(percentFull(0, 196)).toBe(100);
    expect(percentFull(250, 196)).toBe(0);
  });
});

describe('filledBars', () => {
  test('empty deck lights nothing', () => {
    expect(filledBars(0)).toBe(0);
  });

  test('a few cars light at least one bar', () => {
    expect(filledBars(0.5)).toBe(1);
  });

  test('scales to the bar count', () => {
    expect(filledBars(18)).toBe(7);
    expect(filledBars(100)).toBe(40);
    expect(filledBars(50, 10)).toBe(5);
  });
});

describe('carsPerBar', () => {
  test('rounds and never drops below one', () => {
    expect(carsPerBar(196)).toBe(5);
    expect(carsPerBar(10)).toBe(1);
  });
});
