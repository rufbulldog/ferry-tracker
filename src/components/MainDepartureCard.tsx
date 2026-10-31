import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  PanResponder,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { DepartureInfo } from '../hooks/useNextDepartures';
import { TERMINAL_CAMERAS } from '../utils/constants';
import { formatTime, getMinutesUntil } from '../utils/time';
import { effectiveFerryDeparture } from '../utils/ferryDeparture';
import { CAPACITY_TONE_LABEL, capacityTone, carsPerBar, percentFull } from '../utils/capacityMeter';
import { ArrivalEta } from '../utils/arrivalPlan';
import { Vehicle } from '../types/storage';
import { useTheme } from '../context/ThemeContext';
import { CarMeter } from './CarMeter';

// Leave-by within this many minutes reads as "get moving" (warning color).
const LEAVE_SOON_MINUTES = 10;

// Cosmetic only: a predicted delay at/above this many minutes uses the "error"
// color instead of "warning" (matching the app's orange→red lateness cues).
const SEVERE_PREDICTED_DELAY_MINUTES = 20;

/** The leave-by plan for this sailing (formerly the Leave tab). */
export interface DeparturePlan {
  vehicle: Vehicle;
  /** Modes configured for this route; the toggle shows only when there's a choice. */
  vehicles: Vehicle[];
  onVehicleChange: (vehicle: Vehicle) => void;
  /** Null when the selected mode isn't used on this route. */
  leaveByTime: Date | null;
  /** Car-overflow advisory (later sailing likely, or a busy boat). */
  carNote: string | null;
  arrival: ArrivalEta | null;
}

interface MainDepartureCardProps {
  departure: DepartureInfo;
  terminalId: number;
  terminalName: string;
  isAnimatingOut?: boolean;
  plan?: DeparturePlan;
}

// "11" min, or "1h 35" m once it's an hour or more out.
function splitDuration(minutes: number): { value: string; unit: string } {
  if (minutes < 60) return { value: String(minutes), unit: 'min' };
  return { value: `${Math.floor(minutes / 60)}h ${minutes % 60}`, unit: 'm' };
}

