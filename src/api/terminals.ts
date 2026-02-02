import { terminalsApi } from './client';
import type { TerminalSailingSpace } from './types';

export async function fetchTerminalSailingSpace(): Promise<TerminalSailingSpace[]> {
  const { data } = await terminalsApi.get<TerminalSailingSpace[]>('/terminalsailingspace');
  return data;
}
