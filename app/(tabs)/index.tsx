import { View, StyleSheet, ScrollView, RefreshControl, Animated, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNextDepartures, DepartureInfo } from '../../src/hooks/useNextDepartures';
import { useTerminalBulletins } from '../../src/hooks/useTerminalBulletins';
import { useLatestDeparturePair } from '../../src/hooks/useLatestDeparture';
import { FerryCard } from '../../src/components/FerryCard';
import { MainDepartureCard } from '../../src/components/MainDepartureCard';
import { LastDepartureCard } from '../../src/components/LastDepartureCard';
import { ArrivingCard } from '../../src/components/ArrivingCard';
import { AlertBanner } from '../../src/components/AlertBanner';
import { KingstonBoardingPassPill } from '../../src/components/KingstonBoardingPassPill';
import { CarWaitChip } from '../../src/components/CarWaitChip';
import { useRoute } from '../../src/context/RouteContext';
import { useTheme } from '../../src/context/ThemeContext';
import { ROUTES, TERMINALS } from '../../src/utils/constants';

const LAST_DEPARTURE_HEIGHT = 70;

// The Next Sailing card fills whatever vertical space is left in the viewport
// after the notices (boarding-pass pill, alerts, car-wait chip), the collapsible
// Departed/Arriving block, and the NEXT SAILING label — minus a fixed peek so
// the Upcoming section always shows at the bottom. Those variable-height pieces
// are measured (onLayout) rather than estimated, so anything we add above the
// card is accounted for automatically.
const UPCOMING_PEEK = 46; // px of the Upcoming section left visible above the fold
const NEXT_SAILING_LABEL_H = 42; // NEXT SAILING label + its margins
const CARD_BOTTOM_MARGIN = 16;
const SCROLL_TOP_PADDING = 16;
const MAIN_CARD_MIN = 220; // floor so the card never collapses to nothing

// Persist the Departed/Arriving block's collapsed state across launches.
const TOP_BLOCK_COLLAPSED_KEY = '@ferry/topblock-collapsed';

// Terminal ID to display name mapping
const TERMINAL_NAMES: Record<number, string> = {
  [TERMINALS.SEATTLE]: 'Seattle',
  [TERMINALS.BAINBRIDGE]: 'Bainbridge',
  [TERMINALS.KINGSTON]: 'Kingston',
  [TERMINALS.EDMONDS]: 'Edmonds',
};

