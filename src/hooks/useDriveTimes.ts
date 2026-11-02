import { useQuery } from "@tanstack/react-query";
import { FerryLive } from "../../modules/ferry-live";

export interface DrivePoint {
  id: string;
  lat: number;
  lon: number;
}

/** Minutes by destination id; missing/null = unknown (use the estimate). */
export type DriveMinutes = Record<string, number | null>;

// Re-ask Apple Maps every few minutes (traffic moves) or after ~500 m.
const REFRESH_MS = 5 * 60_000;
const GRID = 200; // 1/200° ≈ 550 m of latitude

// Shared so "no data yet" keeps a stable identity across renders.
const NONE: DriveMinutes = {};

const snap = (v: number) => Math.round(v * GRID) / GRID;

async function lookup(from: { lat: number; lon: number }, to: DrivePoint[]): Promise<DriveMinutes> {
  const seconds = await FerryLive!.driveTimes!(
    from.lat,
    from.lon,
    to.map((d) => [d.lat, d.lon] as [number, number]),
  );
  return Object.fromEntries(
    to.map((d, i) => [d.id, seconds[i] >= 0 ? Math.ceil(seconds[i] / 60) : null]),
  );
}

/**
 * Apple Maps road drive times (with traffic) from `origin` to each point.
 * Empty on builds without the native lookup, or before the first answer —
 * callers keep their straight-line estimate then.
 */
export function useDriveTimes(
  origin: { lat: number; lon: number } | null,
  destinations: DrivePoint[],
): DriveMinutes {
  const enabled = !!origin && destinations.length > 0 && !!FerryLive?.driveTimes;
  const snapped = origin ? { lat: snap(origin.lat), lon: snap(origin.lon) } : null;
  const { data } = useQuery({
    queryKey: ["driveTimes", snapped?.lat, snapped?.lon, destinations.map((d) => d.id)],
    queryFn: () => lookup(origin!, destinations),
    enabled,
    staleTime: REFRESH_MS,
    refetchInterval: REFRESH_MS,
    retry: false,
  });
  return data ?? NONE;
}

/**
 * Drive times from several fixed origins (far-side terminals) to one point
 * (home). These don't depend on where you are, so they refresh rarely.
 */
export function useDriveTimesTo(
  origins: DrivePoint[],
  destination: { lat: number; lon: number } | null,
): DriveMinutes {
  const enabled = !!destination && origins.length > 0 && !!FerryLive?.driveTimes;
  const { data } = useQuery({
    queryKey: ["driveTimesTo", destination?.lat, destination?.lon, origins.map((o) => o.id)],
    queryFn: async () => {
      const results = await Promise.all(
        origins.map((o) => lookup(o, [{ id: o.id, ...destination! }])),
      );
      return Object.assign({}, ...results) as DriveMinutes;
    },
    enabled,
    staleTime: 15 * 60_000,
    refetchInterval: 15 * 60_000,
    retry: false,
  });
  return data ?? NONE;
}
