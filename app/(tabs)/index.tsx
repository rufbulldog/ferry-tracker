import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNextDepartures } from '../../src/hooks/useNextDepartures';
import { FerryCard } from '../../src/components/FerryCard';
import { useRoute } from '../../src/context/RouteContext';

export default function DepartScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { route } = useRoute();

  const { data: departures, isLoading, error } = useNextDepartures(route);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['vesselLocations'] });
    await queryClient.invalidateQueries({ queryKey: ['terminalSailingSpace'] });
    setRefreshing(false);
  }, [queryClient]);

  // Separate departed ferries from upcoming ones
  const departedFerries = departures?.filter(d => d.status === 'departed') || [];
  const upcomingFerries = departures?.filter(d => d.status !== 'departed') || [];

  const nextDeparture = upcomingFerries[0];
  const upcomingDepartures = upcomingFerries.slice(1, 6);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {isLoading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1565C0" />
          <Text style={styles.loadingText}>Loading ferry data...</Text>
        </View>
      )}

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.errorText}>
              Unable to load ferry data
            </Text>
            <Text variant="bodySmall" style={styles.errorDetail}>
              {error.message}
            </Text>
            <Text variant="bodySmall" style={styles.errorHint}>
              Pull down to refresh
            </Text>
          </Card.Content>
        </Card>
      )}

      {!isLoading && !error && departures?.length === 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyLarge">No scheduled departures found</Text>
            <Text variant="bodySmall" style={styles.noDataHint}>
              Pull down to refresh
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Recently departed ferries (scroll up to see) */}
      {departedFerries.length > 0 && (
        <>
          <Text variant="titleMedium" style={styles.departedTitle}>
            RECENTLY DEPARTED
          </Text>
          {departedFerries.map((departure) => (
            <FerryCard
              key={`${departure.vesselId}-${departure.scheduledDeparture.getTime()}`}
              departure={departure}
              isMainCard={false}
            />
          ))}
        </>
      )}

      {/* Main departure card with visual tracking */}
      {nextDeparture && (
        <>
          <Text variant="titleMedium" style={styles.nextTitle}>
            NEXT DEPARTURE
          </Text>
          <FerryCard
            departure={nextDeparture}
            isMainCard={true}
          />
        </>
      )}

      {/* Upcoming departures */}
      {upcomingDepartures.length > 0 && (
        <>
          <Text variant="titleMedium" style={styles.upcomingTitle}>
            UPCOMING
          </Text>
          {upcomingDepartures.map((departure) => (
            <FerryCard
              key={`${departure.vesselId}-${departure.scheduledDeparture.getTime()}`}
              departure={departure}
              isMainCard={false}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  departedTitle: {
    marginBottom: 8,
    color: '#999',
  },
  nextTitle: {
    marginBottom: 8,
    marginTop: 8,
    color: '#1565C0',
    fontWeight: '600',
  },
  upcomingTitle: {
    marginBottom: 8,
    marginTop: 8,
    color: '#666',
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: '#C62828',
  },
  errorDetail: {
    color: '#666',
    marginTop: 4,
  },
  errorHint: {
    color: '#999',
    marginTop: 8,
  },
  noDataHint: {
    color: '#999',
    marginTop: 8,
  },
});
