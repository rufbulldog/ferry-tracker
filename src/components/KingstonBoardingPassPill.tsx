import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getKingstonBoardingPassStatus } from '../utils/kingstonBoardingPass';

// The boarding-pass window flips at 8 AM / 8 PM Pacific. Re-evaluate on a slow
// interval so the pill crosses those boundaries while the app stays open.
const REFRESH_MS = 60 * 1000;

/**
 * Compact notice for the Kingston terminal's vehicle boarding-pass requirement.
 * Render only when the current route departs from Kingston — the pass is a
 * Kingston-terminal rule and only actionable when leaving from there.
 * Renders nothing when the date falls outside a known WSF season.
 */
export function KingstonBoardingPassPill() {
  const { theme } = useTheme();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const status = getKingstonBoardingPassStatus(now);
  if (!status.known) return null;

  const accent = status.activeNow ? theme.colors.warning : theme.colors.textMuted;
  const iconName = status.activeNow ? 'ticket' : 'ticket-outline';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.cardBg, borderColor: accent },
      ]}
    >
      <Ionicons name={iconName} size={20} color={accent} style={styles.icon} />
      <View style={styles.content}>
        <Text style={[styles.headline, { color: theme.colors.text }]}>{status.headline}</Text>
        <Text style={[styles.detail, { color: theme.colors.textMuted }]}>{status.detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  headline: {
    fontWeight: '700',
    fontSize: 13,
  },
  detail: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
});
