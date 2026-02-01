import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

type Direction = 'seattle-bainbridge' | 'bainbridge-seattle';

export default function HomeScreen() {
  const [direction, setDirection] = useState<Direction>('seattle-bainbridge');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SegmentedButtons
          value={direction}
          onValueChange={(value) => setDirection(value as Direction)}
          buttons={[
            { value: 'seattle-bainbridge', label: 'Seattle → Bainbridge' },
            { value: 'bainbridge-seattle', label: 'Bainbridge → Seattle' },
          ]}
          style={styles.segmentedButtons}
        />

        <Card style={styles.nextDepartureCard}>
          <Card.Title
            title="NEXT DEPARTURE"
            titleStyle={styles.cardTitle}
          />
          <Card.Content>
            <Text variant="headlineLarge" style={styles.departureTime}>
              --:-- PM
            </Text>
            <Text variant="bodyLarge" style={styles.vesselName}>
              M/V Loading...
            </Text>
            <View style={styles.statusRow}>
              <Text variant="bodyMedium">⏱ Departs in -- min</Text>
            </View>
            <View style={styles.statusRow}>
              <Text variant="bodyMedium">✓ Status loading...</Text>
            </View>
            <View style={styles.statusRow}>
              <Text variant="bodyMedium">🚗 -- drive-up spots</Text>
            </View>
            <View style={styles.recommendedArrival}>
              <Text variant="bodyMedium" style={styles.recommendedText}>
                Recommended arrival: --:-- PM
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={styles.upcomingTitle}>
          UPCOMING
        </Text>

        <Card style={styles.upcomingCard}>
          <Card.Content>
            <Text variant="bodyLarge">--:-- PM · M/V Loading...</Text>
            <Text variant="bodySmall">🚗 -- spots (not yet loading)</Text>
          </Card.Content>
        </Card>

        <Card style={styles.upcomingCard}>
          <Card.Content>
            <Text variant="bodyLarge">--:-- PM · M/V Loading...</Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
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
  segmentedButtons: {
    marginBottom: 16,
  },
  nextDepartureCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  departureTime: {
    fontWeight: 'bold',
    color: '#1565C0',
  },
  vesselName: {
    color: '#333',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  recommendedArrival: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  recommendedText: {
    fontWeight: '600',
    color: '#2E7D32',
  },
  upcomingTitle: {
    marginBottom: 8,
    color: '#666',
  },
  upcomingCard: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
});
