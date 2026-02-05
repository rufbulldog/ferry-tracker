import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { DepartureInfo } from '../hooks/useNextDepartures';
import { formatTime } from '../utils/time';

interface LastDepartureCardProps {
  departure: DepartureInfo;
  backendCapacityPercent?: number | null; // Fallback from backend when WSF data unavailable
}

export function LastDepartureCard({ departure, backendCapacityPercent }: LastDepartureCardProps) {
  const {
    vesselName,
    scheduledDeparture,
    actualDeparture,
    delayMinutes,
    driveUpSpaces,
    maxSpaces,
    vesselProgressPercent,
  } = departure;

  // Calculate capacity percentage - how full was this ferry when it departed
  // Use WSF data if available, fallback to backend data
  const wsfCapacity = driveUpSpaces !== null && maxSpaces > 0
    ? Math.round(((maxSpaces - driveUpSpaces) / maxSpaces) * 100)
    : null;
  const capacityPercent = wsfCapacity ?? backendCapacityPercent ?? null;

  // Same color scale as MainDepartureCard
  const getCapacityColor = (percent: number) => {
    if (percent > 90) return '#C62828';
    if (percent > 70) return '#F57C00';
    if (percent > 50) return '#FBC02D';
    return '#43A047';
  };

  const departureTime = actualDeparture || scheduledDeparture;

  // Animated ferry progress
  const animatedProgress = useRef(new Animated.Value(vesselProgressPercent)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: vesselProgressPercent,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [vesselProgressPercent, animatedProgress]);

  const ferryPosition = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['5%', '90%'],
  });

  return (
    <View style={styles.container}>
      {/* Ferry tracker with capacity fill inside */}
      <View style={styles.ferryTracker}>
        <View style={styles.trackLine}>
          {/* Capacity fill inside track - shows how full ferry was when it departed */}
          {capacityPercent !== null && (
            <View
              style={[
                styles.trackCapacityFill,
                {
                  width: `${capacityPercent}%`,
                  backgroundColor: getCapacityColor(capacityPercent),
                },
              ]}
            />
          )}
          <View style={[styles.dock, styles.leftDock]} />
          <View style={[styles.dock, styles.rightDock]} />
          <Animated.View
            style={[
              styles.ferryIcon,
              { left: ferryPosition },
            ]}
          >
            <Ionicons name="boat" size={18} color="#1565C0" />
          </Animated.View>
        </View>
      </View>

      {/* Vessel info - all on one line */}
      <View style={styles.content}>
        <Text style={styles.vesselName}>{vesselName}</Text>
        <Text style={styles.departedAt}>departed {formatTime(departureTime)}</Text>
        {delayMinutes > 0 && (
          <Text style={styles.delay}>+{delayMinutes}m late</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#1565C0',
    // Subtle drop shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ferryTracker: {
    marginBottom: 6,
  },
  trackLine: {
    height: 24,
    backgroundColor: 'rgba(21, 101, 192, 0.15)',
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
    backgroundColor: '#1565C0',
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
    color: '#333',
  },
  delay: {
    fontSize: 11,
    color: '#F57C00',
    fontWeight: '500',
    marginLeft: 'auto',
  },
  departedAt: {
    fontSize: 12,
    color: '#666',
  },
});