export default function DepartScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [topBlockCollapsed, setTopBlockCollapsed] = useState(false);
  // Measured heights that feed the Next Sailing card sizing (see mainCardHeight).
  const [viewportH, setViewportH] = useState(0);
  const [noticesH, setNoticesH] = useState(0);
  const [topBlockH, setTopBlockH] = useState(0);
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

  // Restore the persisted collapsed state once on mount.
  useEffect(() => {
    AsyncStorage.getItem(TOP_BLOCK_COLLAPSED_KEY)
      .then((v) => { if (v === 'true') setTopBlockCollapsed(true); })
      .catch(() => {});
  }, []);

  const toggleTopBlock = useCallback(() => {
    setTopBlockCollapsed((prev) => {
      const next = !prev;
      AsyncStorage.setItem(TOP_BLOCK_COLLAPSED_KEY, String(next)).catch(() => {});
      return next;
    });
  }, []);

  // onLayout helper: update a measured height only when it meaningfully changes,
  // so we don't churn renders on sub-pixel differences.
  const measure = useCallback(
    (setter: (updater: (prev: number) => number) => void) => (e: LayoutChangeEvent) => {
      const h = e.nativeEvent.layout.height;
      setter((prev) => (Math.abs(prev - h) > 0.5 ? h : prev));
    },
    [],
  );

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

  // The Arriving slot applies while the assigned vessel is inbound (arriving /
  // returning) and also once it has docked and is boarding (a placeholder), so
  // the slot doesn't blink out the moment the boat arrives.
  const arrivingStatus = nextDeparture?.status;
  const hasArrivingSlot =
    arrivingStatus === 'arriving' || arrivingStatus === 'returning' || arrivingStatus === 'loading';
  const hasDeparted = !!lastDeparture;
  const showTopBlock = hasDeparted || hasArrivingSlot;

  // Combined header names for whatever the block currently holds.
  const topHeaderLabel = [hasDeparted && 'DEPARTED', hasArrivingSlot && 'ARRIVING']
    .filter(Boolean)
    .join('  ·  ');

  // Size the Next Sailing card to fill the remaining viewport (minus a fixed
  // Upcoming peek). topBlockH only counts while the block is actually shown.
  const effectiveTopBlockH = transitionPhase === 'idle' && showTopBlock ? topBlockH : 0;
  const availableH =
    viewportH - SCROLL_TOP_PADDING - noticesH - effectiveTopBlockH -
    NEXT_SAILING_LABEL_H - CARD_BOTTOM_MARGIN - UPCOMING_PEEK;
  const mainCardHeight = Math.max(MAIN_CARD_MIN, availableH);
  const scaleRatio = LAST_DEPARTURE_HEIGHT / mainCardHeight;
  const translateUp = -(mainCardHeight / 2) + (LAST_DEPARTURE_HEIGHT / 2);

  // Animation sequence for ferry departure
  const runDepartureTransition = useCallback(() => {
    Animated.parallel([
      // Departing card shrinks and moves up
      Animated.timing(mainCardScale, {
        toValue: scaleRatio,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(mainCardTranslateY, {
        toValue: translateUp,
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
  }, [mainCardScale, mainCardTranslateY, mainCardOpacity, incomingCardScale, incomingCardTranslateY, incomingCardOpacity, scaleRatio, translateUp]);

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
      onLayout={measure(setViewportH)}
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

      {/* Notices — measured so the Next Sailing card can account for their height
          and keep the Upcoming section peeking at the bottom. */}
      <View onLayout={measure(setNoticesH)}>
        {/* Kingston vehicle boarding-pass notice — only when departing Kingston */}
        {ROUTES[route].from === TERMINALS.KINGSTON && <KingstonBoardingPassPill />}

        {/* Car-overflow notice — only when a real wait signal is present */}
        <CarWaitChip route={route} />

        {/* Active alert banner */}
        {activeAlert && (
          <AlertBanner alert={activeAlert} />
        )}
      </View>

      {/* Cards container with slide animation */}
      <Animated.View
        style={[
          styles.cardsContainer,
          { minHeight: mainCardHeight + 16, transform: [{ translateX: slideAnim }], opacity: opacityAnim },
        ]}
      >
        {/* Departed + Arriving — one collapsible block, hidden during animation */}
        {showTopBlock && transitionPhase === 'idle' && (
          <View onLayout={measure(setTopBlockH)}>
            <TouchableOpacity
              style={styles.collapsibleHeader}
              onPress={toggleTopBlock}
              activeOpacity={0.7}
            >
              <Text style={[styles.sectionLabel, { color: theme.colors.textMuted, marginTop: 0 }]}>{topHeaderLabel}</Text>
              <Ionicons
                name={topBlockCollapsed ? 'chevron-down' : 'chevron-up'}
                size={16}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
            {!topBlockCollapsed && (
              <>
                {hasDeparted && (
                  <LastDepartureCard
                    departure={lastDeparture}
                    backendCapacityPercent={latestDeparture?.capacityPercent}
                  />
                )}
                {hasArrivingSlot && nextDeparture && (
                  <ArrivingCard
                    departure={nextDeparture}
                    backendIncomingCapacity={latestIncoming?.capacityPercent}
                  />
                )}
              </>
            )}
          </View>
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
              height={mainCardHeight}
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
              height={mainCardHeight}
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
              height={mainCardHeight}
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
    // minHeight is applied inline (dynamic — see mainCardHeight).
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
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorCard: {
    marginBottom: 16,
  },
});
