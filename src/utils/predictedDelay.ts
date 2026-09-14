import { addMinutes } from './time';

/**
 * Predicts how late the boat serving an upcoming sailing will actually depart,
 * using MEASURED actuals only — no hardcoded turnaround or crossing time.
 *
 * The rule: a WSF boat never makes up time in transit. If the inbound boat left
 * its previous dock N minutes late, it arrives ~N late and departs your sailing
 * ~N late too, because the published schedule already budgets the turnaround
 * between that arrival and your departure. So the inbound boat's *current*
 * lateness carries straight onto your sailing's scheduled departure. We never
 * trust WSF's catch-up-optimistic `Eta`, and we never add a "+5 min turnaround"
 * or "+35 min crossing" constant — the only arithmetic is a measured delta added
 * to the scheduled time.
 */

// Evening "makes up time when it isn't full" regime. A not-full boat loads
// faster and can leave close to schedule, so a stale predicted delay would tell
// you to leave too late (the dangerous direction — you miss the boat). These two
// thresholds are the ONLY heuristic knobs here, deliberately kept out of the
// delay arithmetic. v1 uses them purely to FLAG the regime so the leave-by
// consumer can plan for an on-time departure; a history-derived recovery amount
// is meant to replace this flag in a later pass.
export const EVENING_RECOVERY_HOUR = 18; // 6pm local
export const RECOVERY_CAPACITY_PERCENT = 60; // inbound boat below this % full counts as "not full"

export type PredictedDelayBasis = 'left-dock' | 'overdue-at-dock' | 'scheduled';

export interface InboundPrediction {
  /** Carried-forward lateness in minutes, floored at 0 (never predicts "early"). */
  predictedDelayMinutes: number;
  /** Your sailing's scheduled time + predictedDelayMinutes. */
  predictedDeparture: Date;
  /** Which measured signal produced the delay. */
  basis: PredictedDelayBasis;
  confidence: 'high' | 'medium' | 'low';
  /** Evening + not-full: the boat may recover, so plan leave-by for on-time. */
  mayRecover: boolean;
}

export interface InboundPredictionInput {
  /** OUR sailing's scheduled departure time. */
  scheduledDeparture: Date;
  /** When the inbound boat actually left its previous dock (its current leg). */
  inboundLeftDock: Date | null;
  /** The inbound boat's scheduled departure for that leg. */
  inboundScheduledDeparture: Date | null;
  /** % full of the inbound boat, from the live terminal feed (null if unknown). */
  incomingVesselCapacity: number | null;
  now: Date;
}

function minutesBetween(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 60_000);
}

export function predictInboundDelay(input: InboundPredictionInput): InboundPrediction {
  const {
    scheduledDeparture,
    inboundLeftDock,
    inboundScheduledDeparture,
    incomingVesselCapacity,
    now,
  } = input;

  let predictedDelayMinutes = 0;
  let basis: PredictedDelayBasis = 'scheduled';
  let confidence: InboundPrediction['confidence'] = 'low';

  if (inboundScheduledDeparture) {
    if (inboundLeftDock) {
      // Measured: the inbound boat has left its previous dock. Its lateness at
      // departure carries forward (it won't make up time crossing).
      predictedDelayMinutes = Math.max(0, minutesBetween(inboundLeftDock, inboundScheduledDeparture));
      basis = 'left-dock';
      confidence = 'high';
    } else if (now.getTime() > inboundScheduledDeparture.getTime()) {
      // Measured: still at the far dock, already past its scheduled inbound
      // departure — a growing, real lateness.
      predictedDelayMinutes = Math.max(0, minutesBetween(now, inboundScheduledDeparture));
      basis = 'overdue-at-dock';
      confidence = 'medium';
    }
    // else: not left yet and not overdue → no measured delay, stays 'scheduled'.
  }

  const predictedDeparture = addMinutes(scheduledDeparture, predictedDelayMinutes);

  const notFull =
    incomingVesselCapacity != null && incomingVesselCapacity < RECOVERY_CAPACITY_PERCENT;
  const mayRecover =
    predictedDelayMinutes > 0 &&
    scheduledDeparture.getHours() >= EVENING_RECOVERY_HOUR &&
    notFull;

  return { predictedDelayMinutes, predictedDeparture, basis, confidence, mayRecover };
}
