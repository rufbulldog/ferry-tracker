import { useEffect, useState } from "react";
import { AppState } from "react-native";
import * as Location from "expo-location";

export interface WatchedLocation {
  latitude: number;
  longitude: number;
}

// Driving: refresh roughly every few blocks / half minute, not every GPS tick.
const DISTANCE_INTERVAL_METERS = 300;
const TIME_INTERVAL_MS = 30_000;

/**
 * Continuously updated position while the app is in the foreground — for the
 * "best sailing from here" card, which needs to re-plan as you drive.
 * (useUserLocation only reads once per foregrounding.) Stops watching in the
 * background; returns null until permission is granted and a fix arrives.
 */
export function useWatchedLocation(): WatchedLocation | null {
  const [location, setLocation] = useState<WatchedLocation | null>(null);
  const [active, setActive] = useState(AppState.currentState === "active");

  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) =>
      setActive(s === "active"),
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted" || cancelled) return;
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: DISTANCE_INTERVAL_METERS,
            timeInterval: TIME_INTERVAL_MS,
          },
          (pos) =>
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
        );
        if (cancelled) sub.remove();
        else subscription = sub;
      } catch {
        // Location unavailable — the card simply doesn't render.
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [active]);

  return location;
}
