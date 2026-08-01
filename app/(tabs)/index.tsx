import { View, StyleSheet, ScrollView, RefreshControl, Animated, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNextDepartures, DepartureInfo } from '../../src/hooks/useNextDepartures';
import { useTerminalBulletins } from '../../src/hooks/useTerminalBulletins';
import { useLatestDeparturePair } from '../../src/hooks/useLatestDeparture';
import { FerryCard } from '../../src/components/FerryCard';
import { MainDepartureCard } from '../../src/components/MainDepartureCard';
import { LastDepartureCard } from '../../src/components/LastDepartureCard';
import { AlertBanner } from '../../src/components/AlertBanner';
import { KingstonBoardingPassPill } from '../../src/components/KingstonBoardingPassPill';
import { useRoute } from '../../src/context/RouteContext';
import { useTheme } from '../../src/context/ThemeContext';
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
  const { route, animationDirection, clearAnimation } = useRoute();
  const { theme } = useTheme();

  // Simple slide + fade animation for direction changes
  const slideAnim = useState(() => new Animated.Value(0))[0];
  const opacityAnim = useState(() => new Animated.Value(1))[0];

  useEffect(() => {
    if (animationDirection) {
      // Start with a subtle offset and faded out
      const startX = animationDirection === 'right' ? 60 : -60;
      slideAnim.setValue(startX);
      opacityAnim.setValue(0.3);

      // Animate to center with full opacity
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => clearAnimation());
    }
  }, [animationDirection, clearAnimation, slideAnim, opacityAnim]);

  const { data: departures, isLoading, error } = useNextDepartures(route);
  const { activeAlert } = useTerminalBulletins(route);

  // Get latest departure data from backend for capacity fallback
  const { latestDeparture, latestIncoming } = useLatestDeparturePair(route);

  // Animation state for ferry departure transitions
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'animating'>('idle');
  const [departingCard, setDepartingCard] = useState<DepartureInfo | null>(null);
  const prevNextDepartureRef = useRef<DepartureInfo | null>(null);

  // Animation values for departing card
  const mainCardScale = useState(() => new Animated.Value(1))[0];
  const mainCardTranslateY = useState(() => new Animated.Value(0))[0];
  const mainCardOpacity = useState(() => new Animated.Value(1))[0];

  // Animation values for incoming card
  const incomingCardScale = useState(() => new Animated.Value(0.5))[0];
  const incomingCardTranslateY = useState(() => new Animated.Value(200))[0];
  const incomingCardOpacity = useState(() => new Animated.Value(0))[0];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['vesselLocations'] });
    await queryClient.invalidateQueries({ queryKey: ['terminalSailingSpace'] });
    await queryClient.invalidateQueries({ queryKey: ['terminalBulletins'] });
    setRefreshing(false);
  }, [queryClient]);

  // Separate departed ferries from upcoming ones. Memoized so the arrays keep a
  // stable identity across renders (they feed the departure-transition effect's
  // dependency array below).
  const departedFerries = useMemo(
    () => departures?.filter(d => d.status === 'departed') || [],
    [departures]
  );
  const upcomingFerries = useMemo(
    () => departures?.filter(d => d.status !== 'departed') || [],
    [departures]
  );

  // Get the most recent departed ferry (for the last departure card)
  const lastDeparture = departedFerries.length > 0 ? departedFerries[departedFerries.length - 1] : null;

  const nextDeparture = upcomingFerries[0];
  const upcomingDepartures = upcomingFerries.slice(1, 6);

  // Animation sequence for ferry departure
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

  // Reset animation state when route changes. Intentional sync of transition
  // state to the route prop — clears any in-flight card transition on switch.
  useEffect(() => {
    prevNextDepartureRef.current = null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      style={[styles.container, { backgroundColor: theme.colors.pageBg }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
    >
      {isLoading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading ferry data...</Text>
        </View>
      )}

      {error && (
        <Card style={[styles.errorCard, { backgroundColor: theme.colors.cardBg }]}>
          <Card.Content>
            <Text variant="bodyLarge" style={{ color: theme.colors.error }}>
              Unable to load ferry data
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.textMuted }}>
              {error.message}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.textMuted }}>
              Pull down to refresh
            </Text>
          </Card.Content>
        </Card>
      )}

      {!isLoading && !error && departures?.length === 0 && (
        <Card style={[styles.card, { backgroundColor: theme.colors.cardBg }]}>
          <Card.Content>
            <Text variant="bodyLarge" style={{ color: theme.colors.text }}>No scheduled departures found</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.textMuted }}>
              Pull down to refresh
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Kingston vehicle boarding-pass notice — only when departing Kingston */}
      {ROUTES[route].from === TERMINALS.KINGSTON && <KingstonBoardingPassPill />}

      {/* Active alert banner */}
      {activeAlert && (
        <AlertBanner alert={activeAlert} />
      )}

      {/* Cards container with slide animation */}
      <Animated.View
        style={[
          styles.cardsContainer,
          { transform: [{ translateX: slideAnim }], opacity: opacityAnim },
        ]}
      >
        {/* Last departure card - hidden during animation */}
        {lastDeparture && transitionPhase === 'idle' && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.colors.textMuted, marginTop: 0 }]}>DEPARTED</Text>
            <LastDepartureCard
              departure={lastDeparture}
              backendCapacityPercent={latestDeparture?.capacityPercent}
            />
          </>
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
          <>
            <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>NEXT SAILING</Text>
            <MainDepartureCard
              departure={nextDeparture}
              terminalId={ROUTES[route].from}
              terminalName={TERMINAL_NAMES[ROUTES[route].from] || 'Terminal'}
              backendIncomingCapacity={latestIncoming?.capacityPercent}
            />
          </>
        )}
      </Animated.View>

      {/* Upcoming departures - below the fold */}
      {upcomingDepartures.length > 0 && (
        <View style={styles.upcomingSection}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
            UPCOMING
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
  },
  card: {
    marginBottom: 12,
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
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 12,
  },
  errorCard: {
    marginBottom: 16,
  },
});
