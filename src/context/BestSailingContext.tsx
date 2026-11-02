import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useBestSailing, BestSailingState } from "../hooks/useBestSailing";
import {
  toLiveState,
  useCarPlaySnapshot,
  useLiveActivity,
} from "../hooks/useLiveActivity";
import type { FerryLiveState } from "../../modules/ferry-live";

export interface BestSailingContextValue extends BestSailingState {
  live: ReturnType<typeof useLiveActivity>;
  /**
   * The Ferry tab's own leave-by while you're commuting (Best from here
   * hidden). When set, the Live Activity shows it instead of the best plan.
   */
  setCommuteLive: (state: FerryLiveState | null) => void;
}

// One app-wide best-sailing plan (one location watcher, one set of queries),
// shared by the Ferry tab card, the Live Activity and the CarPlay screen.
const BestSailingContext = createContext<BestSailingContextValue | null>(null);

export function BestSailingProvider({ children }: { children: ReactNode }) {
  const plan = useBestSailing();
  const [commuteLive, setCommuteLiveState] = useState<FerryLiveState | null>(null);
  // Callers rebuild the state each render; only store real changes.
  const setCommuteLive = useCallback((next: FerryLiveState | null) => {
    setCommuteLiveState((prev) =>
      JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
    );
  }, []);
  const bestLive = useMemo(
    () => (plan.best ? toLiveState(plan.best, plan.alternatives[0]) : null),
    [plan.best, plan.alternatives],
  );
  const live = useLiveActivity(commuteLive ?? bestLive);
  useCarPlaySnapshot(plan.hasLocation, plan);
  const value = { ...plan, live, setCommuteLive };
  return (
    <BestSailingContext.Provider value={value}>
      {children}
    </BestSailingContext.Provider>
  );
}

export function useBestSailingContext(): BestSailingContextValue {
  const ctx = useContext(BestSailingContext);
  if (!ctx)
    throw new Error(
      "useBestSailingContext must be used within a BestSailingProvider",
    );
  return ctx;
}
