import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useMemo } from 'react';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import {
  useRecentTrends,
  getHourlyDelays,
  getDepartureCapacities,
  calculateAverageDelay,
  calculateAverageCapacity,
} from '../../src/hooks/useDailyTrends';
import { useRoute } from '../../src/context/RouteContext';

const screenWidth = Dimensions.get('window').width;

export default function TrendsScreen() {
  const { route } = useRoute();

  // Get recent trends for the selected route (last 7 days)
  const { data: routeSnapshots = [], isLoading } = useRecentTrends(route, 7);

  // Prepare chart data
  const hourlyDelays = useMemo(() => getHourlyDelays(routeSnapshots), [routeSnapshots]);
  const capacityData = useMemo(() => getDepartureCapacities(routeSnapshots), [routeSnapshots]);

  // Stats
  const avgDelay = calculateAverageDelay(routeSnapshots);
  const avgCapacity = calculateAverageCapacity(routeSnapshots);

  // Line chart data for delays
  const delayLineData = hourlyDelays.map(d => ({
    value: d.delay,
    label: `${d.hour}`,
    dataPointText: d.delay !== 0 ? `${d.delay > 0 ? '+' : ''}${d.delay}` : '',
  }));

  // Bar chart data for capacity
  const capacityBarData = capacityData.map(d => ({
    value: d.capacity,
    label: d.time.replace(' ', '\n'),
    frontColor: d.capacity > 90 ? '#C62828' : d.capacity > 70 ? '#F57C00' : '#2E7D32',
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Summary Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text variant="headlineMedium" style={[
              styles.statValue,
              { color: avgDelay > 5 ? '#F57C00' : avgDelay > 0 ? '#666' : '#2E7D32' }
            ]}>
              {avgDelay > 0 ? '+' : ''}{avgDelay} min
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Avg Delay</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text variant="headlineMedium" style={[
              styles.statValue,
              { color: avgCapacity > 90 ? '#C62828' : avgCapacity > 70 ? '#F57C00' : '#2E7D32' }
            ]}>
              {avgCapacity}%
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>Avg Capacity</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Delay Chart */}
      <Card style={styles.card}>
        <Card.Title title="Departure Accuracy" subtitle="Minutes late (+) or early (-)" />
        <Card.Content>
          {delayLineData.length > 0 ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={delayLineData}
                width={screenWidth - 80}
                height={150}
                spacing={40}
                initialSpacing={20}
                color="#1565C0"
                thickness={2}
                hideDataPoints={false}
                dataPointsColor="#1565C0"
                dataPointsRadius={4}
                xAxisLabelTextStyle={styles.chartLabel}
                yAxisTextStyle={styles.chartLabel}
                yAxisOffset={-5}
                rulesColor="#e0e0e0"
                rulesType="solid"
                showReferenceLine1
                referenceLine1Position={0}
                referenceLine1Config={{
                  color: '#2E7D32',
                  dashWidth: 4,
                  dashGap: 4,
                }}
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>
                No departure data yet today.
              </Text>
              <Text style={styles.emptyHint}>
                Data is collected as ferries depart.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Capacity Chart */}
      <Card style={styles.card}>
        <Card.Title title="Departure Capacity" subtitle="% full at departure time" />
        <Card.Content>
          {capacityBarData.length > 0 ? (
            <View style={styles.chartContainer}>
              <BarChart
                data={capacityBarData}
                width={screenWidth - 80}
                height={150}
                barWidth={24}
                spacing={16}
                initialSpacing={10}
                maxValue={100}
                noOfSections={4}
                xAxisLabelTextStyle={styles.chartLabelSmall}
                yAxisTextStyle={styles.chartLabel}
                rulesColor="#e0e0e0"
                showYAxisIndices={false}
                yAxisLabelSuffix="%"
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>
                No capacity data yet today.
              </Text>
              <Text style={styles.emptyHint}>
                Data is collected as ferries depart.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Info */}
      <Text variant="bodySmall" style={styles.infoText}>
        {routeSnapshots.length} departures recorded today
      </Text>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  chartContainer: {
    marginLeft: -8,
  },
  chartLabel: {
    color: '#666',
    fontSize: 10,
  },
  chartLabelSmall: {
    color: '#666',
    fontSize: 8,
  },
  emptyChart: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  emptyText: {
    color: '#666',
    marginBottom: 4,
  },
  emptyHint: {
    color: '#999',
    fontSize: 12,
  },
  infoText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});
