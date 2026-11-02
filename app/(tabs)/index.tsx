import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from "react-native";
import { Text, Card, ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useNextDepartures,
  DepartureInfo,
} from "../../src/hooks/useNextDepartures";
import { useTerminalBulletins } from "../../src/hooks/useTerminalBulletins";
import { useLatestDeparturePair } from "../../src/hooks/useLatestDeparture";
import { FerryCard } from "../../src/components/FerryCard";
import {
  MainDepartureCard,
  DeparturePlan,
} from "../../src/components/MainDepartureCard";
import { CheckInFAB } from "../../src/components/CheckInFAB";
import { AlertBanner } from "../../src/components/AlertBanner";
import { KingstonBoardingPassPill } from "../../src/components/KingstonBoardingPassPill";
import { CarWaitChip } from "../../src/components/CarWaitChip";
import { BestSailingCard } from "../../src/components/BestSailingCard";
import { LiveActivityPill } from "../../src/components/LiveActivityPill";
import {
  useBestSailingContext,
  type LiveSource,
} from "../../src/context/BestSailingContext";
import type { FerryLiveState } from "../../modules/ferry-live";
import { useRecommendation } from "../../src/hooks/useRecommendation";
import { usePlannedArrival } from "../../src/hooks/useArrivalEta";
import { useRoute } from "../../src/context/RouteContext";
import { useTheme } from "../../src/context/ThemeContext";
import {
  ROUTES,
  TERMINALS,
  crossingMinutesForRoute,
} from "../../src/utils/constants";
import { formatTime } from "../../src/utils/time";
import { TRAVEL_TIMES } from "../../src/utils/transitConfig";
import { Vehicle } from "../../src/types/storage";

const DEPARTURE_LIFT = 24;

// Persist the Bike/Car choice for the leave-by plan.
const VEHICLE_KEY = "@ferry/vehicle";

// Terminal ID to display name mapping
const TERMINAL_NAMES: Record<number, string> = {
  [TERMINALS.SEATTLE]: "Seattle",
  [TERMINALS.BAINBRIDGE]: "Bainbridge",
  [TERMINALS.KINGSTON]: "Kingston",
  [TERMINALS.EDMONDS]: "Edmonds",
  [TERMINALS.BREMERTON]: "Bremerton",
};

