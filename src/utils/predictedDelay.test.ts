import {
  predictInboundDelay,
  EVENING_RECOVERY_HOUR,
  RECOVERY_CAPACITY_PERCENT,
  InboundPredictionInput,
} from './predictedDelay';

// Local-time constructor keeps getHours() deterministic regardless of the CI
// machine's timezone (the recovery flag reads the scheduled hour in local time).
const at = (hour: number, minute = 0) => new Date(2026, 7, 3, hour, minute, 0, 0);

const base = (over: Partial<InboundPredictionInput>): InboundPredictionInput => ({
  scheduledDeparture: at(14, 0), // 2:00pm — daytime by default
  inboundLeftDock: null,
  inboundScheduledDeparture: null,
  incomingVesselCapacity: null,
  now: at(13, 50),
  ...over,
});

describe('predictInboundDelay', () => {
  test('inbound left 10 late → sailing predicted 10 late, carried forward', () => {
    const r = predictInboundDelay(
      base({
        scheduledDeparture: at(14, 0),
        inboundScheduledDeparture: at(13, 15),
        inboundLeftDock: at(13, 25), // 10 min late leaving the far dock
      }),
    );
    expect(r.basis).toBe('left-dock');
    expect(r.confidence).toBe('high');
    expect(r.predictedDelayMinutes).toBe(10);
    expect(r.predictedDeparture.getTime()).toBe(at(14, 10).getTime());
  });

  test('no turnaround/crossing constant is added — delay equals the measured delta', () => {
    const r = predictInboundDelay(
      base({
        scheduledDeparture: at(14, 0),
        inboundScheduledDeparture: at(13, 15),
        inboundLeftDock: at(13, 22), // exactly 7 late
      }),
    );
    expect(r.predictedDelayMinutes).toBe(7); // not 7+5 turnaround, not +35 crossing
  });

  test('inbound left early → 0 delay, departs on schedule', () => {
    const r = predictInboundDelay(
      base({
        scheduledDeparture: at(14, 0),
        inboundScheduledDeparture: at(13, 15),
        inboundLeftDock: at(13, 12), // left early
      }),
    );
    expect(r.predictedDelayMinutes).toBe(0);
    expect(r.predictedDeparture.getTime()).toBe(at(14, 0).getTime());
  });

  test('still at far dock, past scheduled inbound departure → overdue-at-dock', () => {
    const r = predictInboundDelay(
      base({
        scheduledDeparture: at(14, 0),
        inboundScheduledDeparture: at(13, 15),
        inboundLeftDock: null,
        now: at(13, 23), // 8 min past, still has not left
      }),
    );
    expect(r.basis).toBe('overdue-at-dock');
    expect(r.confidence).toBe('medium');
    expect(r.predictedDelayMinutes).toBe(8);
  });

  test('not left and not overdue → scheduled, low confidence, 0', () => {
    const r = predictInboundDelay(
      base({
        scheduledDeparture: at(14, 0),
        inboundScheduledDeparture: at(13, 55),
        inboundLeftDock: null,
        now: at(13, 40), // before its scheduled inbound departure
      }),
    );
    expect(r.basis).toBe('scheduled');
    expect(r.confidence).toBe('low');
    expect(r.predictedDelayMinutes).toBe(0);
  });

  test('missing inbound schedule → no prediction even if LeftDock is set', () => {
    const r = predictInboundDelay(
      base({ inboundScheduledDeparture: null, inboundLeftDock: at(13, 25) }),
    );
    expect(r.predictedDelayMinutes).toBe(0);
    expect(r.basis).toBe('scheduled');
  });

  describe('mayRecover (evening, not-full)', () => {
    const eveningLate = {
      inboundScheduledDeparture: at(EVENING_RECOVERY_HOUR, 15),
      inboundLeftDock: at(EVENING_RECOVERY_HOUR, 25), // 10 late
    };

    test('evening + low capacity + delay → true', () => {
      const r = predictInboundDelay(
        base({
          scheduledDeparture: at(EVENING_RECOVERY_HOUR + 1, 0), // 7pm sailing
          ...eveningLate,
          incomingVesselCapacity: RECOVERY_CAPACITY_PERCENT - 20,
        }),
      );
      expect(r.predictedDelayMinutes).toBeGreaterThan(0);
      expect(r.mayRecover).toBe(true);
    });

    test('evening but full boat → false', () => {
      const r = predictInboundDelay(
        base({
          scheduledDeparture: at(EVENING_RECOVERY_HOUR + 1, 0),
          ...eveningLate,
          incomingVesselCapacity: RECOVERY_CAPACITY_PERCENT + 20,
        }),
      );
      expect(r.mayRecover).toBe(false);
    });

    test('evening but capacity unknown (null) → false', () => {
      const r = predictInboundDelay(
        base({
          scheduledDeparture: at(EVENING_RECOVERY_HOUR + 1, 0),
          ...eveningLate,
          incomingVesselCapacity: null,
        }),
      );
      expect(r.mayRecover).toBe(false);
    });

    test('daytime, low capacity, delay → false (only evenings recover)', () => {
      const r = predictInboundDelay(
        base({
          scheduledDeparture: at(14, 0),
          inboundScheduledDeparture: at(13, 15),
          inboundLeftDock: at(13, 25),
          incomingVesselCapacity: 20,
        }),
      );
      expect(r.mayRecover).toBe(false);
    });

    test('evening, low capacity, but on-time boat → false (no delay to recover)', () => {
      const r = predictInboundDelay(
        base({
          scheduledDeparture: at(EVENING_RECOVERY_HOUR + 1, 0),
          inboundScheduledDeparture: at(EVENING_RECOVERY_HOUR, 15),
          inboundLeftDock: at(EVENING_RECOVERY_HOUR, 15), // on time
          incomingVesselCapacity: 20,
        }),
      );
      expect(r.predictedDelayMinutes).toBe(0);
      expect(r.mayRecover).toBe(false);
    });
  });
});
