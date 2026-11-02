import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { DepartureInfo } from "../hooks/useNextDepartures";
import { formatTime } from "../utils/time";
import { effectiveFerryDeparture } from "../utils/ferryDeparture";
import { useTheme } from "../context/ThemeContext";

// Same scale as MainDepartureCard's capacity tone.
function capacityColor(percent: number): string {
  if (percent > 90) return "#C62828";
  if (percent > 70) return "#F57C00";
  if (percent > 50) return "#FBC02D";
  return "#43A047";
}

/**
 * The boat that just left, as one line at the foot of the Next Sailing card:
 * "Wenatchee left 8:56 · +1m" and a thin bar that fills as it crosses (its
 * colour = how full it left). Replaces the old standalone Departed card.
 */
export function DepartedStrip({
  departure,
  backendCapacityPercent,
}: {
  departure: DepartureInfo;
  backendCapacityPercent?: number | null;
}) {
  const { theme } = useTheme();
  const { vesselName, driveUpSpaces, maxSpaces, vesselProgressPercent } =
    departure;
  const effective = effectiveFerryDeparture(departure);

  const wsfCapacity =
    driveUpSpaces !== null && maxSpaces > 0
      ? Math.round(((maxSpaces - driveUpSpaces) / maxSpaces) * 100)
      : null;
  const capacityPercent = wsfCapacity ?? backendCapacityPercent ?? null;

  const progress = useState(() => new Animated.Value(vesselProgressPercent))[0];
  useEffect(() => {
    Animated.timing(progress, {
      toValue: vesselProgressPercent,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [vesselProgressPercent, progress]);
  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={[styles.row, { borderTopColor: theme.colors.border }]}
      accessible
      accessibilityLabel={`${vesselName} left ${formatTime(effective.time)}${
        effective.delayMinutes > 0
          ? `, ${effective.delayMinutes} minutes late`
          : ""
      }, ${Math.round(vesselProgressPercent)}% of the way across${
        capacityPercent !== null ? `, left ${capacityPercent}% full` : ""
      }`}
    >
      <Ionicons name="boat-outline" size={14} color={theme.colors.textMuted} />
      <Text
        style={[styles.text, { color: theme.colors.textMuted }]}
        numberOfLines={1}
      >
        {vesselName} left {formatTime(effective.time)}
        {effective.delayMinutes > 0 && (
          <Text style={{ color: theme.colors.warning }}>
            {" "}
            · +{effective.delayMinutes}m
          </Text>
        )}
      </Text>
      <View style={[styles.track, { backgroundColor: theme.colors.hoverBg }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width,
              backgroundColor:
                capacityPercent !== null
                  ? capacityColor(capacityPercent)
                  : theme.colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  text: {
    fontSize: 13,
    flexShrink: 1,
  },
  track: {
    flex: 1,
    minWidth: 40,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
});
