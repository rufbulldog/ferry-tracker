import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, SegmentedButtons } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { useRecommendation } from '../../src/hooks/useRecommendation';
import { formatTime } from '../../src/utils/time';
import { Vehicle } from '../../src/types/storage';
import { useRoute } from '../../src/context/RouteContext';

export default function RecommendScreen() {
  const [vehicle, setVehicle] = useState<Vehicle>('bike');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { route } = useRoute();

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const recommendation = useRecommendation(route, vehicle);

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

  const getRecommendColor = () => {
    if (!timeUntil) return '#666';
    if (timeUntil.isPast) return '#C62828';
    if (timeUntil.isUrgent) return '#F57C00';
    return '#2E7D32';
  };

  const getRecommendText = () => {
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
    if (!timeUntil) return '';
    if (timeUntil.isPast) {
      return 'You should have left already!';
    }
    if (timeUntil.minutes <= 5) {
      return 'Leave now!';
    }
    if (timeUntil.minutes <= 10) {
      return 'Get ready to leave soon';
    }
    return 'to catch the next ferry';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Vehicle Selection */}
      <Card style={styles.card}>
        <Card.Title title="I'm taking my..." />
        <Card.Content>
          <SegmentedButtons
            value={vehicle}
            onValueChange={(value) => setVehicle(value as Vehicle)}
            buttons={[
              { value: 'car', label: 'Car' },
              { value: 'bike', label: 'Bike' },
            ]}
          />
        </Card.Content>
      </Card>

      {/* Recommendation Card */}
      <Card style={[styles.recommendCard, { backgroundColor: getRecommendColor() }]}>
        <Card.Content style={styles.recommendContent}>
          <Text variant="bodyLarge" style={styles.recommendLabel}>
            Leave by
          </Text>
          <Text style={styles.recommendTime}>
            {getRecommendText()}
          </Text>
          <Text variant="bodyMedium" style={styles.recommendNote}>
            {getUrgencyMessage()}
          </Text>
          {timeUntil && !timeUntil.isPast && timeUntil.minutes > 0 && (
            <Text variant="titleMedium" style={styles.countdown}>
              {timeUntil.minutes} min from now
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Factors */}
      <Card style={styles.card}>
        <Card.Title title="Based on" />
        <Card.Content>
          <View style={styles.factorRow}>
            <Text variant="bodyMedium" style={styles.factorLabel}>Next departure:</Text>
            <Text variant="bodyMedium" style={styles.factorValue}>
              {recommendation.nextDeparture
                ? formatTime(recommendation.nextDeparture.estimatedDeparture || recommendation.nextDeparture.scheduledDeparture)
                : '--:--'}
            </Text>
          </View>
          <View style={styles.factorRow}>
            <Text variant="bodyMedium" style={styles.factorLabel}>Vessel:</Text>
            <Text variant="bodyMedium" style={styles.factorValue}>
              {recommendation.nextDeparture?.vesselName || '--'}
            </Text>
          </View>
          <View style={styles.factorRow}>
            <Text variant="bodyMedium" style={styles.factorLabel}>Travel time:</Text>
            <Text variant="bodyMedium" style={styles.factorValue}>
              {recommendation.transitMinutes} min
            </Text>
          </View>
          <View style={styles.factorRow}>
            <Text variant="bodyMedium" style={styles.factorLabel}>Buffer time:</Text>
            <Text variant="bodyMedium" style={styles.factorValue}>
              {recommendation.bufferMinutes} min
            </Text>
          </View>
          <View style={styles.factorRow}>
            <Text variant="bodyMedium" style={styles.factorLabel}>Current capacity:</Text>
            <Text variant="bodyMedium" style={[
              styles.factorValue,
              recommendation.capacityPercent !== null && recommendation.capacityPercent > 80
                ? { color: '#C62828' }
                : {}
            ]}>
              {recommendation.capacityPercent !== null
                ? `${recommendation.capacityPercent}%`
                : '--%'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Reasoning */}
      {recommendation.reasoning.length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="Notes" />
          <Card.Content>
            {recommendation.reasoning.map((reason, index) => (
              <Text key={index} variant="bodySmall" style={styles.reasonText}>
                - {reason}
              </Text>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  recommendCard: {
    marginBottom: 16,
  },
  recommendContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  recommendLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  recommendTime: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  recommendNote: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  countdown: {
    color: '#fff',
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  factorLabel: {
    color: '#666',
  },
  factorValue: {
    color: '#333',
    fontWeight: '500',
  },
  reasonText: {
    color: '#666',
    marginBottom: 4,
  },
});
