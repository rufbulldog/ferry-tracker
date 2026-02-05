import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
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

export default function TrendsScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { route } = useRoute();

  // Get recent trends for the selected route (last 7 days)
  const { data: routeSnapshots = [], isLoading } = useRecentTrends(route, 7);

  // Prepare chart data
  const hourlyDelays = useMemo(() => getHourlyDelays(routeSnapshots), [routeSnapshots]);
  const capacityData = useMemo(() => getDepartureCapacities(routeSnapshots), [routeSnapshots]);

  // Stats
  const avgDelay = calculateAverageDelay(routeSnapshots);
  const avgCapacity = calculateAverageCapacity(routeSnapshots);

  // Color for avg delay: green if early (negative), grey if 0, yellow/orange/red for delays
  const getDelayColor = (delay: number) => {
    if (delay < 0) return '#2E7D32'; // Early - green
    if (delay === 0) return '#666'; // On time - grey
    if (delay > 10) return '#C62828'; // Very late - red
    if (delay > 5) return '#F57C00'; // Late - orange
    return '#FBC02D'; // Slightly late - yellow
  };

  // Calculate chart dimensions to fit screen
  const chartWidth = screenWidth - 64; // Account for padding and margins
  const chartPadding = 40; // Space for y-axis labels

  // Line chart spacing
  const lineSpacing = hourlyDelays.length > 1
    ? Math.max(20, Math.min(40, (chartWidth - chartPadding) / hourlyDelays.length))
    : 40;

  // Bar chart - limit to recent 8 departures for readability
  const recentCapacityData = capacityData.slice(-8);
  const barCount = Math.max(recentCapacityData.length, 1);
  const barSpacing = Math.max(12, Math.min(24, (chartWidth - chartPadding) / barCount * 0.6));
  const barWidth = Math.max(16, Math.min(24, barSpacing * 0.8));

  // Line chart data for delays
  const delayLineData = hourlyDelays.map(d => ({
    value: d.delay,
    label: `${d.hour}`,
  }));

  // Bar chart data for capacity - individual departures with simplified time labels
  const capacityBarData = recentCapacityData.map(d => {
    const shortTime = d.time.replace(':00 AM', 'a').replace(':00 PM', 'p')
      .replace(' AM', 'a').replace(' PM', 'p');
    return {
      value: d.capacity,
      label: shortTime,
      frontColor: d.capacity > 90 ? '#C62828' : d.capacity > 70 ? '#F57C00' : '#2E7D32',
    };
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Summary Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text variant="headlineMedium" style={[
              styles.statValue,
              { color: getDelayColor(avgDelay) }
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
        <Text style={styles.chartTitle}>Departure Accuracy</Text>
        <Card.Content>
          {delayLineData.length > 0 ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={delayLineData}
                width={chartWidth - chartPadding}
                height={140}
                spacing={lineSpacing}
                initialSpacing={10}
                endSpacing={10}
                color="#1565C0"
                thickness={2}
                hideDataPoints={false}
                dataPointsColor="#1565C0"
                dataPointsRadius={4}
                xAxisLabelTextStyle={{ color: '#1a1a1a', fontSize: 11 }}
                yAxisTextStyle={{ color: '#1a1a1a', fontSize: 11 }}
                xAxisColor="#666"
                yAxisColor="#666"
                yAxisLabelWidth={30}
                yAxisOffset={-5}
                rulesColor="#ddd"
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
                No departure data yet.
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
        <Text style={styles.chartTitle}>Departure Capacity</Text>
        <Card.Content>
          {capacityBarData.length > 0 ? (
            <View style={styles.chartContainer}>
              <BarChart
                data={capacityBarData}
                width={chartWidth - chartPadding}
                height={140}
                barWidth={barWidth}
                spacing={barSpacing}
                initialSpacing={10}
                endSpacing={10}
                maxValue={100}
                noOfSections={4}
                xAxisLabelTextStyle={{ color: '#1a1a1a', fontSize: 9 }}
                yAxisTextStyle={{ color: '#1a1a1a', fontSize: 11 }}
                xAxisColor="#666"
                yAxisColor="#666"
                yAxisLabelWidth={35}
                rulesColor="#ddd"
                showYAxisIndices={false}
                yAxisLabelSuffix="%"
                barBorderRadius={4}
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyText}>
                No capacity data yet.
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
        {routeSnapshots.length} departures recorded (last 7 days)
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
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  chartContainer: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyChart: {
    height: 140,
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
