import { useQuery } from '@tanstack/react-query';
import { fetchTerminalBulletins } from '../api/terminals';
import { processBulletins, pickActiveAlert } from '../utils/bulletins';
import { ROUTES, Route } from '../utils/constants';

export type { ProcessedBulletin } from '../utils/bulletins';

export function useTerminalBulletins(route: Route) {
  const routeConfig = ROUTES[route];
  const terminalId = routeConfig.from;

  const { data, isLoading, error } = useQuery({
    queryKey: ['terminalBulletins', terminalId],
    queryFn: () => fetchTerminalBulletins(terminalId),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Recency is judged against the wall clock each render (the query refetches every minute).
  const bulletins = processBulletins(data?.Bulletins, route);
  const activeAlert = pickActiveAlert(bulletins);

  return {
    bulletins,
    activeAlert,
    isLoading,
    error,
  };
}
