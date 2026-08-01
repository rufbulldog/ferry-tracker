import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCarWait } from '../hooks/useCarWait';
import { Route } from '../utils/constants';

/**
 * Compact "cars may wait" notice for the Time screen. Renders nothing unless
 * there's a real overflow signal (live-full / WSF wait / alert / history).
 * Mode-agnostic — informs drivers without needing the bike/car toggle.
 */
export function CarWaitChip({ route }: { route: Route }) {
  const { theme } = useTheme();
  const { estimate } = useCarWait(route);

  if (!estimate.atRisk || estimate.reason === 'none') return null;

  const accent = estimate.extraSailings > 0 ? theme.colors.warning : theme.colors.textMuted;
  const headline =
    estimate.extraSailings > 0
      ? `Cars: expect a ${estimate.extraSailings}-sailing wait (~${estimate.extraMinutes} min)`
      : 'Cars: this sailing may fill up';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBg, borderColor: accent }]}>
      <Ionicons name="car" size={18} color={accent} style={styles.icon} />
      <View style={styles.content}>
        <Text style={[styles.headline, { color: theme.colors.text }]}>{headline}</Text>
        {estimate.note && (
          <Text style={[styles.detail, { color: theme.colors.textMuted }]}>{estimate.note}</Text>
        )}
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
  icon: { marginRight: 10 },
  content: { flex: 1 },
  headline: { fontWeight: '700', fontSize: 13 },
  detail: { fontSize: 11, lineHeight: 15, marginTop: 2 },
});
