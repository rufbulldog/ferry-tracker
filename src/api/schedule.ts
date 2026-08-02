import { scheduleApi } from './client';
import type { ScheduledSailing, ScheduleByDateResponse, ValidDateRange } from './types';

export async function fetchScheduleToday(
  routeId: number,
  onlyRemainingTimes: boolean = true
): Promise<ScheduledSailing[]> {
  const { data } = await scheduleApi.get<ScheduledSailing[]>(
    `/schedule/${routeId}/${onlyRemainingTimes}`
  );
  return data;
}

/**
 * Full sailing schedule for a specific date and terminal pair (future planning).
 * `tripDate` is YYYY-MM-DD.
 */
export async function fetchScheduleForDate(
  tripDate: string,
  departingTerminalId: number,
  arrivingTerminalId: number,
): Promise<ScheduleByDateResponse> {
  const { data } = await scheduleApi.get<ScheduleByDateResponse>(
    `/schedule-date/${tripDate}/${departingTerminalId}/${arrivingTerminalId}`,
  );
  return data;
}

/** The date window WSF currently publishes schedules for. */
export async function fetchValidDateRange(): Promise<ValidDateRange> {
  const { data } = await scheduleApi.get<ValidDateRange>('/schedule-validrange');
  return data;
}
