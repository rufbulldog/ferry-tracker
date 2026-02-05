import { Platform } from 'react-native';
import { terminalsApi } from './client';
import type { TerminalSailingSpace, TerminalBulletins } from './types';

export async function fetchTerminalSailingSpace(): Promise<TerminalSailingSpace[]> {
  // Web uses proxy with different path
  const path = Platform.OS === 'web' ? '/terminals' : '/terminalsailingspace';
  const { data } = await terminalsApi.get<TerminalSailingSpace[]>(path);
  return data;
}

export async function fetchTerminalBulletins(terminalId: number): Promise<TerminalBulletins> {
  // Web uses proxy with different path
  const path = Platform.OS === 'web'
    ? `/bulletins/${terminalId}`
    : `/terminalbulletins/${terminalId}`;
  const { data } = await terminalsApi.get<TerminalBulletins>(path);
  return data;
}
