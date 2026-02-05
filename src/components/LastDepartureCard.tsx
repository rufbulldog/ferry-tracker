import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { DepartureInfo } from '../hooks/useNextDepartures';
import { formatTime } from '../utils/time';

interface LastDepartureCardProps {
  departure: DepartureInfo;
}

export function LastDepartureCard({ departure }: LastDepartureCardProps) {
  const {
    vesselName,
    scheduledDeparture,
    actualDeparture,
    delayMinutes,
    driveUpSpaces,
    maxSpaces,
  } = departure;

  // Calculate capacity percentage
  const capacityPercent = driveUpSpaces !== null && maxSpaces > 0
    ? Math.round(((maxSpaces - driveUpSpaces) / maxSpaces) * 100)
    : 0;

  const getCapacityColor = () => {
    if (capacityPercent > 90) return '#C62828';
    if (capacityPercent > 70) return '#F57C00';
    if (capacityPercent > 50) return '#FBC02D';
    return '#43A047';
  };

  const departureTime = actualDeparture || scheduledDeparture;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={16} color="#666" />
        <Text style={styles.headerText}>LAST DEPARTURE</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={styles.time}>{formatTime(departureTime)}</Text>
          {delayMinutes > 0 && (
            <Text style={styles.delay}>+{delayMinutes}m late</Text>
          )}
        </View>

        <View style={styles.middleSection}>
          <Text style={styles.vesselName}>{vesselName}</Text>
        </View>

        <View style={styles.rightSection}>
          <View style={[styles.capacityBadge, { backgroundColor: getCapacityColor() }]}>
            <Text style={styles.capacityText}>{capacityPercent}%</Text>
          </View>
          <Text style={styles.capacityLabel}>full</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    minWidth: 70,
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  delay: {
    fontSize: 11,
    color: '#F57C00',
    fontWeight: '500',
  },
  middleSection: {
    flex: 1,
    paddingHorizontal: 12,
  },
  vesselName: {
    fontSize: 14,
    color: '#666',
  },
  rightSection: {
    alignItems: 'center',
  },
  capacityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  capacityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  capacityLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
});
