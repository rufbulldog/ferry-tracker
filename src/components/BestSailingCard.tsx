import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useRoute } from "../context/RouteContext";
import { useBestSailingContext } from "../context/BestSailingContext";
import { ROUTES } from "../utils/constants";
import { selectionFor } from "../utils/routeGroups";
import { driveAroundWins } from "../utils/bestSailing";
import { formatTime } from "../utils/time";

/**
 * "Best from here" — which terminal to drive to and which sailing you can make,
 * from your live position (planned as a car). Two lines by default; tap to
 * expand the details and switch the Ferry tab to that route. The broadcast
 * button mirrors the plan into a Live Activity (Lock Screen and CarPlay).
 * Renders nothing without a location fix or a reachable sailing.
 */
export function BestSailingCard() {
  const { theme } = useTheme();
  const { route, setRouteGroup, setDirection } = useRoute();
  const { best, alternatives, driveAround, live } = useBestSailingContext();
  const [open, setOpen] = useState(false);
  const driveWins = driveAroundWins(driveAround);
  const alt = alternatives[0];

  if (!best && !driveAround) return null;

  const canSwitch = !!best && !driveWins && best.route !== route;
  const leaveShort = !best
    ? ""
    : best.driveMinutes === 0
      ? "at the terminal"
      : best.slackMinutes === 0
        ? "leave now"
        : `leave ${formatTime(best.leaveBy)}`;
  const leaveLong = !best
    ? ""
    : best.driveMinutes === 0
      ? "You're at the terminal"
      : best.slackMinutes === 0
        ? "Leave now"
        : `Leave by ${formatTime(best.leaveBy)} (${best.slackMinutes} min)`;
  const urgent = !!best && best.driveMinutes > 0 && best.slackMinutes <= 5;
  // "home by" once we're planning for home, else when the boat lands.
  const ends = (p: { homeArrival: Date | null; arrivalTime: Date }) =>
    p.homeArrival ? `home by ${formatTime(p.homeArrival)}` : `lands ${formatTime(p.arrivalTime)}`;

  const headline =
    driveWins && driveAround
      ? `Drive around · home by ${formatTime(driveAround.homeArrival)}`
      : best
        ? `${ROUTES[best.route].label} ${formatTime(best.targetTime)}`
        : "";
  const subline =
    driveWins && driveAround
      ? best
        ? `Or ${ROUTES[best.route].label} ${formatTime(best.targetTime)} · ${ends(best)}`
        : `${driveAround.minutes} min with traffic`
      : best
        ? [
            leaveShort.charAt(0).toUpperCase() + leaveShort.slice(1),
            alt ? `or ${ROUTES[alt.route].label} ${formatTime(alt.targetTime)}` : ends(best),
          ].join(" · ")
        : "";

  const select = () => {
    if (!best) return;
    const sel = selectionFor(best.route);
    setRouteGroup(sel.group);
    setDirection(sel.direction);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.cardBg, borderColor: theme.colors.primary },
      ]}
    >
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.summary}
          onPress={() => setOpen((o) => !o)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`Best from here: ${headline}. ${subline}`}
        >
          <Ionicons name="navigate" size={16} color={theme.colors.primary} style={styles.icon} />
          <View style={styles.content}>
            <Text
              style={[styles.headline, { color: urgent && !driveWins ? theme.colors.warning : theme.colors.text }]}
              numberOfLines={1}
            >
              {headline}
            </Text>
            <Text style={[styles.detail, { color: theme.colors.textMuted }]} numberOfLines={1}>
              {subline}
            </Text>
          </View>
          <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={theme.colors.textMuted} />
        </TouchableOpacity>
        {best && live.supported && (
          <TouchableOpacity
            onPress={live.toggle}
            style={[
              styles.liveButton,
              {
                borderColor: theme.colors.primary,
                backgroundColor: live.active ? theme.colors.primary : "transparent",
              },
            ]}
            hitSlop={6}
            accessibilityRole="switch"
            accessibilityState={{ checked: live.active }}
            accessibilityLabel="Show on Lock Screen and CarPlay"
          >
            <Ionicons
              name={live.active ? "radio" : "radio-outline"}
              size={16}
              color={live.active ? theme.colors.cardBg : theme.colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {open && (
        <View style={[styles.details, { borderTopColor: theme.colors.border }]}>
          {best && (
            <Text style={[styles.detail, { color: urgent ? theme.colors.warning : theme.colors.text }]}>
              {ROUTES[best.route].label} {formatTime(best.targetTime)}: {leaveLong}
              {best.driveMinutes > 0 ? ` · ~${best.driveMinutes} min drive` : ""} · {ends(best)}
            </Text>
          )}
          {best?.bumpedByOverflow && (
            <Text style={[styles.detail, { color: theme.colors.textMuted }]}>
              Next boat likely full for cars
            </Text>
          )}
          {alt && (
            <Text style={[styles.detail, { color: theme.colors.textMuted }]}>
              Or {ROUTES[alt.route].label} {formatTime(alt.targetTime)} · {ends(alt)}
            </Text>
          )}
          {driveAround && (
            <Text style={[styles.detail, { color: theme.colors.textMuted }]}>
              Drive around: home by {formatTime(driveAround.homeArrival)} ({driveAround.minutes} min with
              traffic)
              {driveAround.fasterByMinutes != null && driveAround.fasterByMinutes > 0
                ? ` · ${driveAround.fasterByMinutes} min sooner`
                : ""}
            </Text>
          )}
          {canSwitch && best && (
            <TouchableOpacity
              onPress={select}
              style={[styles.switchButton, { borderColor: theme.colors.primary }]}
              accessibilityRole="button"
            >
              <Text style={[styles.switchText, { color: theme.colors.primary }]}>
                Show {ROUTES[best.route].label}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },
  summary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 6,
  },
  icon: { marginRight: 10 },
  content: { flex: 1 },
  headline: { fontWeight: "700", fontSize: 14 },
  detail: { fontSize: 12, lineHeight: 16, marginTop: 2 },
  liveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 10,
  },
  switchButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  switchText: { fontSize: 12, fontWeight: "600" },
});
