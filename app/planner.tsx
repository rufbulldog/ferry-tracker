import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '../src/context/RouteContext';
import { useTheme } from '../src/context/ThemeContext';
import { useFutureSchedule, useValidDateRange } from '../src/hooks/useFutureSchedule';
import { useTransitRecords } from '../src/hooks/useTransitRecords';
import { useRecentTrends } from '../src/hooks/useDailyTrends';
import { MonthCalendar } from '../src/components/MonthCalendar';
import { ROUTES } from '../src/utils/constants';
import { Vehicle } from '../src/types/storage';
import { TRAVEL_TIMES } from '../src/utils/transitConfig';
import { computePlanEstimate } from '../src/utils/planEstimate';
import { toYMD, addDays, startOfDay, isSameDay, formatDayLabel, daysBetween } from '../src/utils/dateHelpers';
import { formatTime } from '../src/utils/time';

export default function PlannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { route } = useRoute();
  const { theme } = useTheme();

  const routeLabel = ROUTES[route].label;

  // Which vehicle modes this route supports; default to the first available.
  const availableVehicles = useMemo(
    () => (['bike', 'car'] as Vehicle[]).filter((v) => TRAVEL_TIMES[route][v]),
    [route],
  );
  const [vehicle, setVehicle] = useState<Vehicle>(() => availableVehicles[0] ?? 'bike');

  // Default to tomorrow (the planner is for future days).
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(addDays(new Date(), 1)));
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { from: rangeFrom, thru: rangeThru } = useValidDateRange();
  // Clamp navigation to today..DateThru.
  const minDate = startOfDay(new Date());
  const maxDate = rangeThru ? startOfDay(rangeThru) : addDays(minDate, 90);

  const canPrev = daysBetween(minDate, selectedDate) > 0;
  const canNext = daysBetween(selectedDate, maxDate) > 0;

  const { data: sailings, isLoading, error } = useFutureSchedule(route, toYMD(selectedDate));
  const { data: transitRecords } = useTransitRecords();
  const { data: trends } = useRecentTrends(route, 30);

  const stepDay = (delta: number) => {
    const next = startOfDay(addDays(selectedDate, delta));
    if (next < minDate || next > maxDate) return;
    setSelectedDate(next);
  };

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.pageBg, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Plan a trip</Text>
          <Text style={[styles.headerRoute, { color: theme.colors.textMuted }]}>{routeLabel}</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} hitSlop={10}>
          <Ionicons name="close" size={26} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Date control */}
      <View style={styles.dateRow}>
        <TouchableOpacity onPress={() => stepDay(-1)} disabled={!canPrev} style={styles.dayArrow} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={canPrev ? theme.colors.text : theme.colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dateLabelWrap, { backgroundColor: theme.colors.cardBg }]}
          onPress={() => setCalendarOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.dateLabel, { color: theme.colors.text }]}>
            {isToday ? 'Today' : formatDayLabel(selectedDate)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => stepDay(1)} disabled={!canNext} style={styles.dayArrow} hitSlop={8}>
          <Ionicons name="chevron-forward" size={22} color={canNext ? theme.colors.text : theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Vehicle toggle (only when the route supports a choice) */}
      {availableVehicles.length > 0 && (
        <View style={[styles.vehicleRow, { backgroundColor: theme.colors.inputBg }]}>
          {availableVehicles.map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.vehicleBtn, vehicle === v && { backgroundColor: theme.colors.primary }]}
              onPress={() => setVehicle(v)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={v === 'bike' ? 'bicycle' : 'car'}
                size={16}
                color={vehicle === v ? '#fff' : theme.colors.textMuted}
              />
              <Text style={[styles.vehicleText, { color: vehicle === v ? '#fff' : theme.colors.textMuted }]}>
                {v === 'bike' ? 'Bike / walk' : 'Car'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Sailing list */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {isLoading && (
          <View style={styles.centerBox}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}
        {error && (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            Couldn&apos;t load the schedule for this day. Try another date.
          </Text>
        )}
        {!isLoading && !error && sailings && sailings.length === 0 && (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            No sailings scheduled for this day.
          </Text>
        )}
        {!isLoading && !error && sailings && sailings.map((s) => {
          const est = computePlanEstimate({
            sailing: s.departingTime,
            route,
            vehicle,
            transitRecords,
            trends,
          });
          return (
            <View key={`${s.vesselId}-${s.departingTime.getTime()}`} style={[styles.sailingRow, { backgroundColor: theme.colors.cardBg }]}>
              <View style={styles.sailingLeft}>
                <Text style={[styles.sailingTime, { color: theme.colors.text }]}>{formatTime(s.departingTime)}</Text>
                <Text style={[styles.sailingVessel, { color: theme.colors.textMuted }]}>{s.vesselName}</Text>
              </View>
              <View style={styles.sailingRight}>
                {est.available && est.leaveBy ? (
                  <>
                    <Text style={[styles.leaveBy, { color: theme.colors.primary }]}>
                      Leave by {formatTime(est.leaveBy)}
                    </Text>
                    <Text style={[styles.leaveBySub, { color: theme.colors.textMuted }]}>
                      {est.transitMinutes} min {vehicle === 'bike' ? 'bike/walk' : 'drive'}
                      {est.historySampleSize >= 3 && est.typicalCapacityPercent !== null
                        ? ` · usually ~${est.typicalCapacityPercent}% full`
                        : ''}
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.leaveBySub, { color: theme.colors.textMuted }]}>
                    Set up {vehicle === 'bike' ? 'bike' : 'car'} travel time to estimate
                  </Text>
                )}
              </View>
            </View>
          );
        })}
        {rangeFrom && (
          <Text style={[styles.rangeNote, { color: theme.colors.textMuted }]}>
            Leave-by uses your recorded travel times and past delay/capacity trends.
          </Text>
        )}
      </ScrollView>

      {/* Calendar popup */}
      <Modal visible={calendarOpen} transparent animationType="fade" onRequestClose={() => setCalendarOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setCalendarOpen(false)}>
          <Pressable style={[styles.calendarCard, { backgroundColor: theme.colors.cardBg }]}>
            <MonthCalendar
              selected={selectedDate}
              min={minDate}
              max={maxDate}
              onSelect={(d) => {
                setSelectedDate(startOfDay(d));
                setCalendarOpen(false);
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerRoute: { fontSize: 13, marginTop: 2 },
  closeBtn: { padding: 4 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dayArrow: { padding: 6 },
  dateLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    minWidth: 180,
    justifyContent: 'center',
  },
  dateLabel: { fontSize: 15, fontWeight: '600' },
  vehicleRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 22,
    padding: 4,
    marginBottom: 8,
  },
  vehicleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 18,
  },
  vehicleText: { fontSize: 14, fontWeight: '600' },
  listContent: { padding: 16, paddingTop: 8 },
  centerBox: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: 40 },
  sailingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  sailingLeft: {},
  sailingTime: { fontSize: 18, fontWeight: '700' },
  sailingVessel: { fontSize: 12, marginTop: 2 },
  sailingRight: { alignItems: 'flex-end', flexShrink: 1, marginLeft: 12 },
  leaveBy: { fontSize: 15, fontWeight: '700' },
  leaveBySub: { fontSize: 11, marginTop: 2, textAlign: 'right' },
  rangeNote: { fontSize: 11, textAlign: 'center', marginTop: 12, paddingHorizontal: 20, lineHeight: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  calendarCard: {
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 360,
  },
});
