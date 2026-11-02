import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useRoute } from "../context/RouteContext";
import { useBestSailingContext } from "../context/BestSailingContext";
import { ROUTES } from "../utils/constants";
import { selectionFor } from "../utils/routeGroups";
import { LiveActivityPill } from "./LiveActivityPill";
import { driveAroundWins } from "../utils/bestSailing";
import { formatTime } from "../utils/time";

/**
 * "Best from here" — which terminal to drive to and which sailing you can make,
 * from your live position (planned as a car). Tap to switch the Ferry tab to
 * that route. The pill mirrors the plan into a Live Activity (Lock Screen and
 * CarPlay). Renders nothing without a location fix or a reachable sailing.
 */
export function BestSailingCard() {
  const { theme } = useTheme();
  const { route, setRouteGroup, setDirection } = useRoute();
  const { best, alternatives, driveAround } = useBestSailingContext();
  const driveWins = driveAroundWins(driveAround);
  const alt = alternatives[0];

  if (!best && !driveAround) return null;

  // Tapping a ferry plan switches the Ferry tab to it; a drive has no route.
  const isCurrent = !best || driveWins || best.route === route;
  const leaveLabel = !best
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

  const select = () => {
    if (!best) return;
    const sel = selectionFor(best.route);
    setRouteGroup(sel.group);
    setDirection(sel.direction);
  };

  return (
    <TouchableOpacity
      activeOpacity={isCurrent ? 1 : 0.7}
      onPress={isCurrent ? undefined : select}
      accessibilityRole={isCurrent ? undefined : "button"}
      accessibilityHint={
        isCurrent || !best ? undefined : `Switches to ${ROUTES[best.route].label}`
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
        {driveWins && driveAround ? (
          <>
            <Text style={[styles.headline, { color: theme.colors.text }]}>
              Drive around · home by {formatTime(driveAround.homeArrival)}
            </Text>
            <Text style={[styles.detail, { color: theme.colors.text }]}>
              {driveAround.minutes} min with traffic (Apple Maps)
              {driveAround.fasterByMinutes != null
                ? ` · ${driveAround.fasterByMinutes} min sooner than the ferry`
                : " · no ferry gets you there sooner"}
            </Text>
            {best && (
              <Text style={[styles.detail, { color: theme.colors.textMuted }]}>
                Or {ROUTES[best.route].label} {formatTime(best.targetTime)} · {ends(best)}
              </Text>
            )}
          </>
        ) : best ? (
          <>
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
              {` · ${ends(best)}`}
            </Text>
            {best.bumpedByOverflow && (
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
                Drive around: home by {formatTime(driveAround.homeArrival)} (
                {driveAround.minutes} min)
              </Text>
            )}
          </>
        ) : null}
        {best && <LiveActivityPill />}
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
});
