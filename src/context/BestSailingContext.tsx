import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBestSailing, BestSailingState } from "../hooks/useBestSailing";
import {
  toLiveState,
  useCarPlaySnapshot,
  useLiveActivity,
} from "../hooks/useLiveActivity";
import { FerryLive, type FerryLiveState } from "../../modules/ferry-live";
import { driveAroundWins } from "../utils/bestSailing";
import { formatTime } from "../utils/time";

/** A plan for the Live Activity, and whether it's a drive (spots once under way). */
export interface LiveSource {
  state: FerryLiveState;
  car: boolean;
}

export interface BestSailingContextValue extends BestSailingState {
  live: ReturnType<typeof useLiveActivity>;
  /**
   * The Ferry tab's own leave-by while you're commuting (Best from here
   * hidden). When set, the Live Activity shows it instead of the best plan.
   */
  setCommuteLive: (source: LiveSource | null) => void;
}

// While driving to a sailing with the Live Activity on, refresh WSF space this
// often (the app is kept awake in the background by the location keep-alive,
// but react-query's own polling pauses when the app isn't focused).
const SPACES_REFRESH_MS = 60_000;
const TICK_MS = 30_000;

// One app-wide best-sailing plan (one location watcher, one set of queries),
// shared by the Ferry tab card, the Live Activity and the CarPlay screen.
const BestSailingContext = createContext<BestSailingContextValue | null>(null);

export function BestSailingProvider({ children }: { children: ReactNode }) {
  const plan = useBestSailing();
  const queryClient = useQueryClient();
  const [commute, setCommuteState] = useState<LiveSource | null>(null);
  // Callers rebuild the source each render; only store real changes.
  const setCommuteLive = useCallback((next: LiveSource | null) => {
    setCommuteState((prev) =>
      JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
    );
  }, []);

  const bestSource = useMemo<LiveSource | null>(() => {
    if (!plan.best) return null;
    const state = toLiveState(plan.best, plan.alternatives[0]);
    // The countdown stays on the best ferry; the note says when driving wins.
    if (driveAroundWins(plan.driveAround)) {
      state.note = `Driving around is faster · home ${formatTime(plan.driveAround!.homeArrival)}`;
    }
    return { state, car: true };
  }, [plan.best, plan.alternatives, plan.driveAround]);

  const source = commute ?? bestSource;

  // Clock for the leave-by → on-the-way switch (the plan itself may not change).
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const live = useLiveActivity(source, now);

  // Keep the app awake and the spaces fresh while a car activity is on.
  const keepAlive = live.active && !!source?.car;
  useEffect(() => {
    if (!keepAlive || !FerryLive?.startKeepAlive) return;
    FerryLive.startKeepAlive();
    const id = setInterval(() => {
      queryClient.refetchQueries({ queryKey: ["terminalSailingSpace"] });
      queryClient.refetchQueries({ queryKey: ["vesselLocations"] });
    }, SPACES_REFRESH_MS);
    return () => {
      clearInterval(id);
      FerryLive?.stopKeepAlive?.();
    };
  }, [keepAlive, queryClient]);

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
