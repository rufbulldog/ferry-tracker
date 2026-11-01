import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimer } from '../../src/hooks/useTimer';
import { useTransitRecords, useRecentTransitRecords, useSaveTransitRecord, useDeleteTransitRecord } from '../../src/hooks/useTransitRecords';
import { useNextDepartures } from '../../src/hooks/useNextDepartures';
import { useTheme } from '../../src/context/ThemeContext';
import { useUserLocation } from '../../src/hooks/useUserLocation';
import { findNearestLocation, getTimerRouteDefault } from '../../src/utils/locations';
import { effectiveFerryDeparture } from '../../src/utils/ferryDeparture';
import { formatTime } from '../../src/utils/time';
import { CarMeter } from '../../src/components/CarMeter';
import {
  TIMER_LEGS,
  TimerLegId,
  currentPeriod,
  formatClock,
  formatMinSec,
  getLeg,
  legStats,
  paceAgainstTypical,
  recordLabel,
  sailingOnPaceFor,
} from '../../src/utils/timerLegs';
import { TransitRecord, Vehicle } from '../../src/types/storage';

const PERIOD_TITLE = { morning: 'Morning', evening: 'Evening' } as const;

function formatRideDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const [legId, setLegId] = useState<TimerLegId>('bi-home-to-ferry');
  const [vehicle, setVehicle] = useState<Vehicle>('bike');
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  const { location } = useUserLocation();
  const gpsApplied = useRef(false);

  const timer = useTimer();
  const { data: records } = useTransitRecords();
  const { data: recentRecords, isLoading: recordsLoading } = useRecentTransitRecords(8);
  const saveRecord = useSaveTransitRecord();
  const deleteRecord = useDeleteTransitRecord();

  const leg = getLeg(legId);
  const stats = legStats(records, leg.storageRoute, vehicle);
  const isActive = timer.isRunning || timer.isPaused;

  // Sailings at the end of this leg, for the "makes the 7:55" footer. The hook
  // needs a route either way; its result is ignored for legs that end at home/work.
  const { data: departures } = useNextDepartures(leg.catchesRoute ?? 'bainbridge-seattle');

  const selectLeg = (id: TimerLegId, v?: Vehicle) => {
    const next = getLeg(id);
    setLegId(id);
    setVehicle(v ?? (next.vehicles.includes(vehicle) ? vehicle : next.vehicles[0]));
  };

  // Auto-select the leg from GPS (only once, before the user interacts)
  useEffect(() => {
    if (gpsApplied.current || !location) return;
    const nearest = findNearestLocation(location.latitude, location.longitude);
    if (nearest && nearest.distanceMeters < 5000) {
      const defaultLeg = TIMER_LEGS.find((l) => l.id === getTimerRouteDefault(nearest.location.id));
      if (defaultLeg) {
        // One-time sync from an external system (GPS) once location resolves.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLegId(defaultLeg.id);
        setVehicle((v) => (defaultLeg.vehicles.includes(v) ? v : defaultLeg.vehicles[0]));
        gpsApplied.current = true;
      }
    }
  }, [location]);

  const handleDelete = (record: TransitRecord) => {
    Alert.alert('Delete ride', `Delete this ${recordLabel(record.route, record.vehicle)} ride (${formatClock(record.durationSeconds)})?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRecord.mutate(record.id) },
    ]);
  };

  const handleDiscard = () => {
    Alert.alert('Discard this ride?', 'The time won\'t be saved.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: timer.reset },
    ]);
  };

  const handleSave = () => {
    saveRecord.mutate({
      route: leg.storageRoute,
      vehicle,
      durationSeconds: timer.elapsedSeconds,
    });
    timer.reset();
  };

  const typical = stats.typicalSeconds;
  const pace = typical !== null ? paceAgainstTypical(timer.elapsedSeconds, typical) : null;
  const over = pace !== null && pace.remainingSeconds < 0;
  const paceColor = over ? theme.colors.warning : theme.colors.primary;

  const onPace = (() => {
    if (!timer.isRunning || !pace || !leg.catchesRoute || !departures) return null;
    const upcoming = departures
      .filter((d) => d.status !== 'departed' && !d.isCancelled)
      .map((d) => effectiveFerryDeparture(d).time);
    return sailingOnPaceFor(upcoming, pace.remainingSeconds);
  })();

  // Legs grouped by morning/evening, the current half first.
  const legGroups = useMemo(() => {
    const first = currentPeriod();
    const order = first === 'morning' ? (['morning', 'evening'] as const) : (['evening', 'morning'] as const);
    return order.map((period) => ({
      period,
      rows: TIMER_LEGS.filter((l) => l.period === period).flatMap((l) =>
        l.vehicles.map((v) => ({ leg: l, vehicle: v, stats: legStats(records, l.storageRoute, v) })),
      ),
    }));
  }, [records]);

  const showVehicleToggle = leg.vehicles.length > 1 && !isActive;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.pageBg }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      {/* Current leg — same anatomy as the Ferry tab's main card */}
      <View style={[styles.card, { backgroundColor: theme.colors.cardBg }, timer.isRunning && { borderWidth: 2, borderColor: theme.colors.error }]}>
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.legButton}
              onPress={() => setModalVisible(true)}
              disabled={isActive}
              accessibilityRole="button"
              accessibilityLabel={`Leg: ${leg.label}`}
            >
              {timer.isRunning && <View style={[styles.recDot, { backgroundColor: theme.colors.error }]} />}
              <Text style={[styles.legLabel, { color: theme.colors.text }]} numberOfLines={1}>{leg.label}</Text>
              {!isActive && <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />}
            </TouchableOpacity>
            {showVehicleToggle ? (
              <View style={[styles.toggle, { backgroundColor: theme.colors.inputBg }]}>
                {leg.vehicles.map((v) => {
                  const active = vehicle === v;
                  return (
                    <TouchableOpacity
                      key={v}
                      style={[styles.toggleButton, active && { backgroundColor: theme.colors.primary }]}
                      onPress={() => setVehicle(v)}
                      accessibilityRole="button"
                      accessibilityLabel={v === 'bike' ? 'Bike' : 'Car'}
                      accessibilityState={{ selected: active }}
                    >
                      <Ionicons name={v === 'bike' ? 'bicycle' : 'car'} size={18} color={active ? '#fff' : theme.colors.textMuted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Ionicons name={vehicle === 'bike' ? 'bicycle' : 'car'} size={20} color={theme.colors.textMuted} />
            )}
          </View>

          {!isActive ? (
            <View style={styles.numbersRow}>
              <View style={styles.numberCol}>
                <Text style={[styles.numberLabel, { color: theme.colors.textMuted }]}>TYPICAL</Text>
                <Text style={[styles.bigNumber, { color: typical !== null ? theme.colors.text : theme.colors.textMuted }]}>
                  {typical !== null ? formatClock(typical) : '—'}
                  {typical !== null && <Text style={[styles.bigUnit, { color: theme.colors.textMuted }]}> min</Text>}
                </Text>
                <Text style={[styles.numberSub, { color: theme.colors.textMuted }]}>
                  {stats.rides > 0 ? `from ${stats.rides} ride${stats.rides !== 1 ? 's' : ''}` : 'No rides yet'}
                </Text>
              </View>
              <View style={styles.numberCol}>
                <Text style={[styles.numberLabel, { color: theme.colors.textMuted }]}>LAST</Text>
                <Text style={[styles.bigNumber, { color: theme.colors.textMuted }]}>
                  {stats.last ? formatClock(stats.last.durationSeconds) : '—'}
                  {stats.last && <Text style={[styles.bigUnit, { color: theme.colors.textMuted }]}> min</Text>}
                </Text>
                <Text style={[styles.numberSub, { color: theme.colors.textMuted }]} numberOfLines={1}>
                  {stats.last ? new Date(stats.last.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ' '}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.numbersRow}>
              <View style={styles.numberCol}>
                <Text style={[styles.numberLabel, { color: theme.colors.textMuted }]}>{timer.isRunning ? 'ELAPSED' : 'STOPPED AT'}</Text>
                <Text style={[styles.bigNumber, { color: theme.colors.text }]}>{formatClock(timer.elapsedSeconds)}</Text>
                <Text style={[styles.numberSub, { color: theme.colors.textMuted }]}>{timer.isRunning ? 'Recording' : 'Paused'}</Text>
              </View>
              <View style={styles.numberCol}>
                {pace ? (
                  <>
                    {/* Running: time left to your typical. Stopped: how this ride compares. */}
                    <Text style={[styles.numberLabel, { color: theme.colors.textMuted }]}>
                      {timer.isPaused ? 'VS TYPICAL' : over ? 'OVER TYPICAL' : 'TO TYPICAL'}
                    </Text>
                    <Text style={[styles.bigNumber, { color: over ? theme.colors.warning : theme.colors.success }]}>
                      {timer.isPaused ? (over ? '+' : '−') : over ? '+' : ''}{formatClock(Math.abs(pace.remainingSeconds))}
                    </Text>
                    <Text style={[styles.numberSub, { color: theme.colors.textMuted }]}>
                      {timer.isPaused ? `${over ? 'slower' : 'faster'} than ${formatClock(typical!)}` : `typical ${formatClock(typical!)}`}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.numberLabel, { color: theme.colors.textMuted }]}>FIRST RIDE</Text>
                    <Text style={[styles.bigNumber, { color: theme.colors.textMuted }]}>—</Text>
                    <Text style={[styles.numberSub, { color: theme.colors.textMuted }]}>sets your typical</Text>
                  </>
                )}
              </View>
            </View>
          )}

          {!isActive && (
            <View style={styles.noteRow}>
              <Ionicons name="boat-outline" size={14} color={theme.colors.textMuted} />
              <Text style={[styles.noteText, { color: theme.colors.textMuted }]}>Feeds “{leg.feeds}” on the Ferry tab</Text>
            </View>
          )}

          {/* Controls */}
          {!isActive ? (
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]} onPress={timer.start}>
              <Ionicons name="play" size={22} color="#fff" />
              <Text style={styles.primaryButtonText}>Start</Text>
            </TouchableOpacity>
          ) : timer.isRunning ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: theme.colors.inputBg }]} onPress={handleDiscard}>
                <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, styles.flex, { backgroundColor: theme.colors.error }]} onPress={timer.stop}>
                <Ionicons name="stop" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Stop</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: theme.colors.inputBg }]} onPress={handleDiscard}>
                <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: theme.colors.inputBg }]} onPress={timer.resume}>
                <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, styles.flex, { backgroundColor: theme.colors.success }, saveRecord.isPending && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={timer.elapsedSeconds <= 0 || saveRecord.isPending}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>{saveRecord.isPending ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Pace meter — fills toward your typical while timing */}
        {timer.isRunning && pace && (
          <View style={[styles.meterStrip, { backgroundColor: theme.colors.inputBg }]}>
            <CarMeter percent={pace.percent} color={paceColor} emptyColor={theme.colors.hoverBg} />
            <View style={styles.meterLegend}>
              <Text style={[styles.meterLegendText, { color: theme.colors.textMuted }]}>0:00</Text>
              <Text style={[styles.meterLegendText, { color: theme.colors.textMuted }]}>typical {formatClock(typical!)}</Text>
            </View>
            {onPace && (
              <Text style={[styles.onPaceText, { color: theme.colors.textMuted, borderTopColor: theme.colors.hoverBg }]}>
                Arrive ≈ {formatTime(onPace.arrive)} · makes the{' '}
                <Text style={[styles.strong, { color: theme.colors.text }]}>{formatTime(onPace.departure)}</Text>
                {' '}with {onPace.spareMinutes} min spare
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Leg picker */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBg }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text, borderBottomColor: theme.colors.hoverBg }]}>Choose a leg</Text>
            {TIMER_LEGS.map((l) => (
              <TouchableOpacity
                key={l.id}
                style={[styles.option, { borderBottomColor: theme.colors.hoverBg }, legId === l.id && { backgroundColor: theme.colors.inputBg }]}
                onPress={() => {
                  selectLeg(l.id);
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.optionText, { color: legId === l.id ? theme.colors.primary : theme.colors.text }]}>{l.label}</Text>
                {legId === l.id && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Every leg's typical — tap to switch */}
      {legGroups.map((group) => (
        <View key={group.period} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{PERIOD_TITLE[group.period]}</Text>
          <View style={[styles.listCard, { backgroundColor: theme.colors.cardBg }]}>
            {group.rows.map((row, i) => {
              const selected = row.leg.id === legId && row.vehicle === vehicle;
              const hasData = row.stats.typicalSeconds !== null;
              return (
                <TouchableOpacity
                  key={`${row.leg.id}-${row.vehicle}`}
                  style={[
                    styles.legRow,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.hoverBg },
                    selected && { backgroundColor: theme.colors.inputBg },
                  ]}
                  onPress={() => selectLeg(row.leg.id, row.vehicle)}
                  disabled={isActive}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled: isActive }}
                >
                  <Ionicons name={row.vehicle === 'bike' ? 'bicycle' : 'car'} size={18} color={theme.colors.textMuted} />
                  <Text style={[styles.legRowLabel, { color: hasData ? theme.colors.text : theme.colors.textMuted }]} numberOfLines={1}>
                    {row.leg.label}
                  </Text>
                  <Text style={[styles.legRowTime, { color: hasData ? theme.colors.text : theme.colors.textMuted }]}>
                    {hasData ? formatMinSec(row.stats.typicalSeconds!) : '—'}
                  </Text>
                  <Text style={[styles.legRowCount, { color: theme.colors.textMuted }]}>{row.stats.rides}×</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      {/* Recent rides */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent rides</Text>
        <View style={[styles.listCard, { backgroundColor: theme.colors.cardBg }]}>
          {recordsLoading ? (
            <Text style={[styles.placeholderText, { color: theme.colors.textMuted }]}>Loading…</Text>
          ) : recentRecords.length === 0 ? (
            <Text style={[styles.placeholderText, { color: theme.colors.textMuted }]}>
              Time a ride to set your typical for each leg.
            </Text>
          ) : (
            <>
              {recentRecords.map((record, i) => (
                <TouchableOpacity
                  key={record.id}
                  style={[styles.legRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.hoverBg }]}
                  onLongPress={() => handleDelete(record)}
                  delayLongPress={400}
                  accessibilityHint="Long press to delete"
                >
                  <Ionicons name={record.vehicle === 'bike' ? 'bicycle' : 'car'} size={18} color={theme.colors.textMuted} />
                  <View style={styles.flex}>
                    <Text style={[styles.recordRoute, { color: theme.colors.text }]} numberOfLines={1}>
                      {recordLabel(record.route, record.vehicle)}
                    </Text>
                    <Text style={[styles.recordMeta, { color: theme.colors.textMuted }]}>{formatRideDate(record.timestamp)}</Text>
                  </View>
                  <Text style={[styles.legRowTime, { color: theme.colors.text }]}>{formatMinSec(record.durationSeconds)}</Text>
                </TouchableOpacity>
              ))}
              <Text style={[styles.hint, { color: theme.colors.textMuted, borderTopColor: theme.colors.hoverBg }]}>
                Hold a ride to delete it
              </Text>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  flex: {
    flex: 1,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
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
  legButton: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legLabel: {
    fontSize: 17,
    fontWeight: '700',
    flexShrink: 1,
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
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteText: {
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  meterStrip: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 8,
  },
  meterLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meterLegendText: {
    fontSize: 12,
  },
  onPaceText: {
    fontSize: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  strong: {
    fontWeight: '700',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    minWidth: 300,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    borderBottomWidth: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  // Lists
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  listCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  legRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  legRowLabel: {
    flex: 1,
    fontSize: 15,
  },
  legRowTime: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  legRowCount: {
    width: 30,
    textAlign: 'right',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  recordRoute: {
    fontSize: 14,
    fontWeight: '500',
  },
  recordMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  placeholderText: {
    textAlign: 'center',
    padding: 20,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
