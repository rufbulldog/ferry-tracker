/**
 * Kingston terminal vehicle boarding-pass schedule.
 *
 * WSF introduced a vehicle boarding-pass system at the Kingston terminal in
 * May 2026. A pass is required (for vehicles, 8 AM–8 PM local) to hold your
 * place in line — separate from the ferry ticket. Cyclists, motorcycles, and
 * medical-priority riders are exempt.
 *
 * There is NO structured field for this anywhere in the WSDOT Ferries API, so
 * we model the published schedule deterministically here:
 *   - Summer season: required DAILY.
 *   - Winter season: required WEEKENDS & HOLIDAYS only.
 *   - Same daily window either way: 8 AM–8 PM Pacific.
 *
 * The requirement is defined in Pacific time, so we derive the day/hour in
 * `America/Los_Angeles` rather than trusting the device time zone (Hermes on
 * Expo SDK 54 ships full Intl with time-zone support; Jest runs on Node ICU).
 *
 * Season/holiday dates below are WSF's published values and MUST be refreshed
 * when WSF publishes the next season — outside every known season the status is
 * reported as `known: false` and callers should render nothing.
 */

const PACIFIC_TZ = 'America/Los_Angeles';

const WINDOW_START_HOUR = 8; // 8 AM
const WINDOW_END_HOUR = 20; // 8 PM

export type BoardingPassRule = 'daily' | 'weekends-holidays';

interface Season {
  /** Inclusive ISO date (YYYY-MM-DD) in Pacific time. */
  start: string;
  /** Inclusive ISO date (YYYY-MM-DD) in Pacific time. */
  end: string;
  rule: BoardingPassRule;
}

// Ordered, non-overlapping seasons. Update when WSF publishes new dates.
const SEASONS: Season[] = [
  // Summer 2026 — program launched Mother's Day weekend 2026; required daily.
  { start: '2026-05-08', end: '2026-10-12', rule: 'daily' },
  // Winter 2026–27 — weekends & holidays only. End date is approximate (the day
  // before the 2027 summer season is expected to begin); refresh when WSF
  // publishes the 2027 summer schedule so we don't assert past known data.
  { start: '2026-10-13', end: '2027-05-14', rule: 'weekends-holidays' },
];

// Best-effort list of days WSF treats as holidays during the winter season.
// Kept as explicit Pacific ISO dates so it's trivial to reconcile against WSF's
// published holiday list. Only consulted for `weekends-holidays` seasons.
const WINTER_HOLIDAYS = new Set<string>([
  '2026-11-11', // Veterans Day
  '2026-11-26', // Thanksgiving Day
  '2026-12-25', // Christmas Day
  '2027-01-01', // New Year's Day
  '2027-01-18', // Martin Luther King Jr. Day
  '2027-02-15', // Presidents Day
]);

export interface KingstonBoardingPassStatus {
  /** True when `now` falls inside a known season; false ⇒ render nothing. */
  known: boolean;
  /** True when a pass is required at some point today (season + day rules). */
  requiredToday: boolean;
  /** True when a pass is required right now (requiredToday AND inside window). */
  activeNow: boolean;
  /** Which season rule applied, or null when `known` is false. */
  rule: BoardingPassRule | null;
  startHour: number;
  endHour: number;
  /** Short, display-ready headline (empty when `known` is false). */
  headline: string;
  /** One-line supporting detail (empty when `known` is false). */
  detail: string;
}

interface PacificParts {
  isoDate: string; // YYYY-MM-DD
  hour: number; // 0-23
  weekday: number; // 0=Sun … 6=Sat
}

function getPacificParts(date: Date): PacificParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PACIFIC_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const year = get('year');
  const month = get('month');
  const day = get('day');
  // hour12:false can emit '24' at midnight in some engines — normalize to 0-23.
  const hour = Number(get('hour')) % 24;

  // Weekday of the calendar date is time-zone-independent once we have the
  // Pacific Y/M/D, so compute it from a UTC date to avoid any offset ambiguity.
  const weekday = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).getUTCDay();

  return { isoDate: `${year}-${month}-${day}`, hour, weekday };
}

/**
 * Resolve the Kingston boarding-pass status for a given instant.
 * Pass the current time; defaults to now.
 */
export function getKingstonBoardingPassStatus(now: Date = new Date()): KingstonBoardingPassStatus {
  const { isoDate, hour, weekday } = getPacificParts(now);
  const base = { startHour: WINDOW_START_HOUR, endHour: WINDOW_END_HOUR };

  const season = SEASONS.find((s) => isoDate >= s.start && isoDate <= s.end);
  if (!season) {
    return { known: false, requiredToday: false, activeNow: false, rule: null, headline: '', detail: '', ...base };
  }

  const isWeekend = weekday === 0 || weekday === 6;
  const isHoliday = WINTER_HOLIDAYS.has(isoDate);
  const requiredToday = season.rule === 'daily' ? true : isWeekend || isHoliday;
  const withinWindow = hour >= WINDOW_START_HOUR && hour < WINDOW_END_HOUR;
  const activeNow = requiredToday && withinWindow;

  let headline: string;
  let detail: string;
  if (!requiredToday) {
    headline = 'No boarding pass needed today';
    detail = 'Kingston requires one on weekends & holidays only this season.';
  } else if (activeNow) {
    headline = 'Boarding pass required now';
    detail = 'Vehicles need one to hold a place in line at Kingston — in effect until 8 PM.';
  } else if (hour < WINDOW_START_HOUR) {
    headline = 'Boarding pass required today';
    detail = 'In effect 8 AM–8 PM for vehicles at Kingston.';
  } else {
    headline = 'Boarding pass not needed right now';
    detail = 'Required again 8 AM–8 PM for vehicles at Kingston.';
  }

  return { known: true, requiredToday, activeNow, rule: season.rule, headline, detail, ...base };
}
