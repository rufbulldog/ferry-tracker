import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { FerryProgressIndicator } from './FerryProgressIndicator';
import { CapacityBar } from './CapacityBar';
import { DepartureInfo } from '../hooks/useNextDepartures';
import { formatTime, parseDate, getMinutesUntil } from '../utils/time';
import { useTheme } from '../context/ThemeContext';

interface FerryCardProps {
  departure: DepartureInfo;
  isMainCard?: boolean;
}

export function FerryCard({
  departure,
  isMainCard = false,
}: FerryCardProps) {
  const { theme } = useTheme();
  const {
    vesselName,
    scheduledDeparture,
    estimatedDeparture,
    minutesUntilDeparture,
    delayMinutes,
    status,
    driveUpSpaces,
    maxSpaces,
    isCancelled,
    vessel,
    vesselArrivalEta,
    etaRaw,
  } = departure;

  // Calculate ferry progress
  const getProgress = (): number => {
    if (!vessel) return 0;

    if (vessel.AtDock) {
      return 0; // At dock = 0% of journey
    }

    if (vessel.LeftDock && vessel.Eta) {
      const leftDock = parseDate(vessel.LeftDock);
      const eta = parseDate(vessel.Eta);
      if (leftDock && eta) {
        // Wall-clock read for live journey progress; recomputed on each poll-driven re-render.
        // eslint-disable-next-line react-hooks/purity
        const now = Date.now();
        const total = eta.getTime() - leftDock.getTime();
        const elapsed = now - leftDock.getTime();
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
      }
    }

    return 50; // Default to middle if unknown
  };

  const getMinutesToArrival = (): number | null => {
    if (vesselArrivalEta) {
      return getMinutesUntil(vesselArrivalEta);
    }
    return null;
  };

  const getStatusText = (): string => {
    if (isCancelled) return 'Cancelled';
    switch (status) {
      case 'loading': return 'Loading';
      case 'arriving': return 'Arriving';
      case 'returning': return 'Delayed';
      case 'departed': return delayMinutes > 0 ? `Left ${delayMinutes}m late` : 'Departed';
      default: return 'Scheduled';
    }
  };

  const getStatusColor = (): string => {
    if (isCancelled) return '#C62828';
    switch (status) {
      case 'loading': return '#1565C0';
      case 'arriving': return '#7B1FA2';
      case 'returning': return '#F57C00';
      case 'departed': return delayMinutes > 5 ? '#F57C00' : '#2E7D32';
      default: return '#2E7D32';
    }
  };

  if (isMainCard) {
    return (
      <Card style={[styles.mainCard, isCancelled && styles.cancelledCard]}>
        <Card.Content>
          {/* Header with time and status */}
          <View style={styles.mainHeader}>
            <View style={styles.timeSection}>
              <Text variant="displaySmall" style={[styles.mainTime, isCancelled && styles.cancelledText]}>
                {formatTime(scheduledDeparture)}
              </Text>
              {estimatedDeparture && !isCancelled && (
                <View style={styles.estimatedBadge}>
                  <Text style={styles.estimatedLabel}>Est.</Text>
                  <Text style={styles.estimatedTime}>{formatTime(estimatedDeparture)}</Text>
                </View>
              )}
            </View>
            <View style={styles.statusBadge}>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>

          {/* Vessel name */}
          <Text variant="titleMedium" style={styles.vesselName}>
            {vesselName}
          </Text>

          {/* Ferry progress indicator (only show if vessel is en route) */}
          {(status === 'arriving' || status === 'departed') && vessel && (
            <FerryProgressIndicator
              progress={getProgress()}
              isAtDock={vessel.AtDock}
              isDeparting={status === 'departed'}
              isArriving={status === 'arriving'}
              minutesToArrival={getMinutesToArrival()}
            />
          )}

          {/* Main content area with capacity */}
          <View style={styles.mainContent}>
            {/* Capacity bar */}
            {driveUpSpaces !== null && !isCancelled && status !== 'departed' && (
              <CapacityBar
                currentSpaces={driveUpSpaces}
                maxSpaces={maxSpaces}
                height={80}
              />
            )}

            {/* Departure info */}
            <View style={styles.departureInfo}>
              {status !== 'departed' && minutesUntilDeparture > 0 && (
                <View style={styles.infoRow}>
                  <Text variant="bodyLarge" style={styles.infoLabel}>Departs in</Text>
                  <Text variant="headlineSmall" style={styles.infoValue}>
                    {minutesUntilDeparture} min
                  </Text>
                </View>
              )}

              {status === 'arriving' && vesselArrivalEta && (
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.infoLabel}>Vessel arrives</Text>
                  <Text variant="titleMedium" style={styles.infoValue}>
                    {formatTime(vesselArrivalEta)}
                  </Text>
                </View>
              )}

              {status === 'departed' && etaRaw && (
                <View style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.infoLabel}>Arrives at</Text>
                  <Text variant="titleMedium" style={styles.infoValue}>
                    {formatTime(etaRaw)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  }

  // Compact card for upcoming departures
  return (
    <Card style={[styles.compactCard, { backgroundColor: theme.colors.cardBg }, isCancelled && styles.cancelledCard]}>
      <Card.Content style={styles.compactContent}>
        <Text variant="titleLarge" style={[styles.compactTime, { color: theme.colors.primary }, isCancelled && styles.cancelledText]}>
          {formatTime(scheduledDeparture)}
        </Text>
        <View style={styles.compactInfo}>
          <Text variant="bodyMedium" style={[styles.compactVessel, { color: theme.colors.text }]}>
            {vesselName}
          </Text>
          <Text variant="bodySmall" style={{ color: getStatusColor() }}>
            {getStatusText()}
          </Text>
        </View>
        {driveUpSpaces !== null && !isCancelled && (
          <Text variant="bodySmall" style={[styles.compactSpaces, { color: theme.colors.textMuted }]}>
            {driveUpSpaces} spots
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1565C0',
  },
  cancelledCard: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: '#C62828',
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainTime: {
    fontWeight: 'bold',
    color: '#1565C0',
  },
  cancelledText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  estimatedBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  estimatedLabel: {
    fontSize: 11,
    color: '#E65100',
    fontWeight: '600',
  },
  estimatedTime: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontWeight: '600',
  },
  vesselName: {
    color: '#333',
    marginBottom: 8,
  },
  mainContent: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  departureInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    color: '#666',
  },
  infoValue: {
    color: '#1565C0',
    fontWeight: '600',
  },
  compactCard: {
    marginBottom: 8,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  compactTime: {
    fontWeight: 'bold',
    minWidth: 80,
  },
  compactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  compactVessel: {},
  compactSpaces: {},
});
