import { getCheckIn, setCheckIn, clearCheckIn, subscribeCheckIn, CheckIn } from './checkIn';

const sample: CheckIn = {
  route: 'seattle-bainbridge',
  vesselId: 18,
  scheduledDeparture: Date.parse('2026-08-03T16:45:00-07:00'),
  checkedInAt: Date.parse('2026-08-03T16:40:00-07:00'),
};

afterEach(() => clearCheckIn());

describe('checkIn store', () => {
  test('starts empty', () => {
    expect(getCheckIn()).toBeNull();
  });

  test('set then get returns the pin', () => {
    setCheckIn(sample);
    expect(getCheckIn()).toEqual(sample);
  });

  test('clear removes the pin', () => {
    setCheckIn(sample);
    clearCheckIn();
    expect(getCheckIn()).toBeNull();
  });

  test('notifies subscribers on set and clear', () => {
    const calls: (CheckIn | null)[] = [];
    const unsub = subscribeCheckIn(() => calls.push(getCheckIn()));

    setCheckIn(sample);
    clearCheckIn();
    unsub();
    setCheckIn(sample); // after unsubscribe — should not be recorded

    expect(calls).toEqual([sample, null]);
  });

  test('clear on an empty store does not notify', () => {
    let count = 0;
    const unsub = subscribeCheckIn(() => count++);
    clearCheckIn();
    unsub();
    expect(count).toBe(0);
  });
});
