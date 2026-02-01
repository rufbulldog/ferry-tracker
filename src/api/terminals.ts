import { terminalsApi } from './client';
import type { TerminalCondition, TerminalWaitTime } from './types';

export async function fetchTerminalConditions(): Promise<TerminalCondition[]> {
  const { data } = await terminalsApi.get<TerminalCondition[]>('/terminalconditions');
  return data;
}

export async function fetchTerminalWaitTime(terminalId: number): Promise<TerminalWaitTime> {
  const { data } = await terminalsApi.get<TerminalWaitTime>(`/terminalwaittimes/${terminalId}`);
  return data;
}
