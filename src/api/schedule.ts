import { scheduleApi } from './client';
import type { ScheduledSailing } from './types';

export async function fetchScheduleToday(
  routeId: number,
  onlyRemainingTimes: boolean = true
): Promise<ScheduledSailing[]> {
  const { data } = await scheduleApi.get<ScheduledSailing[]>(
    `/schedule/${routeId}/${onlyRemainingTimes}`
  );
  return data;
}
