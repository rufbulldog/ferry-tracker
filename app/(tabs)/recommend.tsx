import { View, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRecommendation } from '../../src/hooks/useRecommendation';
import { useArrivalEta } from '../../src/hooks/useArrivalEta';
import { formatTime } from '../../src/utils/time';
import { Vehicle } from '../../src/types/storage';
import { useRoute } from '../../src/context/RouteContext';
import { useTheme } from '../../src/context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RecommendScreen() {
  const [vehicle, setVehicle] = useState<Vehicle>('bike');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { route, animationDirection, clearAnimation } = useRoute();
  const { theme } = useTheme();

  // Slide animation for direction changes - subtle horizontal slide
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

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['vesselLocations'] });
    await queryClient.invalidateQueries({ queryKey: ['terminalSailingSpace'] });
    await queryClient.invalidateQueries({ queryKey: ['terminalBulletins'] });
    await queryClient.invalidateQueries({ queryKey: ['transitRecords'] });
    setCurrentTime(new Date());
    setRefreshing(false);
  }, [queryClient]);

  const recommendation = useRecommendation(route, vehicle);
  const { arrival } = useArrivalEta(route);

  // Calculate time until leave-by
  const getTimeUntilLeave = (): { minutes: number; isUrgent: boolean; isPast: boolean } | null => {
    if (!recommendation.leaveByTime) return null;
    const diffMs = recommendation.leaveByTime.getTime() - currentTime.getTime();
    const minutes = Math.round(diffMs / 60_000);
    return {
      minutes,
      isUrgent: minutes > 0 && minutes <= 10,
      isPast: minutes < 0,
    };
  };

  const timeUntil = getTimeUntilLeave();

  const getCardColor = () => {
    if (!timeUntil) return '#e0e0e0';
    if (timeUntil.isPast) return '#C62828';
    if (timeUntil.isUrgent) return '#F57C00';
    return '#2E7D32';
  };

  const getLeaveByText = () => {
    if (!timeUntil) return '--:--';
    if (timeUntil.isPast) {
      return `${Math.abs(timeUntil.minutes)} min ago`;
    }
    return formatTime(recommendation.leaveByTime!);
  };

  const getUrgencyMessage = () => {
    if (!recommendation.leaveByTime && recommendation.nextDeparture) {
      return 'Mode not available for this route';
    }
    if (!timeUntil) return 'No upcoming departures';
    if (timeUntil.isPast) {
      return 'You should have left already!';
    }
    if (timeUntil.minutes <= 5) {
      return 'Leave now!';
    }
    if (timeUntil.minutes <= 10) {
      return 'Get ready to leave';
    }
    return `Leave in ${timeUntil.minutes} min`;
  };

  // Only use dark text on grey background (when no timeUntil data)
  const isLightBackground = !timeUntil;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.pageBg }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
    >
      {/* Main Recommendation Card */}
      <Animated.View style={[styles.mainCard, { backgroundColor: getCardColor(), transform: [{ translateX: slideAnim }], opacity: opacityAnim }]}>
        {/* Vehicle toggle at top */}
        <View style={styles.vehicleRow}>
          <TouchableOpacity
            style={[styles.vehicleButton, vehicle === 'bike' && styles.vehicleButtonActive]}
            onPress={() => setVehicle('bike')}
          >
            <Ionicons
              name="bicycle"
              size={20}
              color={vehicle === 'bike' ? (isLightBackground ? '#2E7D32' : '#fff') : (isLightBackground ? '#666' : 'rgba(255,255,255,0.5)')}
            />
            <Text style={[
              styles.vehicleLabel,
              vehicle === 'bike' && styles.vehicleLabelActive,
              isLightBackground && styles.vehicleLabelDark,
              vehicle === 'bike' && isLightBackground && styles.vehicleLabelActiveDark,
            ]}>
              Bike
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.vehicleButton, vehicle === 'car' && styles.vehicleButtonActive]}
            onPress={() => setVehicle('car')}
          >
            <Ionicons
              name="car"
              size={20}
              color={vehicle === 'car' ? (isLightBackground ? '#2E7D32' : '#fff') : (isLightBackground ? '#666' : 'rgba(255,255,255,0.5)')}
            />
            <Text style={[
              styles.vehicleLabel,
              vehicle === 'car' && styles.vehicleLabelActive,
              isLightBackground && styles.vehicleLabelDark,
              vehicle === 'car' && isLightBackground && styles.vehicleLabelActiveDark,
            ]}>
              Car
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={[styles.leaveByLabel, isLightBackground && styles.leaveByLabelDark]}>
            Leave by
          </Text>
          <Text style={[styles.leaveByTime, isLightBackground && styles.leaveByTimeDark]}>
            {getLeaveByText()}
          </Text>
          <Text style={[styles.urgencyMessage, isLightBackground && styles.urgencyMessageDark]}>
            {getUrgencyMessage()}
          </Text>
        </View>

        {/* Bottom: departure info */}
        {recommendation.nextDeparture && (
          <View style={styles.departureInfo}>
            <View style={styles.departureRow}>
              <Ionicons name="boat-outline" size={16} color={isLightBackground ? '#666' : 'rgba(255,255,255,0.7)'} />
              <Text style={[styles.departureText, isLightBackground && styles.departureTextDark]}>
                {recommendation.nextDeparture.vesselName} departs {formatTime(
                  recommendation.nextDeparture.estimatedDeparture || recommendation.nextDeparture.scheduledDeparture
                )}
              </Text>
            </View>
            {recommendation.nextDeparture.delayMinutes > 0 && (
              <View style={styles.delayRow}>
                <Ionicons name="warning" size={13} color="#ffcdd2" />
                <Text style={styles.delayText}>
                  ~{recommendation.nextDeparture.delayMinutes} min behind schedule
                </Text>
              </View>
            )}
            {recommendation.capacityPercent !== null && (
              <Text style={[
                styles.capacityText,
                isLightBackground && styles.capacityTextDark,
                recommendation.capacityPercent > 80 && styles.capacityHigh,
              ]}>
                {recommendation.capacityPercent}% full
              </Text>
            )}
          </View>
        )}
      </Animated.View>

      {/* Arrival card (compact, neutral) */}
      {arrival && arrival.etaTime && (
        <View style={[styles.arrivalCard, { backgroundColor: theme.colors.cardBg }]}>
          <View style={styles.arrivalRow}>
            <Ionicons name="flag" size={18} color={theme.colors.textMuted} />
            <Text style={[styles.arrivalLabel, { color: theme.colors.textMuted }]}>{arrival.label}</Text>
            <Text style={[styles.arrivalTime, { color: theme.colors.text }]}>
              {formatTime(arrival.etaTime)}
            </Text>
          </View>
          {arrival.ferryArrivalTime && (
            <Text style={[styles.arrivalSubtext, { color: theme.colors.textMuted }]}>
              Ferry {formatTime(arrival.ferryArrivalTime)} + {arrival.transitMinutes} min{' '}
              {arrival.vehicle === 'bike' ? 'bike' : 'drive'}
            </Text>
          )}
        </View>
      )}

      {/* Info Section */}
      <View style={[styles.infoSection, { backgroundColor: theme.colors.cardBg }]}>
        <Text style={[styles.infoTitle, { color: theme.colors.text }]}>How this works</Text>
        <Text style={[styles.infoText, { color: theme.colors.textMuted }]}>
          Based on your {vehicle === 'bike' ? 'bike' : 'car'}, you need{' '}
          <Text style={[styles.infoBold, { color: theme.colors.text }]}>{recommendation.transitMinutes} min</Text> to get to the terminal
          {recommendation.bufferMinutes > 0 && (
            <> plus <Text style={[styles.infoBold, { color: theme.colors.text }]}>{recommendation.bufferMinutes} min</Text> buffer</>
          )}.
          {arrival && arrival.etaTime && (
            <>
              {' '}You'll {arrival.kind === 'home' ? 'be home' : 'get to the office'} around{' '}
              <Text style={[styles.infoBold, { color: theme.colors.text }]}>{formatTime(arrival.etaTime)}</Text>
              {arrival.sampleSize > 0 ? (
                <> based on {arrival.sampleSize} recorded {arrival.kind === 'home' ? 'ride home' : 'commute'}{arrival.sampleSize !== 1 ? 's' : ''}.</>
              ) : '.'}
            </>
          )}
        </Text>

        {recommendation.reasoning.length > 0 && (
          <View style={[styles.notesContainer, { borderTopColor: theme.colors.border }]}>
            {recommendation.reasoning.map((reason, index) => (
              <View key={index} style={styles.noteRow}>
                <Ionicons name="information-circle-outline" size={14} color={theme.colors.textMuted} />
                <Text style={[styles.noteText, { color: theme.colors.textMuted }]}>{reason}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  // Main card
  mainCard: {
    height: SCREEN_HEIGHT * 0.42,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  // Compact arrival card
  arrivalCard: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  arrivalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrivalLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  arrivalTime: {
    fontSize: 22,
    fontWeight: '700',
  },
  arrivalSubtext: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 26,
  },
  // Vehicle toggle
  vehicleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  vehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  vehicleButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  vehicleLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  vehicleLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  vehicleLabelDark: {
    color: '#666',
  },
  vehicleLabelActiveDark: {
    color: '#2E7D32',
  },
  // Center content
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  leaveByLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  leaveByLabelDark: {
    color: '#666',
  },
  leaveByTime: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  leaveByTimeDark: {
    color: '#1a1a1a',
    textShadowColor: 'transparent',
  },
  urgencyMessage: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  urgencyMessageDark: {
    color: '#2E7D32',
  },
  // Departure info
  departureInfo: {
    alignItems: 'center',
    gap: 4,
  },
  departureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  departureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  departureTextDark: {
    color: '#666',
  },
  delayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  delayText: {
    fontSize: 13,
    color: '#ffcdd2',
    fontWeight: '600',
  },
  capacityText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  capacityTextDark: {
    color: '#888',
  },
  capacityHigh: {
    color: '#ffcdd2',
    fontWeight: '600',
  },
  // Info section
  infoSection: {
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 6,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  noteText: {
    fontSize: 13,
    flex: 1,
  },
});
