import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useRoute } from "../context/RouteContext";
import { useBestSailingContext } from "../context/BestSailingContext";
import { Route, ROUTES } from "../utils/constants";
import { formatTime } from "../utils/time";

const ROUTE_SELECTION: Record<
  Route,
  { group: "bainbridge" | "kingston"; direction: "outbound" | "inbound" }
> = {
  "bainbridge-seattle": { group: "bainbridge", direction: "outbound" },
  "seattle-bainbridge": { group: "bainbridge", direction: "inbound" },
  "kingston-edmonds": { group: "kingston", direction: "outbound" },
  "edmonds-kingston": { group: "kingston", direction: "inbound" },
};

/**
 * "Best from here" — which terminal to drive to and which sailing you can make,
 * from your live position (planned as a car). Tap to switch the Ferry tab to
 * that route. The pill mirrors the plan into a Live Activity (Lock Screen and
 * CarPlay). Renders nothing without a location fix or a reachable sailing.
 */
export function BestSailingCard() {
  const { theme } = useTheme();
  const { route, setRouteGroup, setDirection } = useRoute();
  const { best, alternatives, live } = useBestSailingContext();
  const alt = alternatives[0];

  if (!best) return null;

  const isCurrent = best.route === route;
  const leaveLabel =
    best.driveMinutes === 0
      ? "You're at the terminal"
      : best.slackMinutes === 0
        ? "Leave now"
        : `Leave by ${formatTime(best.leaveBy)} (${best.slackMinutes} min)`;
  const urgent = best.driveMinutes > 0 && best.slackMinutes <= 5;

  const select = () => {
    const sel = ROUTE_SELECTION[best.route];
    setRouteGroup(sel.group);
    setDirection(sel.direction);
  };

  return (
    <TouchableOpacity
      activeOpacity={isCurrent ? 1 : 0.7}
      onPress={isCurrent ? undefined : select}
      accessibilityRole={isCurrent ? undefined : "button"}
      accessibilityHint={
        isCurrent ? undefined : `Switches to ${ROUTES[best.route].label}`
      }
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.cardBg,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Ionicons
        name="navigate"
        size={18}
        color={theme.colors.primary}
        style={styles.icon}
      />
      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>
          BEST FROM HERE
        </Text>
        <Text style={[styles.headline, { color: theme.colors.text }]}>
          {ROUTES[best.route].label} · {formatTime(best.targetTime)}
        </Text>
        <Text
          style={[
            styles.detail,
            { color: urgent ? theme.colors.warning : theme.colors.text },
          ]}
        >
          {leaveLabel}
          {best.driveMinutes > 0 ? ` · ~${best.driveMinutes} min drive` : ""}
          {` · lands ${formatTime(best.arrivalTime)}`}
        </Text>
        {best.bumpedByOverflow && (
          <Text style={[styles.detail, { color: theme.colors.textMuted }]}>
            Next boat likely full for cars
          </Text>
        )}
        {alt && (
          <Text style={[styles.detail, { color: theme.colors.textMuted }]}>
            Or {ROUTES[alt.route].label} {formatTime(alt.targetTime)} · lands{" "}
            {formatTime(alt.arrivalTime)}
          </Text>
        )}
        {live.supported && (
          <TouchableOpacity
            onPress={live.toggle}
            activeOpacity={0.7}
            accessibilityRole="switch"
            accessibilityState={{ checked: live.active }}
            style={[
              styles.livePill,
              {
                borderColor: theme.colors.primary,
                backgroundColor: live.active
                  ? theme.colors.primary
                  : "transparent",
              },
            ]}
          >
            <Ionicons
              name={live.active ? "radio" : "radio-outline"}
              size={13}
              color={live.active ? theme.colors.cardBg : theme.colors.primary}
            />
            <Text
              style={[
                styles.livePillText,
                {
                  color: live.active
                    ? theme.colors.cardBg
                    : theme.colors.primary,
                },
              ]}
            >
              {live.active
                ? "Live on Lock Screen & CarPlay"
                : "Show on Lock Screen & CarPlay"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {!isCurrent && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.colors.textMuted}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: { marginRight: 10 },
  content: { flex: 1 },
  label: { fontSize: 11, fontWeight: "600", letterSpacing: 1 },
  headline: { fontWeight: "700", fontSize: 15, marginTop: 2 },
  detail: { fontSize: 12, lineHeight: 16, marginTop: 2 },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 9,
    marginTop: 8,
  },
  livePillText: { fontSize: 11, fontWeight: "600" },
});