export default function DepartScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle>("bike");
  // Re-render every minute so the leave-in / departs-in countdowns stay current.
  const [, setTick] = useState(0);
  // Measured Next Sailing card height, for the departure transition.
  const queryClient = useQueryClient();
  const { route, animationDirection, clearAnimation } = useRoute();
  const { theme } = useTheme();

  // Simple slide + fade animation for direction changes
  const slideAnim = useState(() => new Animated.Value(0))[0];
  const opacityAnim = useState(() => new Animated.Value(1))[0];

  useEffect(() => {
    if (animationDirection) {
      // Start with a subtle offset and faded out
      const startX = animationDirection === "right" ? 60 : -60;
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

  // Restore the persisted vehicle once on mount.
  useEffect(() => {
    AsyncStorage.getItem(VEHICLE_KEY)
      .then((v) => {
        if (v === "bike" || v === "car") setVehicle(v);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const chooseVehicle = useCallback((v: Vehicle) => {
    setVehicle(v);
    AsyncStorage.setItem(VEHICLE_KEY, v).catch(() => {});
  }, []);

  const { data: departures, isLoading, error } = useNextDepartures(route);
  const { activeAlert } = useTerminalBulletins(route);

  // Get latest departure data from backend for capacity fallback
  const { latestDeparture } = useLatestDeparturePair(route);

  // Leave-by plan (formerly the Leave tab). Only offer modes this route uses.
  const routeModes = TRAVEL_TIMES[route];
  const vehicles = (["bike", "car"] as Vehicle[]).filter(
    (v) => routeModes[v] !== null,
  );
  const planVehicle = vehicles.includes(vehicle)
    ? vehicle
    : (vehicles[0] ?? vehicle);
  const recommendation = useRecommendation(route, planVehicle);
  const plannedArrival = usePlannedArrival(
    route,
    recommendation.plannedDepartureTime,
  );

  // Animation state for ferry departure transitions
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "animating">(
    "idle",
  );
  const [departingCard, setDepartingCard] = useState<DepartureInfo | null>(
    null,
  );
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
    await queryClient.invalidateQueries({ queryKey: ["vesselLocations"] });
    await queryClient.invalidateQueries({ queryKey: ["terminalSailingSpace"] });
    await queryClient.invalidateQueries({ queryKey: ["terminalBulletins"] });
    await queryClient.invalidateQueries({ queryKey: ["transitRecords"] });
    setRefreshing(false);
  }, [queryClient]);

  // Separate departed ferries from upcoming ones. Memoized so the arrays keep a
  // stable identity across renders (they feed the departure-transition effect's
  // dependency array below).
  const departedFerries = useMemo(
    () => departures?.filter((d) => d.status === "departed") || [],
    [departures],
  );
  const upcomingFerries = useMemo(
    () => departures?.filter((d) => d.status !== "departed") || [],
    [departures],
  );

  // Get the most recent departed ferry (for the last departure card)
  const lastDeparture =
    departedFerries.length > 0
      ? departedFerries[departedFerries.length - 1]
      : null;

  const nextDeparture = upcomingFerries[0];
  const upcomingDepartures = upcomingFerries.slice(1, 6);

  // Where the plan's sailing came from matters: the card shows the first
  // upcoming sailing, and the plan only applies when it targets that one (a
  // car-overflow plan names the later sailing in its note instead).
  const planIsForCard =
    !!nextDeparture &&
    recommendation.nextDeparture?.vesselId === nextDeparture.vesselId &&
    recommendation.nextDeparture?.scheduledDeparture.getTime() ===
      nextDeparture.scheduledDeparture.getTime();

  const carNote =
    planVehicle === "car" && recommendation.carWait
      ? recommendation.carWait.extraSailings > 0 &&
        recommendation.boardableDepartureTime
        ? `As a car, expect the ${formatTime(recommendation.boardableDepartureTime)} sailing (+${recommendation.carWait.extraMinutes} min)`
        : recommendation.carWait.atRisk
          ? recommendation.carWait.note
          : null
      : null;

  const plan: DeparturePlan | undefined = planIsForCard
    ? {
        vehicle: planVehicle,
        vehicles,
        onVehicleChange: chooseVehicle,
        leaveByTime: recommendation.leaveByTime,
        carNote,
        arrival: plannedArrival,
      }
    : undefined;

  // "Best from here" is for driving from somewhere unusual (Car mode, or away
  // from home/work/terminals). On the bike commute the card below already
  // answers "when do I leave", so the Live Activity mirrors that instead.
  const { awayFromCommute, setCommuteLive, best, driveAround } = useBestSailingContext();
  // The card renders nothing without a plan (no fix yet, nothing reachable);
  // then the Next Sailing leave-by keeps the Lock Screen pill.
  const showBestFromHere = (vehicle === "car" || awayFromCommute) && (!!best || !!driveAround);
  const commuteLeaveByMs =
    planIsForCard && recommendation.leaveByTime
      ? recommendation.leaveByTime.getTime()
      : null;
  const commuteDepartureMs = recommendation.ferryDepartureTime?.getTime() ?? null;
  const commuteSpaces = recommendation.nextDeparture?.driveUpSpaces ?? null;
  const commuteVessel = recommendation.nextDeparture?.vesselName ?? null;
  const commuteLive = useMemo<LiveSource | null>(() => {
    if (showBestFromHere || commuteLeaveByMs == null || commuteDepartureMs == null) {
      return null;
    }
    const from = ROUTES[route].from;
    const state: FerryLiveState = {
      routeLabel: ROUTES[route].label,
      terminal: TERMINAL_NAMES[from] ?? "Terminal",
      departureMs: commuteDepartureMs,
      leaveByMs: commuteLeaveByMs,
      arrivalMs: commuteDepartureMs + crossingMinutesForRoute(route) * 60_000,
      // Non-zero keeps the widget on its countdown (0 reads "At terminal").
      driveMinutes: Math.max(1, recommendation.transitMinutes),
      note: planVehicle === "bike" ? "By bike" : "By car",
      spaces: commuteSpaces,
      vesselName: commuteVessel,
    };
    return { state, car: planVehicle === "car" };
  }, [
    commuteSpaces,
    commuteVessel,
    showBestFromHere,
    commuteLeaveByMs,
    commuteDepartureMs,
    route,
    recommendation.transitMinutes,
    planVehicle,
  ]);
  useEffect(() => {
    setCommuteLive(commuteLive);
  }, [commuteLive, setCommuteLive]);
  useEffect(() => () => setCommuteLive(null), [setCommuteLive]);


  // "How leave-by is worked out" — shown behind the ⓘ on the card's Leave label.
  const whyLines =
    plan && recommendation.reasoning.length > 0
      ? [
          ...recommendation.reasoning,
          ...(plannedArrival?.etaTime && plannedArrival.ferryArrivalTime
            ? [
                `${plannedArrival.label} ${formatTime(plannedArrival.etaTime)}: ferry lands ${formatTime(plannedArrival.ferryArrivalTime)} + ${plannedArrival.transitMinutes} min bike${
                  plannedArrival.sampleSize > 0
                    ? ` (from ${plannedArrival.sampleSize} recorded trip${plannedArrival.sampleSize !== 1 ? "s" : ""})`
                    : " (default)"
                }`,
              ]
            : []),
        ]
      : undefined;

  // The departed boat now lives as a strip inside the card, so the old card
  // just lifts and fades as the next one slides in.
  const scaleRatio = 0.92;
  const translateUp = -DEPARTURE_LIFT;

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
      setTransitionPhase("idle");
      setDepartingCard(null);
    });
  }, [
    mainCardScale,
    mainCardTranslateY,
    mainCardOpacity,
    incomingCardScale,
    incomingCardTranslateY,
    incomingCardOpacity,
    scaleRatio,
    translateUp,
  ]);

  // Reset animation state when route changes. Intentional sync of transition
  // state to the route prop — clears any in-flight card transition on switch.
  useEffect(() => {
    prevNextDepartureRef.current = null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTransitionPhase("idle");
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
    if (
      current &&
      prev.vesselId !== current.vesselId &&
      transitionPhase === "idle"
    ) {
      const prevNowDeparted = departedFerries.find(
        (d) => d.vesselId === prev.vesselId && d.status === "departed",
      );
      if (prevNowDeparted) {
        setDepartingCard(prevNowDeparted);
        setTransitionPhase("animating");
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
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {isLoading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
            Loading ferry data...
          </Text>
        </View>
      )}

      {error && (
        <Card
          style={[styles.errorCard, { backgroundColor: theme.colors.cardBg }]}
        >
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
            <Text variant="bodyLarge" style={{ color: theme.colors.text }}>
              No scheduled departures found
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.textMuted }}>
              Pull down to refresh
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Notices */}
      <View>
        {/* Kingston vehicle boarding-pass notice — only when departing Kingston */}
        {ROUTES[route].from === TERMINALS.KINGSTON && (
          <KingstonBoardingPassPill />
        )}

        {/* Car-overflow notice — only when a real wait signal is present */}
        <CarWaitChip route={route} />

        {/* Active alert banner */}
        {activeAlert && <AlertBanner alert={activeAlert} />}
      </View>

      {/* Cards container with slide animation */}
      <Animated.View
        style={[
          styles.cardsContainer,
          { transform: [{ translateX: slideAnim }], opacity: opacityAnim },
        ]}
      >
        {/* Departing card (animating out to LastDeparture position) */}
        {transitionPhase === "animating" && departingCard && (
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
              terminalName={TERMINAL_NAMES[ROUTES[route].from] || "Terminal"}
              isAnimatingOut
            />
          </Animated.View>
        )}

        {/* Incoming card (animating into Main position) */}
        {transitionPhase === "animating" && nextDeparture && (
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
              terminalName={TERMINAL_NAMES[ROUTES[route].from] || "Terminal"}
              plan={plan}
              departed={lastDeparture}
              departedCapacityPercent={latestDeparture?.capacityPercent}
              reasoning={whyLines}
            />
          </Animated.View>
        )}

        {/* Normal main card when not animating */}
        {transitionPhase === "idle" && nextDeparture && (
          <>
            <View>
              <MainDepartureCard
                departure={nextDeparture}
                terminalId={ROUTES[route].from}
                terminalName={TERMINAL_NAMES[ROUTES[route].from] || "Terminal"}
                plan={plan}
                departed={lastDeparture}
                departedCapacityPercent={latestDeparture?.capacityPercent}
                reasoning={whyLines}
              />
            </View>
            {commuteLive && <LiveActivityPill style={styles.commutePill} />}
            <CheckInFAB inline />
          </>
        )}
      </Animated.View>

      {/* Best terminal + sailing to drive to from your live position — a
          different trip from the route above, so it sits below it. */}
      {showBestFromHere && <BestSailingCard />}

      {/* Upcoming departures */}
      {upcomingDepartures.length > 0 && (
        <View style={styles.upcomingSection}>
          <Text
            style={[styles.sectionLabel, { color: theme.colors.textMuted }]}
          >
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
  commutePill: { alignSelf: "center", marginTop: 12, marginBottom: 12 },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
  },
  card: {
    marginBottom: 12,
  },
  cardsContainer: {
    position: "relative",
  },
  animatingCard: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  incomingCard: {
    marginTop: 0,
  },
  upcomingSection: {
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 12,
  },
  errorCard: {
    marginBottom: 16,
  },
});
