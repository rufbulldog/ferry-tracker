import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNextDepartures } from '../../src/hooks/useNextDepartures';
import { useTerminalBulletins } from '../../src/hooks/useTerminalBulletins';
import { FerryCard } from '../../src/components/FerryCard';
import { MainDepartureCard } from '../../src/components/MainDepartureCard';
import { LastDepartureCard } from '../../src/components/LastDepartureCard';
import { AlertBanner } from '../../src/components/AlertBanner';
import { useRoute } from '../../src/context/RouteContext';
import { ROUTES, TERMINALS } from '../../src/utils/constants';

// Terminal ID to display name mapping
const TERMINAL_NAMES: Record<number, string> = {
  [TERMINALS.SEATTLE]: 'Seattle',
  [TERMINALS.BAINBRIDGE]: 'Bainbridge',
  [TERMINALS.KINGSTON]: 'Kingston',
  [TERMINALS.EDMONDS]: 'Edmonds',
};

export default function DepartScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { route } = useRoute();

  const { data: departures, isLoading, error } = useNextDepartures(route);
  const { activeAlert } = useTerminalBulletins(route);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['vesselLocations'] });
    await queryClient.invalidateQueries({ queryKey: ['terminalSailingSpace'] });
    await queryClient.invalidateQueries({ queryKey: ['terminalBulletins'] });
    setRefreshing(false);
  }, [queryClient]);

  // Separate departed ferries from upcoming ones
  const departedFerries = departures?.filter(d => d.status === 'departed') || [];
  const upcomingFerries = departures?.filter(d => d.status !== 'departed') || [];

  // Get the most recent departed ferry (for the last departure card)
  const lastDeparture = departedFerries.length > 0 ? departedFerries[departedFerries.length - 1] : null;

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

      {/* Active alert banner */}
      {activeAlert && (
        <AlertBanner alert={activeAlert} />
      )}

      {/* Last departure card at top */}
      {lastDeparture && (
        <LastDepartureCard departure={lastDeparture} />
      )}

      {/* Main departure card - large tank style */}
      {nextDeparture && (
        <MainDepartureCard
          departure={nextDeparture}
          terminalId={ROUTES[route].from}
          terminalName={TERMINAL_NAMES[ROUTES[route].from] || 'Terminal'}
        />
      )}

      {/* Upcoming departures - below the fold */}
      {upcomingDepartures.length > 0 && (
        <View style={styles.upcomingSection}>
          <Text variant="titleMedium" style={styles.upcomingTitle}>
            UPCOMING DEPARTURES
          </Text>
          {upcomingDepartures.map((departure) => (
            <FerryCard
              key={`${departure.vesselId}-${departure.scheduledDeparture.getTime()}`}
              departure={departure}
              isMainCard={false}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  upcomingSection: {
    marginTop: 24,
  },
  upcomingTitle: {
    marginBottom: 12,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.5,
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
