import React, { createContext, useContext, ReactNode } from "react";
import { useBestSailing, BestSailingState } from "../hooks/useBestSailing";
import { useCarPlaySnapshot, useLiveActivity } from "../hooks/useLiveActivity";

export interface BestSailingContextValue extends BestSailingState {
  live: ReturnType<typeof useLiveActivity>;
}

// One app-wide best-sailing plan (one location watcher, one set of queries),
// shared by the Ferry tab card, the Live Activity and the CarPlay screen.
const BestSailingContext = createContext<BestSailingContextValue | null>(null);

export function BestSailingProvider({ children }: { children: ReactNode }) {
  const plan = useBestSailing();
  const live = useLiveActivity(plan.best, plan.alternatives[0]);
  useCarPlaySnapshot(plan.hasLocation, plan);
  const value = { ...plan, live };
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
