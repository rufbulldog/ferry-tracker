import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';

interface CapacityBarProps {
  currentSpaces: number | null; // Available spaces
  maxSpaces: number;
  height?: number;
}

export function CapacityBar({
  currentSpaces,
  maxSpaces,
  height = 100,
}: CapacityBarProps) {
  // Calculate fill percentage (inverted - more cars = higher fill)
  const fillPercent = currentSpaces !== null && maxSpaces > 0
    ? ((maxSpaces - currentSpaces) / maxSpaces) * 100
    : 0;

  const animatedFill = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(animatedFill, {
      toValue: fillPercent,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [fillPercent, animatedFill]);

  // Color based on capacity
  const getFillColor = () => {
    if (fillPercent > 90) return '#C62828'; // Red - almost full
    if (fillPercent > 70) return '#F57C00'; // Orange - filling up
    if (fillPercent > 50) return '#FBC02D'; // Yellow - half full
    return '#2E7D32'; // Green - plenty of space
  };

  const carsLoaded = currentSpaces !== null ? maxSpaces - currentSpaces : 0;

  const fillHeight = animatedFill.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.barContainer}>
        {/* Background */}
        <View style={styles.barBackground}>
          {/* Fill from bottom */}
          <Animated.View
            style={[
              styles.barFill,
              {
                height: fillHeight,
                backgroundColor: getFillColor(),
              },
            ]}
          />
        </View>

        {/* Car count overlay */}
        <View style={styles.overlay}>
          <Text style={styles.carCount}>
            {carsLoaded}
          </Text>
          <Text style={styles.carLabel}>cars</Text>
        </View>
      </View>

      {/* Labels */}
      <View style={styles.labels}>
        <Text variant="labelSmall" style={styles.label}>
          {currentSpaces ?? '--'} left
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: 50,
    position: 'relative',
  },
  barBackground: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  carLabel: {
    fontSize: 10,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  labels: {
    marginTop: 4,
  },
  label: {
    color: '#666',
    fontSize: 10,
  },
});
