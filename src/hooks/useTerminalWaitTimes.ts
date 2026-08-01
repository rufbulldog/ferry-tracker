import { useQuery } from '@tanstack/react-query';
import { fetchTerminalWaitTimes } from '../api/terminals';
import type { WaitTime } from '../api/types';

/**
 * WSF vehicle wait-time notes for a terminal. The `/wsf/waittimes/{id}` proxy
 * route must be deployed (CDK) for this to return data; until then the request
 * 404s and we degrade to `notes: null` — car-wait estimation falls back to the
 * other signals. Never throws to the UI.
 */
export function useTerminalWaitTimes(terminalId: number) {
  const { data } = useQuery({
    queryKey: ['terminalWaitTimes', terminalId],
    queryFn: () => fetchTerminalWaitTimes(terminalId),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    // Backend route may not be deployed yet — don't hammer or surface errors.
    retry: false,
  });

  // Join every non-empty note so the parser can scan across route rows.
  const notes = (data?.WaitTimes ?? [])
    .map((w: WaitTime) => w.WaitTimeNotes?.trim())
    .filter((n): n is string => !!n)
    .join(' · ');

  return { notes: notes.length > 0 ? notes : null };
}
