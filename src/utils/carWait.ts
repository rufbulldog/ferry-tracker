/**
 * Estimate the *extra* wait a driver faces beyond the ferry's own departure,
 * because a full boat leaves drive-up vehicles behind for a later sailing.
 * Walk-ons and bikes essentially always board, so this only applies to cars.
 *
 * There is no authoritative "cars left behind" feed, so we combine every signal
 * we have, each failing safe to the next (highest-confidence first):
 *   1. WSF vehicle wait-time note  (terminalwaittimes) — free text, often empty
 *   2. WSF alert/bulletin text     — free text like "2 sailing wait"
 *   3. Live drive-up capacity       — ~0 spaces left now ⇒ likely miss it
 *   4. Historical typical capacity  — this hour/weekday usually fills ⇒ risk
 *
 * All text signals are best-effort: the parsers return null on anything they
 * don't recognize, and the estimator falls through to the structured signals.
 */

export type CarWaitReason = 'wait-note' | 'alert' | 'live-full' | 'history' | 'none';
export type CarWaitConfidence = 'high' | 'medium' | 'low';

export interface CarWaitEstimate {
  /** Whole sailings you'll likely wait beyond this one (0 = you make it). */
  extraSailings: number;
  /** extraSailings priced in minutes (parsed minutes win when given directly). */
  extraMinutes: number;
  /** True when there's meaningful overflow risk even if extraSailings is 0. */
  atRisk: boolean;
  reason: CarWaitReason;
  confidence: CarWaitConfidence;
  /** Short human-readable justification, or null when reason === 'none'. */
  note: string | null;
}

interface ParsedWait {
  sailings?: number;
  minutes?: number;
}

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
};

/**
 * Pull a wait quantity out of free text. Recognizes:
 *   "1 sailing wait", "2-sailing wait", "two sailings",
 *   "2 hour wait", "90 minute wait".
 * Sailings take priority over a duration when both appear.
 */
function parseWaitText(text: string | null | undefined): ParsedWait | null {
  if (!text) return null;
  const t = text.toLowerCase();

  // "<n> sailing(s)" — digit or small word number.
  const digitSail = t.match(/(\d+)\s*[-\s]?\s*sailing/);
  if (digitSail) return { sailings: parseInt(digitSail[1], 10) };
  const wordSail = t.match(/\b(one|two|three|four|five)\s*[-\s]?\s*sailing/);
  if (wordSail) return { sailings: WORD_NUMBERS[wordSail[1]] };

  // Duration-based waits.
  const hours = t.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\b/);
  if (hours) return { minutes: Math.round(parseFloat(hours[1]) * 60) };
  const mins = t.match(/(\d+)\s*(?:minutes?|mins?)\b/);
  if (mins) return { minutes: parseInt(mins[1], 10) };

  return null;
}

/** Parse a WSF terminalwaittimes note (vehicle wait). */
export function parseVehicleWaitNote(text: string | null | undefined): ParsedWait | null {
  return parseWaitText(text);
}

/**
 * Parse a WSF alert/bulletin, but only when it actually concerns vehicle waits —
 * a generic "delayed" alert shouldn't be read as an overflow wait.
 */
export function parseWaitFromAlert(text: string | null | undefined): ParsedWait | null {
  if (!text) return null;
  const t = text.toLowerCase();
  const mentionsVehicles = /\b(vehicle|car|drive[- ]?up|traffic|wait)\b/.test(t);
  if (!mentionsVehicles) return null;
  return parseWaitText(t);
}

export interface CarWaitInputs {
  /** Live drive-up spaces remaining for the next sailing (null = unknown). */
  liveDriveUpSpaces: number | null;
  maxSpaces: number;
  /** Typical capacity % for this hour/weekday from history (null = unknown). */
  historicalCapacityPercent: number | null;
  historicalSampleSize: number;
  /** WSF terminalwaittimes note text (null/empty when none). */
  waitNoteText: string | null;
  /** Active WSF alert text (null when none). */
  alertText: string | null;
  /** Minutes between consecutive sailings, for pricing a missed boat. */
  sailingIntervalMinutes: number;
}

