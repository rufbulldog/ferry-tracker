import { computeArrival } from './arrivalPlan';
import { FERRY_TO_HOME_FALLBACK_MINUTES, crossingMinutesForRoute } from './constants';
import { TransitRecord, DepartureSnapshot } from '../types/storage';

const rec = (route: TransitRecord['route'], vehicle: TransitRecord['vehicle'], seconds: number): TransitRecord => ({
  id: `${route}-${vehicle}-${seconds}`,
  route,
  vehicle,
  durationSeconds: seconds,
  timestamp: '2026-07-01T08:00:00Z',
});

const crossingSnap = (i: number, minutes: number): DepartureSnapshot => ({
  id: `s${i}`,
  scheduledTime: '2026-07-01T08:00:00Z',
  actualTime: null,
  delayMinutes: 0,
  capacityPercent: 50,
  route: 'bainbridge-seattle',
  timestamp: '2026-07-01T08:00:00Z',
  crossingMinutes: minutes,
});

const departure = new Date('2026-10-30T12:55:00-07:00');
const minutesAfter = (d: Date, m: number) => new Date(d.getTime() + m * 60_000).toISOString();

describe('computeArrival', () => {
  test('null for routes without an arrival config', () => {
    expect(
      computeArrival({ route: 'kingston-edmonds', departureTime: departure, transitRecords: [], trends: [] })
    ).toBeNull();
  });

  test('starts from the given departure, not some other sailing', () => {
    // Regression: the leave-by card showed "At office by 12:20" for a 12:55
    // sailing because arrival was computed from the boat already underway.
    const a = computeArrival({
      route: 'bainbridge-seattle',
      departureTime: departure,
      transitRecords: [rec('ferry-to-work', 'bike', 17 * 60)],
      trends: [],
    })!;
    const crossing = crossingMinutesForRoute('bainbridge-seattle');
    expect(a.ferryArrivalTime!.toISOString()).toBe(minutesAfter(departure, crossing));
    expect(a.etaTime!.toISOString()).toBe(minutesAfter(departure, crossing + 17));
    expect(a.etaTime!.getTime()).toBeGreaterThan(departure.getTime());
    expect(a.label).toBe('At office by');
    expect(a.sampleSize).toBe(1);
  });

  test('uses the live vessel Eta when it is after departure', () => {
    const liveEta = new Date(departure.getTime() + 40 * 60_000);
    const a = computeArrival({
      route: 'seattle-bainbridge',
      departureTime: departure,
      liveEta,
      transitRecords: [],
      trends: [],
    })!;
    expect(a.ferryArrivalTime).toBe(liveEta);
    expect(a.transitMinutes).toBe(FERRY_TO_HOME_FALLBACK_MINUTES);
    expect(a.transitMethod).toBe('default');
  });

  test('ignores a live Eta that is not after departure', () => {
    const a = computeArrival({
      route: 'seattle-bainbridge',
      departureTime: departure,
      liveEta: new Date(departure.getTime() - 60_000),
      transitRecords: [],
      trends: [],
    })!;
    expect(a.ferryArrivalTime!.toISOString()).toBe(
      minutesAfter(departure, crossingMinutesForRoute('seattle-bainbridge'))
    );
  });

  test('uses the measured typical crossing once there is enough history', () => {
    const trends = [crossingSnap(1, 33), crossingSnap(2, 33), crossingSnap(3, 33)];
    const a = computeArrival({ route: 'bainbridge-seattle', departureTime: departure, transitRecords: [], trends })!;
    expect(a.ferryArrivalTime!.toISOString()).toBe(minutesAfter(departure, 33));
  });

  test('only counts far-side records for the configured leg', () => {
    const a = computeArrival({
      route: 'bainbridge-seattle',
      departureTime: departure,
      transitRecords: [rec('ferry-to-home', 'bike', 30 * 60), rec('home-to-ferry', 'car', 9 * 60)],
      trends: [],
    })!;
    expect(a.transitMethod).toBe('default');
    expect(a.transitMinutes).toBe(15);
  });
});
