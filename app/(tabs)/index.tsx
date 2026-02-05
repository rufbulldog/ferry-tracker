import { View, StyleSheet, ScrollView, RefreshControl, Animated, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNextDepartures, DepartureInfo } from '../../src/hooks/useNextDepartures';
import { useTerminalBulletins } from '../../src/hooks/useTerminalBulletins';
import { useLatestDeparturePair } from '../../src/hooks/useLatestDeparture';
import { FerryCard } from '../../src/components/FerryCard';
import { MainDepartureCard } from '../../src/components/MainDepartureCard';
import { LastDepartureCard } from '../../src/components/LastDepartureCard';
import { AlertBanner } from '../../src/components/AlertBanner';
import { useRoute } from '../../src/context/RouteContext';
import { ROUTES, TERMINALS } from '../../src/utils/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAIN_CARD_HEIGHT = SCREEN_HEIGHT * 0.55;
const LAST_DEPARTURE_HEIGHT = 70;
const SCALE_RATIO = LAST_DEPARTURE_HEIGHT / MAIN_CARD_HEIGHT;
const TRANSLATE_UP = -(MAIN_CARD_HEIGHT / 2) + (LAST_DEPARTURE_HEIGHT / 2);

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

  // Get latest departure data from backend for capacity fallback
  const { latestDeparture, latestIncoming } = useLatestDeparturePair(route);

  // Animation state
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'animating'>('idle');
  const [departingCard, setDepartingCard] = useState<DepartureInfo | null>(null);
  const prevNextDepartureRef = useRef<DepartureInfo | null>(null);

  // Animation values for departing card
  const mainCardScale = useRef(new Animated.Value(1)).current;
  const mainCardTranslateY = useRef(new Animated.Value(0)).current;
  const mainCardOpacity = useRef(new Animated.Value(1)).current;

  // Animation values for incoming card
  const incomingCardScale = useRef(new Animated.Value(0.5)).current;
  const incomingCardTranslateY = useRef(new Animated.Value(200)).current;
  const incomingCardOpacity = useRef(new Animated.Value(0)).current;

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

  // Animation sequence
  const runDepartureTransition = useCallback(() => {
    Animated.parallel([
      // Departing card shrinks and moves up
      Animated.timing(mainCardScale, {
        toValue: SCALE_RATIO,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(mainCardTranslateY, {
        toValue: TRANSLATE_UP,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(mainCardOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      // Incoming card scales up from below
      Animated.timing(incomingCardScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(incomingCardTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(incomingCardOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animation values
      mainCardScale.setValue(1);
      mainCardTranslateY.setValue(0);
      mainCardOpacity.setValue(1);
      incomingCardScale.setValue(0.5);
      incomingCardTranslateY.setValue(200);
      incomingCardOpacity.setValue(0);
      setTransitionPhase('idle');
      setDepartingCard(null);
    });
  }, [mainCardScale, mainCardTranslateY, mainCardOpacity, incomingCardScale, incomingCardTranslateY, incomingCardOpacity]);

  // Reset animation state when route changes
  useEffect(() => {
    prevNextDepartureRef.current = null;
    setTransitionPhase('idle');
    setDepartingCard(null);
  }, [route]);

  // Detect departure transition - only when a ferry actually departs, not on route change
  useEffect(() => {
    const prev = prevNextDepartureRef.current;
    const current = nextDeparture;

    // Skip if no previous ref (initial load or route change)
    if (!prev) {
      prevNextDepartureRef.current = current || null;
      return;
    }

    // Detect when main departure changes and previous one departed
    if (current && prev.vesselId !== current.vesselId && transitionPhase === 'idle') {
      const prevNowDeparted = departedFerries.find(
        d => d.vesselId === prev.vesselId && d.status === 'departed'
      );
      if (prevNowDeparted) {
        setDepartingCard(prevNowDeparted);
        setTransitionPhase('animating');
        runDepartureTransition();
      }
    }
    prevNextDepartureRef.current = current || null;
  }, [nextDeparture, departedFerries, transitionPhase, runDepartureTransition]);

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

      {/* Cards container for animation */}
      <View style={styles.cardsContainer}>
        {/* Last departure card - hidden during animation */}
        {lastDeparture && transitionPhase === 'idle' && (
          <LastDepartureCard
            departure={lastDeparture}
            backendCapacityPercent={latestDeparture?.capacityPercent}
          />
        )}

        {/* Departing card (animating out to LastDeparture position) */}
        {transitionPhase === 'animating' && departingCard && (
          <Animated.View
            style={[
              styles.animatingCard,
              {
                zIndex: 10,
                transform: [
                  { scale: mainCardScale },
                  { translateY: mainCardTranslateY },
                ],
                opacity: mainCardOpacity,
              },
            ]}
          >
            <MainDepartureCard
              departure={departingCard}
              terminalId={ROUTES[route].from}
              terminalName={TERMINAL_NAMES[ROUTES[route].from] || 'Terminal'}
              isAnimatingOut
            />
          </Animated.View>
        )}

        {/* Incoming card (animating into Main position) */}
        {transitionPhase === 'animating' && nextDeparture && (
          <Animated.View
            style={[
              styles.incomingCard,
              {
                transform: [
                  { scale: incomingCardScale },
                  { translateY: incomingCardTranslateY },
                ],
                opacity: incomingCardOpacity,
              },
            ]}
          >
            <MainDepartureCard
              departure={nextDeparture}
              terminalId={ROUTES[route].from}
              terminalName={TERMINAL_NAMES[ROUTES[route].from] || 'Terminal'}
              backendIncomingCapacity={latestIncoming?.capacityPercent}
            />
          </Animated.View>
        )}

        {/* Normal main card when not animating */}
        {transitionPhase === 'idle' && nextDeparture && (
          <MainDepartureCard
            departure={nextDeparture}
            terminalId={ROUTES[route].from}
            terminalName={TERMINAL_NAMES[ROUTES[route].from] || 'Terminal'}
            backendIncomingCapacity={latestIncoming?.capacityPercent}
          />
        )}
      </View>

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
  cardsContainer: {
    position: 'relative',
    minHeight: MAIN_CARD_HEIGHT + 16,
  },
  animatingCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  incomingCard: {
    marginTop: LAST_DEPARTURE_HEIGHT + 12,
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