export function MainDepartureCard({ departure, terminalId, terminalName, isAnimatingOut = false, plan }: MainDepartureCardProps) {
  const { theme } = useTheme();
  const {
    vesselName,
    scheduledDeparture,
    delayMinutes,
    status,
    driveUpSpaces,
    maxSpaces,
    isCancelled,
    predictedDelayMinutes,
    mayRecover,
    vesselArrivalEta,
  } = departure;

  // Flip card state
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useState(() => new Animated.Value(0))[0];
  const [selectedCamera, setSelectedCamera] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  // Cache-buster appended to the camera image URL. Seeded from the clock so each
  // mount fetches a fresh frame, then bumped by 1 on every manual/swipe refresh.
  const [refreshKey, setRefreshKey] = useState(() => Date.now());

  const cameras = TERMINAL_CAMERAS[terminalId] || [];

  const handleFlip = useCallback(() => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      // When flipping to camera, refresh the image
      setRefreshKey((k) => k + 1);
      setImageLoading(true);
      setImageError(false);
    }
  }, [isFlipped, flipAnim]);

  const handleRefreshImage = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setImageLoading(true);
    setImageError(false);
  }, []);

  // Pan responder for swipe gestures on camera view. Recreated only when the
  // camera count changes; the active index is read via the functional setState
  // updater, so no ref mirroring (and no ref access during render) is needed.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // Only respond to horizontal swipes
          return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 50;
        },
        onPanResponderRelease: (_, gestureState) => {
          const len = cameras.length;
          if (len <= 1) return;
          if (gestureState.dx > 50) {
            // Swipe right = prev
            setSelectedCamera((current) => (current - 1 + len) % len);
          } else if (gestureState.dx < -50) {
            // Swipe left = next
            setSelectedCamera((current) => (current + 1) % len);
          } else {
            return;
          }
          setImageLoading(true);
          setImageError(false);
          setRefreshKey((k) => k + 1);
        },
      }),
    [cameras.length]
  );

  // Flip interpolations
  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const fillPercent = percentFull(driveUpSpaces, maxSpaces);
  const tone = fillPercent !== null ? capacityTone(fillPercent) : null;
  const toneColor =
    tone === 'nearlyFull' ? theme.colors.error :
    tone === 'filling' ? theme.colors.warning :
    theme.colors.success;

  // Unified effective departure — same source the leave-by plan uses, so the
  // crossed-out time and any "behind schedule" copy always agree.
  const ferryEffective = effectiveFerryDeparture(departure);
  const hasDelay = ferryEffective.isDelayed;
  const displayDeparture = ferryEffective.time;
  const isUpcoming = status !== 'departed' && !isCancelled;

  // Left number: minutes until you leave when there's a plan for this mode,
  // otherwise minutes until the boat goes.
  const leaveBy = plan?.leaveByTime ?? null;
  const leaveMinutes = leaveBy ? getMinutesUntil(leaveBy) : null;
  let leftLabel: string;
  let leftValue: { value: string; unit: string };
  let leftSub: string;
  let leftColor = theme.colors.text;
  if (leaveBy && leaveMinutes !== null) {
    if (leaveMinutes > 0) {
      leftLabel = 'LEAVE IN';
      leftValue = splitDuration(leaveMinutes);
      leftSub = `by ${formatTime(leaveBy)}`;
      if (leaveMinutes <= LEAVE_SOON_MINUTES) leftColor = theme.colors.warning;
    } else {
      leftLabel = 'LEAVE';
      leftValue = { value: 'Now', unit: '' };
      leftSub = leaveMinutes < 0 ? `${-leaveMinutes} min past ${formatTime(leaveBy)}` : `by ${formatTime(leaveBy)}`;
      leftColor = theme.colors.error;
    }
  } else {
    const m = Math.max(0, getMinutesUntil(displayDeparture));
    leftLabel = 'DEPARTS IN';
    leftValue = m > 0 ? splitDuration(m) : { value: 'Now', unit: '' };
    leftSub = `at ${formatTime(displayDeparture)}`;
  }

  // Delay copy for the header: live lateness, or the inbound boat's prediction.
  let delayText: string | null = null;
  let delaySevere = false;
  if ((status === 'arriving' || status === 'returning') && predictedDelayMinutes > 0) {
    delayText = mayRecover
      ? `~${predictedDelayMinutes}m late · may leave on time`
      : `~${predictedDelayMinutes}m late`;
    delaySevere = predictedDelayMinutes >= SEVERE_PREDICTED_DELAY_MINUTES;
  } else if (hasDelay) {
    delayText = `~${ferryEffective.delayMinutes}m late`;
  }

  // Footer right: where the boat is right now.
  let boatText: string | null = null;
  if (status === 'loading') {
    boatText = 'Now loading';
  } else if ((status === 'arriving' || status === 'returning') && vesselArrivalEta) {
    const m = getMinutesUntil(vesselArrivalEta);
    boatText = m > 0 ? `Boat docks ${formatTime(vesselArrivalEta)} · in ${m}m` : `Boat docks ${formatTime(vesselArrivalEta)}`;
  }

  const currentCamera = cameras[selectedCamera];
  const imageUrl = currentCamera ? `${currentCamera.url}?t=${refreshKey}` : null;
  const showVehicleToggle = !!plan && plan.vehicles.length > 1 && !isAnimatingOut;

  return (
    <View style={styles.cardContainer}>
      {/* Front side - plan + capacity */}
      <Animated.View
        style={[
          styles.cardFront,
          { backgroundColor: theme.colors.cardBg },
          isCancelled && { borderWidth: 2, borderColor: theme.colors.error },
          {
            transform: [{ rotateY: frontRotate }],
            opacity: frontOpacity,
          },
        ]}
        pointerEvents={isFlipped || isAnimatingOut ? 'none' : 'auto'}
      >
        <View style={styles.body}>
          {/* Header: which sailing + mode toggle + camera */}
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <View style={styles.sailingRow}>
                {hasDelay && (
                  <Text style={[styles.originalTime, { color: theme.colors.textMuted }]}>
                    {formatTime(scheduledDeparture)}
                  </Text>
                )}
                <Text style={[styles.sailingTime, { color: theme.colors.text }, isCancelled && styles.cancelledText]}>
                  {formatTime(displayDeparture)}
                </Text>
                <Text style={[styles.vesselName, { color: theme.colors.text }]} numberOfLines={1}>
                  {vesselName}
                </Text>
              </View>
              {isCancelled ? (
                <Text style={[styles.delayText, { color: theme.colors.error }]}>Cancelled</Text>
              ) : delayText ? (
                <Text style={[styles.delayText, { color: delaySevere ? theme.colors.error : theme.colors.warning }]}>
                  {delayText}
                </Text>
              ) : null}
            </View>
            {showVehicleToggle && (
              <View style={[styles.toggle, { backgroundColor: theme.colors.inputBg }]}>
                {plan!.vehicles.map((v) => {
                  const active = plan!.vehicle === v;
                  return (
                    <TouchableOpacity
                      key={v}
                      style={[styles.toggleButton, active && { backgroundColor: theme.colors.primary }]}
                      onPress={() => plan!.onVehicleChange(v)}
                      accessibilityRole="button"
                      accessibilityLabel={v === 'bike' ? 'Bike' : 'Car'}
                      accessibilityState={{ selected: active }}
                    >
                      <Ionicons
                        name={v === 'bike' ? 'bicycle' : 'car'}
                        size={18}
                        color={active ? '#fff' : theme.colors.textMuted}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            {cameras.length > 0 && !isAnimatingOut && (
              <TouchableOpacity
                style={[styles.cameraButton, { backgroundColor: theme.colors.inputBg }]}
                onPress={handleFlip}
                accessibilityRole="button"
                accessibilityLabel="Terminal camera"
              >
                <Ionicons name="videocam" size={18} color={theme.colors.text} />
              </TouchableOpacity>
            )}
          </View>

          {isUpcoming ? (
            <View style={styles.numbersRow}>
              <View style={styles.numberCol}>
                <Text style={[styles.numberLabel, { color: theme.colors.textMuted }]}>{leftLabel}</Text>
                <Text style={[styles.bigNumber, { color: leftColor }]}>
                  {leftValue.value}
                  {leftValue.unit !== '' && (
                    <Text style={[styles.bigUnit, { color: theme.colors.textMuted }]}> {leftValue.unit}</Text>
                  )}
                </Text>
                <Text style={[styles.numberSub, { color: theme.colors.textMuted }]}>{leftSub}</Text>
              </View>
              <View style={styles.numberCol}>
                <Text style={[styles.numberLabel, { color: theme.colors.textMuted }]}>SPOTS OPEN</Text>
                <Text style={[styles.bigNumber, { color: tone ? toneColor : theme.colors.textMuted }]}>
                  {driveUpSpaces ?? '—'}
                </Text>
                <Text style={[styles.numberSub, { color: theme.colors.textMuted }]}>
                  {tone ? CAPACITY_TONE_LABEL[tone] : 'No space data'}
                </Text>
              </View>
            </View>
          ) : (
            <Text
              style={[
                styles.departedStatus,
                { color: isCancelled ? theme.colors.error : delayMinutes > 5 ? theme.colors.warning : theme.colors.success },
              ]}
            >
              {isCancelled ? 'Sailing cancelled' : (delayMinutes > 0 ? `Departed ${delayMinutes}m late` : 'Departed on time')}
            </Text>
          )}

          {isUpcoming && plan?.carNote && (
            <View style={styles.noteRow}>
              <Ionicons name="car" size={14} color={theme.colors.warning} />
              <Text style={[styles.noteText, { color: theme.colors.warning }]}>{plan.carNote}</Text>
            </View>
          )}

          {isUpcoming && (plan?.arrival?.etaTime || boatText) && (
            <View style={styles.footerRow}>
              {plan?.arrival?.etaTime ? (
                <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
                  {plan.arrival.label}{' '}
                  <Text style={[styles.footerStrong, { color: theme.colors.text }]}>
                    {formatTime(plan.arrival.etaTime)}
                  </Text>
                </Text>
              ) : <View />}
              {boatText && (
                <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>{boatText}</Text>
              )}
            </View>
          )}
        </View>

        {/* Car meter — fills as cars board */}
        {isUpcoming && fillPercent !== null && (
          <View style={[styles.meterStrip, { backgroundColor: theme.colors.inputBg }]}>
            <CarMeter percent={fillPercent} color={toneColor} emptyColor={theme.colors.hoverBg} />
            <View style={styles.meterLegend}>
              <Text style={[styles.meterLegendText, { color: theme.colors.textMuted }]}>
                {Math.round(fillPercent)}% full
              </Text>
              <Text style={[styles.meterLegendText, { color: theme.colors.textMuted }]}>
                each bar ≈ {carsPerBar(maxSpaces)} cars
              </Text>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Back side - Camera view */}
      <Animated.View
        style={[
          styles.cardBack,
          { backgroundColor: theme.colors.cardBg },
          {
            transform: [{ rotateY: backRotate }],
            opacity: backOpacity,
          },
        ]}
        pointerEvents={isFlipped ? 'auto' : 'none'}
      >
        <View style={styles.cameraContainer} {...panResponder.panHandlers}>
          {/* Camera image - full bleed */}
          <TouchableOpacity
            style={styles.cameraImageContainer}
            onPress={handleFlip}
            activeOpacity={0.95}
          >
            {imageLoading && (
              <View style={styles.cameraLoading}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
            {imageError ? (
              <View style={styles.cameraError}>
                <Ionicons name="alert-circle" size={48} color="#C62828" />
                <Text style={styles.cameraErrorText}>Failed to load camera</Text>
              </View>
            ) : imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.cameraImage}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
            ) : null}

            {/* Overlay header */}
            <View style={styles.cameraOverlayTop}>
              <View style={styles.cameraHeaderLeft}>
                <Ionicons name="videocam" size={16} color="#fff" />
                <Text style={styles.cameraTitle}>{terminalName}</Text>
              </View>
              <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshImage}>
                <Ionicons name="refresh" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Overlay bottom - camera name + dots + swipe hint */}
            <View style={styles.cameraOverlayBottom}>
              {currentCamera && (
                <Text style={styles.cameraName}>{currentCamera.name}</Text>
              )}
              {cameras.length > 1 && (
                <View style={styles.cameraDots}>
                  {cameras.map((_, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.cameraDotTouchable}
                      onPress={() => {
                        setSelectedCamera(idx);
                        setImageLoading(true);
                        setImageError(false);
                        setRefreshKey((k) => k + 1);
                      }}
                    >
                      <View
                        style={[
                          styles.cameraDot,
                          selectedCamera === idx && styles.cameraDotActive,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <Text style={styles.cameraHint}>
                {cameras.length > 1 ? 'Swipe for more · Tap to flip' : 'Tap to flip back'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  },
  cardFront: {
    borderRadius: 20,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  body: {
    padding: 18,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  sailingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  originalTime: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  sailingTime: {
    fontSize: 17,
    fontWeight: '700',
  },
  vesselName: {
    fontSize: 17,
    fontWeight: '600',
    flexShrink: 1,
  },
  delayText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  cancelledText: {
    textDecorationLine: 'line-through',
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 3,
    gap: 2,
  },
  toggleButton: {
    width: 38,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numbersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  numberCol: {
    flex: 1,
  },
  numberLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  bigNumber: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 62,
    fontVariant: ['tabular-nums'],
  },
  bigUnit: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0,
  },
  numberSub: {
    fontSize: 14,
  },
  departedStatus: {
    fontSize: 20,
    fontWeight: '700',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
  footerStrong: {
    fontWeight: '700',
  },
  meterStrip: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 8,
  },
  meterLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meterLegendText: {
    fontSize: 12,
  },
  // Camera back side styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#111',
  },
  cameraImageContainer: {
    flex: 1,
  },
  cameraImage: {
    ...StyleSheet.absoluteFill,
  },
  cameraLoading: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  cameraError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  cameraErrorText: {
    color: '#fff',
    marginTop: 8,
  },
  cameraOverlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cameraHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cameraTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  refreshButton: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  cameraOverlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cameraName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  cameraDots: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  cameraDotTouchable: {
    padding: 6,
  },
  cameraDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  cameraDotActive: {
    backgroundColor: '#fff',
  },
  cameraHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
});
