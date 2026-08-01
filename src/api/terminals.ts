import { terminalsApi } from './client';
import type { TerminalSailingSpace, TerminalBulletins, TerminalWaitTimes } from './types';

export async function fetchTerminalSailingSpace(): Promise<TerminalSailingSpace[]> {
  const { data } = await terminalsApi.get<TerminalSailingSpace[]>('/terminals');
  return data;
}

export async function fetchTerminalBulletins(terminalId: number): Promise<TerminalBulletins> {
  const { data } = await terminalsApi.get<TerminalBulletins>(`/bulletins/${terminalId}`);
  return data;
}

export async function fetchTerminalWaitTimes(terminalId: number): Promise<TerminalWaitTimes> {
  const { data } = await terminalsApi.get<TerminalWaitTimes>(`/waittimes/${terminalId}`);
  return data;
}