// A boat this full is treated as effectively no room for one more drive-up car.
const FULL_SPACES_THRESHOLD = 2;
const FULL_PERCENT_THRESHOLD = 98;
// "Filling" — real risk, but not a guaranteed miss.
const RISK_PERCENT_THRESHOLD = 85;
// Minimum history before we'll lean on a "usually full" inference.
const HISTORY_MIN_SAMPLES = 3;

function priceSailings(sailings: number, intervalMinutes: number): number {
  return sailings * intervalMinutes;
}

const NONE: CarWaitEstimate = {
  extraSailings: 0,
  extraMinutes: 0,
  atRisk: false,
  reason: 'none',
  confidence: 'low',
  note: null,
};

/**
 * Combine all available signals into a single car-wait estimate. Pure and
 * deterministic; callers supply the live/historical/text inputs.
 */
export function estimateCarWait(inp: CarWaitInputs): CarWaitEstimate {
  const interval = inp.sailingIntervalMinutes;

  // 1. WSF vehicle wait-time note (most authoritative when present).
  const note = parseVehicleWaitNote(inp.waitNoteText);
  if (note) {
    const sailings = note.sailings ?? Math.max(1, Math.round((note.minutes ?? 0) / Math.max(interval, 1)));
    const extraMinutes = note.minutes ?? priceSailings(sailings, interval);
    return {
      extraSailings: sailings,
      extraMinutes,
      atRisk: true,
      reason: 'wait-note',
      confidence: 'high',
      note: note.minutes && !note.sailings ? `WSF: ~${note.minutes} min vehicle wait` : `WSF: ~${sailings}-sailing vehicle wait`,
    };
  }

  // 2. WSF alert text mentioning a vehicle wait.
  const alert = parseWaitFromAlert(inp.alertText);
  if (alert) {
    const sailings = alert.sailings ?? Math.max(1, Math.round((alert.minutes ?? 0) / Math.max(interval, 1)));
    const extraMinutes = alert.minutes ?? priceSailings(sailings, interval);
    return {
      extraSailings: sailings,
      extraMinutes,
      atRisk: true,
      reason: 'alert',
      confidence: 'high',
      note: alert.minutes && !alert.sailings ? `Alert: ~${alert.minutes} min vehicle wait` : `Alert: ~${sailings}-sailing wait`,
    };
  }

  // 3. Live capacity for the next sailing.
  if (inp.liveDriveUpSpaces !== null && inp.maxSpaces > 0) {
    const fillPercent = ((inp.maxSpaces - inp.liveDriveUpSpaces) / inp.maxSpaces) * 100;
    if (inp.liveDriveUpSpaces <= FULL_SPACES_THRESHOLD || fillPercent >= FULL_PERCENT_THRESHOLD) {
      return {
        extraSailings: 1,
        extraMinutes: priceSailings(1, interval),
        atRisk: true,
        reason: 'live-full',
        confidence: 'high',
        note: `Only ${inp.liveDriveUpSpaces} drive-up space${inp.liveDriveUpSpaces === 1 ? '' : 's'} left`,
      };
    }
    if (fillPercent >= RISK_PERCENT_THRESHOLD) {
      return {
        extraSailings: 0,
        extraMinutes: 0,
        atRisk: true,
        reason: 'live-full',
        confidence: 'medium',
        note: `${Math.round(fillPercent)}% full — cars may not make it`,
      };
    }
    // Live data says there's room → trust it over stale history.
    return NONE;
  }

  // 4. Historical typical capacity for this slot.
  if (inp.historicalCapacityPercent !== null && inp.historicalSampleSize >= HISTORY_MIN_SAMPLES) {
    if (inp.historicalCapacityPercent >= FULL_PERCENT_THRESHOLD) {
      return {
        extraSailings: 1,
        extraMinutes: priceSailings(1, interval),
        atRisk: true,
        reason: 'history',
        confidence: 'low',
        note: `Usually ~${Math.round(inp.historicalCapacityPercent)}% full at this time`,
      };
    }
    if (inp.historicalCapacityPercent >= RISK_PERCENT_THRESHOLD) {
      return {
        extraSailings: 0,
        extraMinutes: 0,
        atRisk: true,
        reason: 'history',
        confidence: 'low',
        note: `Often ~${Math.round(inp.historicalCapacityPercent)}% full at this time`,
      };
    }
  }

  return NONE;
}
