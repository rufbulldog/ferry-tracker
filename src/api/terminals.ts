import { Platform } from 'react-native';
import { terminalsApi } from './client';
import type { TerminalSailingSpace } from './types';

export async function fetchTerminalSailingSpace(): Promise<TerminalSailingSpace[]> {
  // Web uses proxy with different path
  const path = Platform.OS === 'web' ? '/terminals' : '/terminalsailingspace';
  const { data } = await terminalsApi.get<TerminalSailingSpace[]>(path);
  return data;
}
