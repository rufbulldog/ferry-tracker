import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface FerryProgressIndicatorProps {
  progress: number; // 0-100, percentage of journey complete
  isAtDock: boolean;
  isDeparting: boolean; // true if ferry is leaving this terminal
  isArriving: boolean; // true if ferry is coming to this terminal
  minutesToArrival: number | null;
}

export function FerryProgressIndicator({
  progress,
  isAtDock,
  isDeparting,
  isArriving,
  minutesToArrival,
}: FerryProgressIndicatorProps) {
  const animatedProgress = useState(() => new Animated.Value(progress))[0];

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedProgress]);

  // Ferry position based on direction
  const ferryPosition = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: isDeparting ? ['5%', '85%'] : ['85%', '5%'],
  });

  return (
    <View style={styles.container}>
      {/* Progress track */}
      <View style={styles.track}>
        {/* Dock indicators */}
        <View style={[styles.dock, styles.leftDock]} />
        <View style={[styles.dock, styles.rightDock]} />

        {/* Ferry icon */}
        <Animated.View
          style={[
            styles.ferryContainer,
            {
              left: ferryPosition,
              transform: [{ scaleX: isDeparting ? 1 : -1 }],
            },
          ]}
        >
          <Ionicons
            name="boat"
            size={24}
            color={isAtDock ? '#1565C0' : '#2E7D32'}
          />
        </Animated.View>
      </View>

      {/* Status text */}
      <View style={styles.statusRow}>
        {isAtDock && (
          <Text variant="bodySmall" style={styles.statusText}>
            At dock
          </Text>
        )}
        {isArriving && minutesToArrival !== null && minutesToArrival > 0 && (
          <Text variant="bodySmall" style={styles.statusText}>
            {minutesToArrival} min to dock
          </Text>
        )}
        {isDeparting && !isAtDock && (
          <Text variant="bodySmall" style={styles.statusText}>
            En route
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  track: {
    height: 32,
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    position: 'relative',
    justifyContent: 'center',
  },
  dock: {
    position: 'absolute',
    width: 8,
    height: 24,
    backgroundColor: '#1565C0',
    borderRadius: 4,
  },
  leftDock: {
    left: 4,
  },
  rightDock: {
    right: 4,
  },
  ferryContainer: {
    position: 'absolute',
    top: 4,
  },
  statusRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  statusText: {
    color: '#666',
  },
});
