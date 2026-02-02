import { useQuery } from '@tanstack/react-query';
import { fetchTerminalSailingSpace } from '../api/terminals';
import { TERMINALS } from '../utils/constants';

export function useTerminalSailingSpace() {
  return useQuery({
    queryKey: ['terminalSailingSpace'],
    queryFn: fetchTerminalSailingSpace,
    refetchInterval: 10_000, // Poll every 10 seconds for space updates
    staleTime: 5_000,
  });
}

export function useSeattleTerminal() {
  const { data, ...rest } = useTerminalSailingSpace();
  return {
    data: data?.find(t => t.TerminalID === TERMINALS.SEATTLE),
    ...rest,
  };
}

export function useBainbridgeTerminal() {
  const { data, ...rest } = useTerminalSailingSpace();
  return {
    data: data?.find(t => t.TerminalID === TERMINALS.BAINBRIDGE),
    ...rest,
  };
}
