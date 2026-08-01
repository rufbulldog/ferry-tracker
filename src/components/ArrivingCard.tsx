import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { DepartureInfo } from '../hooks/useNextDepartures';
import { formatTime, getMinutesUntil } from '../utils/time';
import { useTheme } from '../context/ThemeContext';

interface ArrivingCardProps {
  departure: DepartureInfo;
  backendIncomingCapacity?: number | null; // Fallback from backend when WSF data unavailable
}

/**
 * Compact tracker for the incoming vessel, pulled out of the Next Sailing card
 * so that card can focus on spots-open. Mirrors the Departed card's look; the
 * ferry animates toward our dock (right → left) instead of away from it.
 */
export function ArrivingCard({ departure, backendIncomingCapacity }: ArrivingCardProps) {
  const { theme } = useTheme();
  const {
    vesselName,
    vesselArrivalEta,
    vesselProgressPercent,
    vesselAtOppositeTerminal,
    incomingVesselCapacity: wsfIncomingCapacity,
  } = departure;

  const capacityPercent = wsfIncomingCapacity ?? backendIncomingCapacity ?? null;

  // Same capacity color scale as the Departed / Next Sailing cards.
  const getCapacityColor = (percent: number) => {
    if (percent > 90) return '#C62828';
    if (percent > 70) return '#F57C00';
    if (percent > 50) return '#FBC02D';
    return '#43A047';
  };

  const minutesToArrival = vesselArrivalEta ? getMinutesUntil(vesselArrivalEta) : null;

  // Animate the ferry approaching our dock: 90% (far) → 5% (docking).
  const animatedProgress = useState(() => new Animated.Value(vesselProgressPercent))[0];

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: vesselProgressPercent,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [vesselProgressPercent, animatedProgress]);

  const ferryPosition = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['90%', '5%'],
  });

  const statusText = vesselAtOppositeTerminal
    ? 'Waiting at opposite terminal'
    : minutesToArrival !== null && vesselArrivalEta
      ? `Arrives ${formatTime(vesselArrivalEta)}`
      : 'Arriving';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBg, borderLeftColor: '#7B1FA2' }]}>
      {/* Ferry tracker with capacity fill inside */}
      <View style={styles.ferryTracker}>
        <View style={[styles.trackLine, { backgroundColor: `${theme.colors.primary}30` }]}>
          {capacityPercent !== null && (
            <View
              style={[
                styles.trackCapacityFill,
                { width: `${capacityPercent}%`, backgroundColor: getCapacityColor(capacityPercent) },
              ]}
            />
          )}
          <View style={[styles.dock, styles.leftDock, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.dock, styles.rightDock, { backgroundColor: theme.colors.primary }]} />
          <Animated.View style={[styles.ferryIcon, { left: ferryPosition, transform: [{ scaleX: -1 }] }]}>
            <Ionicons name="boat" size={18} color={theme.colors.primary} />
          </Animated.View>
        </View>
      </View>

      {/* Vessel info - all on one line */}
      <View style={styles.content}>
        <Text style={[styles.vesselName, { color: theme.colors.text }]}>{vesselName}</Text>
        <Text style={[styles.status, { color: theme.colors.textMuted }]}>{statusText}</Text>
        {minutesToArrival !== null && !vesselAtOppositeTerminal && (
          <Text style={[styles.eta, { color: '#7B1FA2' }]}>
            {minutesToArrival > 0 ? `in ${minutesToArrival}m` : 'now'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  ferryTracker: {
    marginBottom: 6,
  },
  trackLine: {
    height: 24,
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trackCapacityFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 12,
    opacity: 0.6,
  },
  dock: {
    position: 'absolute',
    width: 5,
    height: 14,
    borderRadius: 2,
  },
  leftDock: {
    left: 5,
  },
  rightDock: {
    right: 5,
  },
  ferryIcon: {
    position: 'absolute',
    top: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vesselName: {
    fontSize: 14,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
  },
  eta: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 'auto',
  },
});
