import { View, StyleSheet, ScrollView, useWindowDimensions, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { useMemo, useState, useEffect } from 'react';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import {
  useTodayTrends,
  useRecentTrends,
  getHourlyDelays,
  getDailyDelays,
  getHourlyCapacities,
  calculateAverageDelay,
  calculateAverageCapacity,
} from '../../src/hooks/useDailyTrends';
import {
  useAllTransitAverages,
} from '../../src/hooks/useTransitRecords';
import { useRoute } from '../../src/context/RouteContext';
import { useTheme } from '../../src/context/ThemeContext';
import { TransitRoute, Vehicle } from '../../src/types/storage';

// Valid transit route/vehicle combinations per route group + direction
type ValidCombination = { route: TransitRoute; vehicle: Vehicle; label: string };

// Bainbridge-Seattle: Bainbridge selected (outbound)
const BAINBRIDGE_OUTBOUND_TRANSIT: ValidCombination[] = [
  { route: 'home-to-ferry', vehicle: 'bike', label: 'Home → BI Ferry' },
  { route: 'home-to-ferry', vehicle: 'car', label: 'Home → BI Ferry' },
  { route: 'ferry-to-home', vehicle: 'bike', label: 'BI Ferry → Home' },
];

// Bainbridge-Seattle: Seattle selected (inbound)
const SEATTLE_INBOUND_TRANSIT: ValidCombination[] = [
  { route: 'ferry-to-work', vehicle: 'bike', label: 'Seattle → Work' },
  { route: 'work-to-ferry', vehicle: 'bike', label: 'Work → Seattle' },
];

// Kingston-Edmonds: Kingston selected (outbound)
const KINGSTON_OUTBOUND_TRANSIT: ValidCombination[] = [
  { route: 'home-to-ferry', vehicle: 'car', label: 'Home → Kingston' },
];

// Kingston-Edmonds: Edmonds selected (inbound) - no transit times
const EDMONDS_INBOUND_TRANSIT: ValidCombination[] = [];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}h ${remainingMins}m`;
  }
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

export default function TrendsScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { route, routeGroup, direction, animationDirection, clearAnimation } = useRoute();
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

  // Get trends for different time periods
  const { data: todaySnapshots = [] } = useTodayTrends(route);
  const { data: weekSnapshots = [] } = useRecentTrends(route, 7);
  const { data: monthSnapshots = [] } = useRecentTrends(route, 30);

  // Get transit time averages
  const { averages: allTransitAverages } = useAllTransitAverages();

  // Filter transit averages based on route group + direction
  const validCombinations = useMemo(() => {
    if (routeGroup === 'bainbridge') {
      return direction === 'outbound' ? BAINBRIDGE_OUTBOUND_TRANSIT : SEATTLE_INBOUND_TRANSIT;
    } else {
      return direction === 'outbound' ? KINGSTON_OUTBOUND_TRANSIT : EDMONDS_INBOUND_TRANSIT;
    }
  }, [routeGroup, direction]);

  const transitAverages = useMemo(() => {
    return allTransitAverages
      .filter(avg => validCombinations.some(
        combo => combo.route === avg.route && combo.vehicle === avg.vehicle
      ))
      .map(avg => {
        const combo = validCombinations.find(
          c => c.route === avg.route && c.vehicle === avg.vehicle
        );
        return { ...avg, displayLabel: combo?.label || avg.route };
      });
  }, [allTransitAverages, validCombinations]);

  // Prepare chart data for each time period
  const todayDelays = useMemo(() => getHourlyDelays(todaySnapshots), [todaySnapshots]);
  const weekDelays = useMemo(() => getDailyDelays(weekSnapshots), [weekSnapshots]);
  const monthDelays = useMemo(() => getDailyDelays(monthSnapshots), [monthSnapshots]);
  const hourlyCapacities = useMemo(() => getHourlyCapacities(weekSnapshots), [weekSnapshots]);

  // Stats (based on week data for consistency)
  const avgDelay = calculateAverageDelay(weekSnapshots);
  const avgCapacity = calculateAverageCapacity(weekSnapshots);

  // Color for avg delay
  const getDelayColor = (delay: number) => {
    if (delay < 0) return '#2E7D32';
    if (delay === 0) return '#666';
    if (delay > 10) return '#C62828';
    if (delay > 5) return '#F57C00';
    return '#FBC02D';
  };

  // Color for capacity
  const getCapacityColor = (capacity: number) => {
    if (capacity > 90) return '#C62828';
    if (capacity > 70) return '#F57C00';
    return '#2E7D32';
  };

  // Calculate chart dimensions
  const chartWidth = screenWidth - 64;
  const chartPadding = 40;

  // Helper to calculate line spacing
  const getLineSpacing = (dataLength: number) =>
    dataLength > 1 ? Math.max(20, Math.min(40, (chartWidth - chartPadding) / dataLength)) : 40;

  const barCount = Math.max(hourlyCapacities.length, 1);
  const barSpacing = Math.max(12, Math.min(24, (chartWidth - chartPadding) / barCount * 0.6));
  const barWidth = Math.max(12, Math.min(20, barSpacing * 0.8));

  // Format hourly delay data (for today chart)
  const formatHourlyData = (delays: { hour: number; delay: number }[]) =>
    delays.map((d, index) => {
      const showLabel = index === 0 || index === delays.length - 1 ||
        (delays.length > 8 ? index % Math.ceil(delays.length / 6) === 0 : true);
      const ampm = d.hour >= 12 ? 'p' : 'a';
      const hour12 = d.hour === 0 ? 12 : d.hour > 12 ? d.hour - 12 : d.hour;
      return {
        value: d.delay,
        label: showLabel ? `${hour12}${ampm}` : '',
      };
    });

  // Format daily delay data for week chart (show day names)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const formatWeekData = (delays: { date: string; delay: number; dayOfWeek: number }[]) =>
    delays.map((d) => ({
      value: d.delay,
      label: dayNames[d.dayOfWeek],
    }));

  // Format daily delay data for month chart (show spaced dates)
  const formatMonthData = (delays: { date: string; delay: number; dayOfWeek: number }[]) =>
    delays.map((d, index) => {
      // Show label every ~5 days to avoid clutter
      const showLabel = index === 0 || index === delays.length - 1 ||
        (delays.length > 10 ? index % Math.ceil(delays.length / 6) === 0 : true);
      const date = new Date(d.date);
      const dayNum = date.getDate();
      return {
        value: d.delay,
        label: showLabel ? `${dayNum}` : '',
      };
    });

  const todayLineData = formatHourlyData(todayDelays);
  const weekLineData = formatWeekData(weekDelays);
  const monthLineData = formatMonthData(monthDelays);

  const capacityBarData = hourlyCapacities.map((d, index) => {
    // Only show label every few data points to avoid clutter
    const showLabel = index === 0 || index === hourlyCapacities.length - 1 ||
      (hourlyCapacities.length > 8 ? index % Math.ceil(hourlyCapacities.length / 6) === 0 : true);
    // Format hour as "5a" or "10p"
    const ampm = d.hour >= 12 ? 'p' : 'a';
    const hour12 = d.hour === 0 ? 12 : d.hour > 12 ? d.hour - 12 : d.hour;
    return {
      value: d.capacity,
      label: showLabel ? `${hour12}${ampm}` : '',
      frontColor: d.capacity > 90 ? '#C62828' : d.capacity > 70 ? '#F57C00' : '#2E7D32',
    };
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.pageBg }]} contentContainerStyle={styles.content}>
      {/* Main Stats Card */}
      <Animated.View style={[styles.mainStatsCard, { backgroundColor: theme.colors.cardBg, transform: [{ translateX: slideAnim }], opacity: opacityAnim }]}>
        <View style={styles.statBlock}>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Avg Delay</Text>
          <Text style={[styles.statValue, { color: getDelayColor(avgDelay) }]}>
            {avgDelay > 0 ? '+' : ''}{avgDelay}
          </Text>
          <Text style={[styles.statUnit, { color: theme.colors.textMuted }]}>min</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.statBlock}>
          <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Avg Capacity</Text>
          <Text style={[styles.statValue, { color: getCapacityColor(avgCapacity) }]}>
            {avgCapacity}
          </Text>
          <Text style={[styles.statUnit, { color: theme.colors.textMuted }]}>% full</Text>
        </View>
      </Animated.View>

      {/* Transit Times Section */}
      {transitAverages.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>My Transit Times</Text>
          <View style={styles.transitGrid}>
            {transitAverages.map((avg, idx) => (
              <View key={idx} style={[styles.transitCard, { backgroundColor: theme.colors.cardBg }]}>
                <View style={styles.transitHeader}>
                  <Ionicons
                    name={avg.vehicle === 'bike' ? 'bicycle' : 'car'}
                    size={16}
                    color={theme.colors.textMuted}
                  />
                  <Text style={[styles.transitRoute, { color: theme.colors.textMuted }]}>
                    {avg.displayLabel}
                  </Text>
                </View>
                <Text style={[styles.transitTime, { color: theme.colors.primary }]}>
                  {formatDuration(avg.averageSeconds)}
                </Text>
                <Text style={[styles.transitCount, { color: theme.colors.textMuted }]}>
                  {avg.count} trip{avg.count !== 1 ? 's' : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {transitAverages.length === 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>My Transit Times</Text>
          <View style={[styles.emptyTransit, { backgroundColor: theme.colors.cardBg }]}>
            <Ionicons name="timer-outline" size={32} color={theme.colors.textMuted} />
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No transit times recorded yet</Text>
            <Text style={[styles.emptyHint, { color: theme.colors.textMuted }]}>Use the Timer tab to track your commute</Text>
          </View>
        </View>
      )}

      {/* Departure Accuracy Charts */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Departure Accuracy</Text>

        {/* Today */}
        <Text style={[styles.chartSubtitle, { color: theme.colors.textMuted }]}>Today</Text>
        <View style={[styles.chartCard, { backgroundColor: theme.colors.cardBg, marginBottom: 12 }]}>
          {todayLineData.length > 0 ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={todayLineData}
                width={chartWidth - chartPadding}
                height={120}
                spacing={getLineSpacing(todayDelays.length)}
                initialSpacing={10}
                endSpacing={10}
                color={theme.colors.primary}
                thickness={2}
                hideDataPoints={false}
                dataPointsColor={theme.colors.primary}
                dataPointsRadius={4}
                xAxisLabelTextStyle={{ color: theme.colors.text, fontSize: 11 }}
                yAxisTextStyle={{ color: theme.colors.text, fontSize: 11 }}
                xAxisColor={theme.colors.textMuted}
                yAxisColor={theme.colors.textMuted}
                yAxisLabelWidth={30}
                yAxisOffset={-5}
                rulesColor={theme.colors.border}
                rulesType="solid"
                showReferenceLine1
                referenceLine1Position={0}
                referenceLine1Config={{
                  color: theme.colors.success,
                  dashWidth: 4,
                  dashGap: 4,
                }}
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No data for today</Text>
            </View>
          )}
        </View>

        {/* This Week */}
        <Text style={[styles.chartSubtitle, { color: theme.colors.textMuted }]}>This Week</Text>
        <View style={[styles.chartCard, { backgroundColor: theme.colors.cardBg, marginBottom: 12 }]}>
          {weekLineData.length > 0 ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={weekLineData}
                width={chartWidth - chartPadding}
                height={120}
                spacing={getLineSpacing(weekDelays.length)}
                initialSpacing={10}
                endSpacing={10}
                color={theme.colors.primary}
                thickness={2}
                hideDataPoints={false}
                dataPointsColor={theme.colors.primary}
                dataPointsRadius={4}
                xAxisLabelTextStyle={{ color: theme.colors.text, fontSize: 11 }}
                yAxisTextStyle={{ color: theme.colors.text, fontSize: 11 }}
                xAxisColor={theme.colors.textMuted}
                yAxisColor={theme.colors.textMuted}
                yAxisLabelWidth={30}
                yAxisOffset={-5}
                rulesColor={theme.colors.border}
                rulesType="solid"
                showReferenceLine1
                referenceLine1Position={0}
                referenceLine1Config={{
                  color: theme.colors.success,
                  dashWidth: 4,
                  dashGap: 4,
                }}
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No data for this week</Text>
            </View>
          )}
        </View>

        {/* This Month */}
        <Text style={[styles.chartSubtitle, { color: theme.colors.textMuted }]}>This Month</Text>
        <View style={[styles.chartCard, { backgroundColor: theme.colors.cardBg }]}>
          {monthLineData.length > 0 ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={monthLineData}
                width={chartWidth - chartPadding}
                height={120}
                spacing={getLineSpacing(monthDelays.length)}
                initialSpacing={10}
                endSpacing={10}
                color={theme.colors.primary}
                thickness={2}
                hideDataPoints={false}
                dataPointsColor={theme.colors.primary}
                dataPointsRadius={4}
                xAxisLabelTextStyle={{ color: theme.colors.text, fontSize: 11 }}
                yAxisTextStyle={{ color: theme.colors.text, fontSize: 11 }}
                xAxisColor={theme.colors.textMuted}
                yAxisColor={theme.colors.textMuted}
                yAxisLabelWidth={30}
                yAxisOffset={-5}
                rulesColor={theme.colors.border}
                rulesType="solid"
                showReferenceLine1
                referenceLine1Position={0}
                referenceLine1Config={{
                  color: theme.colors.success,
                  dashWidth: 4,
                  dashGap: 4,
                }}
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No data for this month</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Departure Capacity</Text>
        <View style={[styles.chartCard, { backgroundColor: theme.colors.cardBg }]}>
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
                xAxisLabelTextStyle={{ color: theme.colors.text, fontSize: 9 }}
                yAxisTextStyle={{ color: theme.colors.text, fontSize: 11 }}
                xAxisColor={theme.colors.textMuted}
                yAxisColor={theme.colors.textMuted}
                yAxisLabelWidth={35}
                rulesColor={theme.colors.border}
                showYAxisIndices={false}
                yAxisLabelSuffix="%"
                barBorderRadius={4}
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>No capacity data yet</Text>
            </View>
          )}
        </View>
      </View>

      {/* Info */}
      <Text style={[styles.infoText, { color: theme.colors.textMuted }]}>
        {monthSnapshots.length} departures recorded (last 30 days)
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  // Main stats card
  mainStatsCard: {
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 60,
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 52,
  },
  statUnit: {
    fontSize: 14,
    marginTop: 2,
  },
  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chartSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  // Transit times
  transitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  transitCard: {
    borderRadius: 12,
    padding: 12,
    width: '48%',
    minWidth: 150,
  },
  transitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  transitRoute: {
    fontSize: 13,
    fontWeight: '500',
  },
  transitTime: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  transitCount: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyTransit: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
  },
  emptyHint: {
    fontSize: 12,
    marginTop: 4,
  },
  // Charts
  chartCard: {
    borderRadius: 12,
    padding: 16,
  },
  chartContainer: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  emptyChart: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Footer
  infoText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },
});
