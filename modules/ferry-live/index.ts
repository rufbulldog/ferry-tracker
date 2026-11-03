import { requireOptionalNativeModule } from "expo";

export interface CarPlaySnapshot {
  hasLocation: boolean;
  best: FerryLiveState | null;
  followingDepartureMs: number | null;
  /** Drive-up spaces left on the following sailing (null: no WSF space data). */
  followingSpaces?: number | null;
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
  /** On the way by car (leave-by passed): show drive-up spaces, not the countdown. */
  enRoute?: boolean;
  spaces?: number | null;
  startSpaces?: number | null;
  vesselName?: string | null;
}

interface FerryLiveNative {
  areActivitiesEnabled(): boolean;
  isActive(): boolean;
  startOrUpdate(state: FerryLiveState): Promise<void>;
  end(): Promise<void>;
  /** Absent on builds that predate the CarPlay screen. */
  setCarPlaySnapshot?(json: string): void;
  /**
   * Apple Maps road drive time (seconds, with traffic) from one point to each
   * `[lat, lon]`; -1 where unknown. Absent on builds before 1.10.
   */
  /** Background location keep-alive for car Live Activities. Absent before 1.10. */
  startKeepAlive?(): void;
  stopKeepAlive?(): void;
  driveTimes?(fromLat: number, fromLon: number, destinations: [number, number][]): Promise<number[]>;
}

// Optional so JS still runs on builds without the native module (older
// binaries, Android, Jest) — callers check `FerryLive` for null.
export const FerryLive =
  requireOptionalNativeModule<FerryLiveNative>("FerryLive");
