import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useBestSailingContext } from "../context/BestSailingContext";

/**
 * Toggle for the Live Activity (Lock Screen, Dynamic Island, CarPlay
 * dashboard). It shows whichever plan the Ferry tab is on — Best from here
 * or the commute leave-by. Renders nothing where Live Activities are off.
 */
export function LiveActivityPill({ style }: { style?: ViewStyle }) {
  const { theme } = useTheme();
  const { live } = useBestSailingContext();
  if (!live.supported) return null;

  return (
    <TouchableOpacity
      onPress={live.toggle}
      activeOpacity={0.7}
      accessibilityRole="switch"
      accessibilityState={{ checked: live.active }}
      style={[
        styles.pill,
        {
          borderColor: theme.colors.primary,
          backgroundColor: live.active ? theme.colors.primary : "transparent",
        },
        style,
      ]}
    >
      <Ionicons
        name={live.active ? "radio" : "radio-outline"}
        size={13}
        color={live.active ? theme.colors.cardBg : theme.colors.primary}
      />
      <Text
        style={[
          styles.text,
          { color: live.active ? theme.colors.cardBg : theme.colors.primary },
        ]}
      >
        {live.active
          ? "Live on Lock Screen & CarPlay"
          : "Show on Lock Screen & CarPlay"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
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
  text: { fontSize: 11, fontWeight: "600" },
});
