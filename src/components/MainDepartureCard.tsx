import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
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
import { useTheme } from '../context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MainDepartureCardProps {
  departure: DepartureInfo;
  terminalId: number;
  terminalName: string;
  isAnimatingOut?: boolean;
  backendIncomingCapacity?: number | null; // Fallback from backend when WSF data unavailable
}

export function MainDepartureCard({ departure, terminalId, terminalName, isAnimatingOut = false, backendIncomingCapacity }: MainDepartureCardProps) {
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
    vesselArrivalEta,
    vesselProgressPercent,
    vesselAtOppositeTerminal,
    incomingVesselCapacity: wsfIncomingCapacity,
  } = departure;

  // Use WSF data if available, fallback to backend data
  const incomingVesselCapacity = wsfIncomingCapacity ?? backendIncomingCapacity ?? null;

  // Flip card state
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [selectedCamera, setSelectedCamera] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());

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
      setRefreshKey(Date.now());
      setImageLoading(true);
      setImageError(false);
    }
  }, [isFlipped, flipAnim]);

  const handleRefreshImage = useCallback(() => {
    setRefreshKey(Date.now());
    setImageLoading(true);
    setImageError(false);
  }, []);

  // Refs for pan responder to avoid stale closures
  const camerasLengthRef = useRef(cameras.length);
  camerasLengthRef.current = cameras.length;
  const selectedCameraRef = useRef(selectedCamera);
  selectedCameraRef.current = selectedCamera;

  // Pan responder for swipe gestures on camera view
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 50;
      },
      onPanResponderRelease: (_, gestureState) => {
        const len = camerasLengthRef.current;
        if (len <= 1) return;
        const current = selectedCameraRef.current;
        if (gestureState.dx > 50) {
          // Swipe right = prev
          const prev = (current - 1 + len) % len;
          setSelectedCamera(prev);
          setImageLoading(true);
          setImageError(false);
          setRefreshKey(Date.now());
        } else if (gestureState.dx < -50) {
          // Swipe left = next
          const next = (current + 1) % len;
          setSelectedCamera(next);
          setImageLoading(true);
          setImageError(false);
          setRefreshKey(Date.now());
        }
      },
    })
  ).current;

  // Calculate fill percentage (inverted - more cars = higher fill)
  const fillPercent = driveUpSpaces !== null && maxSpaces > 0
    ? ((maxSpaces - driveUpSpaces) / maxSpaces) * 100
    : 0;

  const animatedFill = useRef(new Animated.Value(0)).current;
  const animatedFerryProgress = useRef(new Animated.Value(vesselProgressPercent)).current;

  useEffect(() => {
    Animated.timing(animatedFill, {
      toValue: fillPercent,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [fillPercent, animatedFill]);

  useEffect(() => {
    Animated.timing(animatedFerryProgress, {
      toValue: vesselProgressPercent,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [vesselProgressPercent, animatedFerryProgress]);

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

  // Color based on capacity
  const getFillColor = () => {
    if (fillPercent > 90) return '#C62828';
    if (fillPercent > 70) return '#F57C00';
    if (fillPercent > 50) return '#FBC02D';
    return '#43A047';
  };

  // Color for incoming vessel capacity
  const getIncomingCapacityColor = (percent: number) => {
    if (percent > 90) return '#C62828';
    if (percent > 70) return '#F57C00';
    if (percent > 50) return '#FBC02D';
    return '#43A047';
  };

  const getStatusText = (): string => {
    if (isCancelled) return 'CANCELLED';
    switch (status) {
      case 'loading': return 'NOW LOADING';
      case 'arriving': return 'FERRY INCOMING';
      case 'returning': return 'DELAYED';
      case 'departed': return delayMinutes > 0 ? `DEPARTED ${delayMinutes}m LATE` : 'DEPARTED';
      default: return 'SCHEDULED';
    }
  };

  const getStatusColor = (): string => {
    if (isCancelled) return '#C62828';
    switch (status) {
      case 'loading': return theme.colors.primary;
      case 'arriving': return '#7B1FA2';
      case 'returning': return '#F57C00';
      case 'departed': return delayMinutes > 5 ? '#F57C00' : '#2E7D32';
      default: return '#2E7D32';
    }
  };

  const fillHeight = animatedFill.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // For arriving vessels: ferry comes from right (90%) to left (5%) - toward our dock
  const ferryPosition = animatedFerryProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['90%', '5%'],
  });

  const getMinutesToArrival = (): number | null => {
    if (vesselArrivalEta) {
      return getMinutesUntil(vesselArrivalEta);
    }
    return null;
  };

  const minutesToArrival = getMinutesToArrival();
  // Only show ferry tracker when vessel is arriving - hide when docked (loading/scheduled)
  const showFerryTracker = status === 'arriving' || status === 'returning';
  const hasDelay = estimatedDeparture && estimatedDeparture.getTime() !== scheduledDeparture.getTime();
  const minutesUntilEstimated = estimatedDeparture ? getMinutesUntil(estimatedDeparture) : minutesUntilDeparture;

  const currentCamera = cameras[selectedCamera];
  const imageUrl = currentCamera ? `${currentCamera.url}?t=${refreshKey}` : null;

  return (
    <View style={styles.cardContainer}>
      {/* Front side - Departure info */}
      <Animated.View
        style={[
          styles.card,
          styles.cardFront,
          { backgroundColor: theme.colors.cardBg },
          isCancelled && styles.cancelledContainer,
          {
            transform: [{ rotateY: frontRotate }],
            opacity: frontOpacity,
          },
        ]}
        pointerEvents={isFlipped || isAnimatingOut ? 'none' : 'auto'}
      >
        {/* Background fill - the "tank" */}
        <View style={styles.tankBackground}>
          <Animated.View
            style={[
              styles.tankFill,
              { height: fillHeight, backgroundColor: getFillColor() },
            ]}
          />
        </View>

        {/* Content overlay */}
        <View style={styles.content}>
          {/* Top section: Vessel info + time + ferry tracker */}
          <View style={styles.topSection}>
            {/* Vessel name row with camera button */}
            <View style={styles.vesselRow}>
              <View style={styles.vesselInfo}>
                <Ionicons name="boat-outline" size={18} color={fillPercent < 40 ? theme.colors.textMuted : '#fff'} />
                <Text style={[styles.vesselName, fillPercent < 40 && { color: theme.colors.text, textShadowColor: 'transparent' }]}>
                  {vesselName}
                </Text>
                {isCancelled && (
                  <View style={styles.cancelledBadge}>
                    <Text style={styles.cancelledBadgeText}>CANCELLED</Text>
                  </View>
                )}
              </View>
              {cameras.length > 0 && !isAnimatingOut && (
                <TouchableOpacity style={[styles.cameraButton, fillPercent < 40 && { backgroundColor: `${theme.colors.primary}15` }]} onPress={handleFlip}>
                  <Ionicons name="videocam" size={18} color={fillPercent < 40 ? theme.colors.primary : '#fff'} />
                </TouchableOpacity>
              )}
            </View>

            {/* Departure time - show above ferry tracker when docked */}
            {!showFerryTracker && (
              <View style={[styles.timeContainer, fillPercent < 40 && { backgroundColor: `${theme.colors.primary}15` }]}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={fillPercent < 40 ? theme.colors.primary : 'rgba(255,255,255,0.9)'}
                />
                {hasDelay && (
                  <Text style={[styles.originalTime, fillPercent < 40 && { color: theme.colors.textMuted }]}>
                    {formatTime(scheduledDeparture)}
                  </Text>
                )}
                <Text style={[styles.timeText, fillPercent < 40 && { color: theme.colors.text }, isCancelled && styles.cancelledText]}>
                  {formatTime(hasDelay ? estimatedDeparture! : scheduledDeparture)}
                </Text>
                {status !== 'departed' && !isCancelled && (
                  <Text style={[styles.timeCountdown, fillPercent < 40 && { color: theme.colors.textMuted }]}>
                    · {hasDelay
                      ? (minutesUntilEstimated > 0 ? `in ${minutesUntilEstimated}m` : 'now')
                      : (minutesUntilDeparture > 0 ? `in ${minutesUntilDeparture}m` : 'now')
                    }
                  </Text>
                )}
              </View>
            )}

            {/* Ferry tracker - only when vessel is arriving */}
            {showFerryTracker && (
              <View style={styles.ferryTracker}>
                <View style={[styles.trackLine, fillPercent < 40 && { backgroundColor: `${theme.colors.primary}30` }]}>
                  {incomingVesselCapacity !== null && (
                    <View
                      style={[
                        styles.trackCapacityFill,
                        {
                          width: `${incomingVesselCapacity}%`,
                          backgroundColor: getIncomingCapacityColor(incomingVesselCapacity),
                        },
                      ]}
                    />
                  )}
                  <View style={[styles.dock, styles.leftDock, fillPercent < 40 && { backgroundColor: theme.colors.primary }]} />
                  <View style={[styles.dock, styles.rightDock, fillPercent < 40 && { backgroundColor: theme.colors.primary }]} />
                  <Animated.View
                    style={[
                      styles.ferryIcon,
                      {
                        left: ferryPosition,
                        transform: [{ scaleX: -1 }],
                      },
                    ]}
                  >
                    <Ionicons name="boat" size={24} color={fillPercent < 40 ? theme.colors.primary : '#fff'} />
                  </Animated.View>
                </View>
                <Text style={[styles.ferryStatus, fillPercent < 40 && { color: theme.colors.text, textShadowColor: 'transparent' }]}>
                  {status === 'arriving' && minutesToArrival !== null && vesselArrivalEta &&
                    `Arrives in ${minutesToArrival} min (${formatTime(vesselArrivalEta)})`}
                  {status === 'returning' && vesselAtOppositeTerminal && 'Waiting at opposite terminal'}
                  {status === 'returning' && !vesselAtOppositeTerminal && minutesToArrival !== null && vesselArrivalEta &&
                    `Arrives in ${minutesToArrival} min (${formatTime(vesselArrivalEta)})`}
                </Text>
              </View>
            )}

            {/* Departure time - show below ferry tracker when in transit */}
            {showFerryTracker && (
              <View style={[styles.timeContainer, fillPercent < 40 && { backgroundColor: `${theme.colors.primary}15` }]}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={fillPercent < 40 ? theme.colors.primary : 'rgba(255,255,255,0.9)'}
                />
                {hasDelay && (
                  <Text style={[styles.originalTime, fillPercent < 40 && { color: theme.colors.textMuted }]}>
                    {formatTime(scheduledDeparture)}
                  </Text>
                )}
                <Text style={[styles.timeText, fillPercent < 40 && { color: theme.colors.text }, isCancelled && styles.cancelledText]}>
                  {formatTime(hasDelay ? estimatedDeparture! : scheduledDeparture)}
                </Text>
                {/* status is narrowed to 'arriving' | 'returning' here, so no need to exclude 'departed' */}
                {!isCancelled && (
                  <Text style={[styles.timeCountdown, fillPercent < 40 && { color: theme.colors.textMuted }]}>
                    · {hasDelay
                      ? (minutesUntilEstimated > 0 ? `in ${minutesUntilEstimated}m` : 'now')
                      : (minutesUntilDeparture > 0 ? `in ${minutesUntilDeparture}m` : 'now')
                    }
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Center section: Capacity (primary) */}
          <View style={styles.centerSection}>
            {driveUpSpaces !== null && !isCancelled && status !== 'departed' && (
              <View style={styles.capacityRow}>
                <Text style={[styles.spotsNumber, fillPercent < 30 && { color: theme.colors.text, textShadowColor: 'rgba(255, 255, 255, 0.5)' }]}>
                  {driveUpSpaces}
                </Text>
                <View style={styles.capacityLabels}>
                  <Text style={[styles.spotsLabel, fillPercent < 30 && { color: theme.colors.text, textShadowColor: 'rgba(255, 255, 255, 0.5)' }]}>
                    spots open
                  </Text>
                  <Text style={[styles.capacityPercent, fillPercent < 40 && { color: theme.colors.textMuted }]}>
                    {Math.round(fillPercent)}% full
                  </Text>
                </View>
              </View>
            )}
            {(isCancelled || status === 'departed') && (
              <Text style={[styles.departedStatus, isCancelled && styles.cancelledStatus, delayMinutes > 5 && styles.departedLate]}>
                {isCancelled ? 'CANCELLED' : (delayMinutes > 0 ? `departed ${delayMinutes}m late` : 'departed on time')}
              </Text>
            )}
          </View>

          {/* Bottom section: Status indicator */}
          <View style={styles.bottomSection}>
            {(status === 'loading' || status === 'scheduled') && !showFerryTracker && !isCancelled && (
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusIndicatorText}>{getStatusText()}</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Back side - Camera view */}
      <Animated.View
        style={[
          styles.card,
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
                        setRefreshKey(Date.now());
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
    height: SCREEN_HEIGHT * 0.55,
    marginBottom: 16,
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: '#e0e0e0',
  },
  cardBack: {
    backgroundColor: '#fff',
  },
  cancelledContainer: {
    backgroundColor: '#ffcdd2',
  },
  tankBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  tankFill: {
    width: '100%',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'space-between',
  },
  // Top section
  topSection: {
    gap: 8,
  },
  vesselRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vesselInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vesselName: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  vesselNameDark: {
    color: '#333',
    textShadowColor: 'transparent',
  },
  cancelledBadge: {
    backgroundColor: '#C62828',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelledBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cameraButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  cameraButtonLight: {
    backgroundColor: 'rgba(21, 101, 192, 0.1)',
  },
  // Ferry tracker
  ferryTracker: {
    marginTop: 4,
  },
  trackLine: {
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 18,
    position: 'relative',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trackLineDark: {
    backgroundColor: 'rgba(21, 101, 192, 0.2)',
  },
  trackCapacityFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 18,
    opacity: 0.6,
  },
  dock: {
    position: 'absolute',
    width: 8,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  dockDark: {
    backgroundColor: '#1565C0',
  },
  leftDock: {
    left: 6,
  },
  rightDock: {
    right: 6,
  },
  ferryIcon: {
    position: 'absolute',
    top: 6,
  },
  ferryStatus: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ferryStatusDark: {
    color: '#444',
    textShadowColor: 'transparent',
  },
  // Center section - capacity (primary)
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 20,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  spotsNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    lineHeight: 76,
  },
  capacityLabels: {
    alignItems: 'flex-start',
  },
  spotsLabel: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  capacityPercent: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  departedStatus: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '600',
  },
  cancelledStatus: {
    color: '#C62828',
  },
  departedLate: {
    color: '#F57C00',
  },
  cancelledText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  // Bottom section - status indicator
  bottomSection: {
    alignItems: 'center',
    minHeight: 36,
  },
  // Time container (now in top section)
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  originalTime: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  timeCountdown: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  statusIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusIndicatorText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
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
    ...StyleSheet.absoluteFillObject,
  },
  cameraLoading: {
    ...StyleSheet.absoluteFillObject,
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
