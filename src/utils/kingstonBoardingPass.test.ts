/**
 * Tests for src/utils/kingstonBoardingPass.ts
 *
 * All fixture dates are constructed with an explicit Pacific UTC offset
 * (-07:00 during PDT, -08:00 during PST) so the assertions are independent of
 * the machine/CI time zone. The helper derives day/hour in America/Los_Angeles.
 */

import { getKingstonBoardingPassStatus } from './kingstonBoardingPass';

describe('getKingstonBoardingPassStatus', () => {
  describe('summer season (daily requirement)', () => {
    // 2026-07-15 is a Wednesday; PDT offset is -07:00.
    test('weekday midday is active', () => {
      const s = getKingstonBoardingPassStatus(new Date('2026-07-15T12:00:00-07:00'));
      expect(s.known).toBe(true);
      expect(s.rule).toBe('daily');
      expect(s.requiredToday).toBe(true);
      expect(s.activeNow).toBe(true);
      expect(s.headline).toMatch(/required now/i);
    });

    test('weekend midday is still active (daily rule)', () => {
      // 2026-07-18 is a Saturday.
      const s = getKingstonBoardingPassStatus(new Date('2026-07-18T13:30:00-07:00'));
      expect(s.requiredToday).toBe(true);
      expect(s.activeNow).toBe(true);
    });

    test('before 8 AM: required today but not active yet', () => {
      const s = getKingstonBoardingPassStatus(new Date('2026-07-15T06:30:00-07:00'));
      expect(s.requiredToday).toBe(true);
      expect(s.activeNow).toBe(false);
      expect(s.headline).toMatch(/required today/i);
    });

    test('after 8 PM: not active for the rest of the day', () => {
      const s = getKingstonBoardingPassStatus(new Date('2026-07-15T21:15:00-07:00'));
      expect(s.requiredToday).toBe(true);
      expect(s.activeNow).toBe(false);
      expect(s.headline).toMatch(/not needed right now/i);
    });
  });

  describe('window boundaries (Pacific)', () => {
    test('exactly 8:00 AM is active', () => {
      const s = getKingstonBoardingPassStatus(new Date('2026-07-15T08:00:00-07:00'));
      expect(s.activeNow).toBe(true);
    });

    test('exactly 8:00 PM is no longer active', () => {
      const s = getKingstonBoardingPassStatus(new Date('2026-07-15T20:00:00-07:00'));
      expect(s.activeNow).toBe(false);
    });

    test('7:59 PM is still active', () => {
      const s = getKingstonBoardingPassStatus(new Date('2026-07-15T19:59:00-07:00'));
      expect(s.activeNow).toBe(true);
    });
  });

  describe('winter season (weekends & holidays only)', () => {
    // PST offset is -08:00.
    test('weekday midday is not required', () => {
      // 2026-11-04 is a Wednesday, not a holiday.
      const s = getKingstonBoardingPassStatus(new Date('2026-11-04T12:00:00-08:00'));
      expect(s.known).toBe(true);
      expect(s.rule).toBe('weekends-holidays');
      expect(s.requiredToday).toBe(false);
      expect(s.activeNow).toBe(false);
      expect(s.headline).toMatch(/no boarding pass needed/i);
    });

    test('weekend midday is active', () => {
      // 2026-11-07 is a Saturday.
      const s = getKingstonBoardingPassStatus(new Date('2026-11-07T12:00:00-08:00'));
      expect(s.requiredToday).toBe(true);
      expect(s.activeNow).toBe(true);
    });

    test('a listed holiday on a weekday is active', () => {
      // 2026-11-11 Veterans Day falls on a Wednesday.
      const s = getKingstonBoardingPassStatus(new Date('2026-11-11T12:00:00-08:00'));
      expect(s.requiredToday).toBe(true);
      expect(s.activeNow).toBe(true);
    });
  });

  describe('season boundary transition', () => {
    test('last summer day (Oct 12) is daily', () => {
      // 2026-10-12 is a Monday — daily rule means required.
      const s = getKingstonBoardingPassStatus(new Date('2026-10-12T12:00:00-07:00'));
      expect(s.rule).toBe('daily');
      expect(s.requiredToday).toBe(true);
    });

    test('first winter day (Oct 13, a Tuesday) is not required', () => {
      const s = getKingstonBoardingPassStatus(new Date('2026-10-13T12:00:00-07:00'));
      expect(s.rule).toBe('weekends-holidays');
      expect(s.requiredToday).toBe(false);
    });
  });

  describe('outside known seasons', () => {
    test('before the program launched is unknown', () => {
      const s = getKingstonBoardingPassStatus(new Date('2026-04-01T12:00:00-07:00'));
      expect(s.known).toBe(false);
      expect(s.rule).toBeNull();
      expect(s.headline).toBe('');
    });

    test('past the last known season is unknown', () => {
      const s = getKingstonBoardingPassStatus(new Date('2027-06-01T12:00:00-07:00'));
      expect(s.known).toBe(false);
    });
  });
});
