import { requireOptionalNativeModule } from "expo";

export interface CarPlaySnapshot {
  hasLocation: boolean;
  best: FerryLiveState | null;
  followingDepartureMs: number | null;
  alternatives: FerryLiveState[];
}

export interface FerryLiveState {
  routeLabel: string;
  terminal: string;
  departureMs: number;
  leaveByMs: number;
  arrivalMs: number;
  driveMinutes: number;
  note: string | null;
}

interface FerryLiveNative {
  areActivitiesEnabled(): boolean;
  isActive(): boolean;
  startOrUpdate(state: FerryLiveState): Promise<void>;
  end(): Promise<void>;
  /** Absent on builds that predate the CarPlay screen. */
  setCarPlaySnapshot?(json: string): void;
}

// Optional so JS still runs on builds without the native module (older
// binaries, Android, Jest) — callers check `FerryLive` for null.
export const FerryLive =
  requireOptionalNativeModule<FerryLiveNative>("FerryLive");
