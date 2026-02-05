import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Pressable, Dimensions } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimer } from '../../src/hooks/useTimer';
import { useRecentTransitRecords, useSaveTransitRecord, useDeleteTransitRecord } from '../../src/hooks/useTransitRecords';
import { useTheme } from '../../src/context/ThemeContext';
import { TransitRoute, Vehicle } from '../../src/types/storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Timer route options - these map to TransitRoute types for storage
type TimerRoute =
  | 'bi-home-to-ferry'      // Home → Bainbridge Ferry
  | 'bi-ferry-to-work'      // Seattle dock → Work
  | 'bi-work-to-ferry'      // Work → Seattle ferry
  | 'bi-ferry-to-home'      // Bainbridge dock → Home
  | 'kingston-home-to-ferry'; // Home → Kingston ferry

const TIMER_ROUTES: { id: TimerRoute; label: string; shortLabel: string; storageRoute: TransitRoute; bikeAllowed: boolean; carAllowed: boolean }[] = [
  { id: 'bi-home-to-ferry', label: 'Home → Bainbridge Ferry', shortLabel: 'Home → BI Ferry', storageRoute: 'home-to-ferry', bikeAllowed: true, carAllowed: true },
  { id: 'bi-ferry-to-work', label: 'Seattle dock → Work', shortLabel: 'Seattle → Work', storageRoute: 'ferry-to-work', bikeAllowed: true, carAllowed: false },
  { id: 'bi-work-to-ferry', label: 'Work → Seattle ferry', shortLabel: 'Work → Seattle', storageRoute: 'work-to-ferry', bikeAllowed: true, carAllowed: false },
  { id: 'bi-ferry-to-home', label: 'Bainbridge dock → Home', shortLabel: 'BI dock → Home', storageRoute: 'ferry-to-home', bikeAllowed: true, carAllowed: false },
  { id: 'kingston-home-to-ferry', label: 'Home → Kingston ferry', shortLabel: 'Home → Kingston', storageRoute: 'home-to-ferry', bikeAllowed: false, carAllowed: true },
];

// Get display label for a record based on route + vehicle
function getRecordLabel(route: TransitRoute, vehicle: Vehicle): string {
  // Bike routes are always Bainbridge
  if (vehicle === 'bike') {
    switch (route) {
      case 'home-to-ferry': return 'Home → BI Ferry';
      case 'ferry-to-work': return 'Seattle → Work';
      case 'work-to-ferry': return 'Work → Seattle';
      case 'ferry-to-home': return 'BI Ferry → Home';
    }
  }
  // Car home-to-ferry could be Bainbridge or Kingston
  if (route === 'home-to-ferry') {
    return 'Home → Ferry';
  }
  // Fallback (shouldn't happen with valid data)
  return route;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}h ${remainingMins}m`;
  }
  return `${mins}m ${secs}s`;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function TimerScreen() {
  const insets = useSafeAreaInsets();
  const [selectedRouteId, setSelectedRouteId] = useState<TimerRoute>('bi-home-to-ferry');
  const [vehicle, setVehicle] = useState<Vehicle>('bike');
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

  const timer = useTimer();
  const { data: recentRecords, isLoading: recordsLoading } = useRecentTransitRecords(10);
  const saveRecord = useSaveTransitRecord();
  const deleteRecord = useDeleteTransitRecord();

  const selectedRoute = TIMER_ROUTES.find(r => r.id === selectedRouteId) || TIMER_ROUTES[0];

  // Force valid vehicle when route changes
  useEffect(() => {
    if (!selectedRoute.bikeAllowed && vehicle === 'bike') {
      setVehicle('car');
    } else if (!selectedRoute.carAllowed && vehicle === 'car') {
      setVehicle('bike');
    }
  }, [selectedRoute, vehicle]);

  const handleDelete = (id: string, route: TransitRoute, vehicle: Vehicle) => {
    Alert.alert(
      'Delete Record',
      `Delete this ${getRecordLabel(route, vehicle)} record?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRecord.mutate(id),
        },
      ]
    );
  };

  const handleSave = () => {
    saveRecord.mutate({
      route: selectedRoute.storageRoute,
      vehicle,
      durationSeconds: timer.elapsedSeconds,
    });
    timer.reset();
  };

  const canSave = timer.isPaused && timer.elapsedSeconds > 0;
  const isActive = timer.isRunning || timer.isPaused;

  // Card color based on state
  const getCardColor = () => {
    if (timer.isRunning) return '#C62828'; // Red when running
    if (timer.isPaused && timer.elapsedSeconds > 0) return '#F57C00'; // Orange when paused with time
    return theme.colors.primary; // Theme primary when idle
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.pageBg }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      {/* Main Timer Card */}
      <View style={[styles.mainCard, { backgroundColor: getCardColor() }]}>
        {/* Top: Route selector + vehicle toggle */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={[styles.routeSelector, timer.isRunning && styles.routeSelectorDisabled]}
            onPress={() => !timer.isRunning && setModalVisible(true)}
            disabled={timer.isRunning}
          >
            <Text style={[styles.routeText, timer.isRunning && styles.routeTextDisabled]}>
              {selectedRoute.shortLabel}
            </Text>
            {!timer.isRunning && (
              <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.8)" />
            )}
          </TouchableOpacity>

          {/* Vehicle toggle - show only valid options */}
          {(selectedRoute.bikeAllowed || selectedRoute.carAllowed) && (
            <View style={styles.vehicleRow}>
              {selectedRoute.bikeAllowed && (
                <TouchableOpacity
                  style={[styles.vehicleButton, vehicle === 'bike' && styles.vehicleButtonActive]}
                  onPress={() => !timer.isRunning && setVehicle('bike')}
                  disabled={timer.isRunning}
                >
                  <Ionicons
                    name="bicycle"
                    size={24}
                    color={vehicle === 'bike' ? '#fff' : 'rgba(255,255,255,0.5)'}
                  />
                </TouchableOpacity>
              )}
              {selectedRoute.carAllowed && (
                <TouchableOpacity
                  style={[styles.vehicleButton, vehicle === 'car' && styles.vehicleButtonActive]}
                  onPress={() => !timer.isRunning && setVehicle('car')}
                  disabled={timer.isRunning}
                >
                  <Ionicons
                    name="car"
                    size={24}
                    color={vehicle === 'car' ? '#fff' : 'rgba(255,255,255,0.5)'}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Center: Timer display */}
        <View style={styles.centerContent}>
          <Text style={styles.timerDisplay}>
            {timer.formattedTime}
          </Text>
          {timer.isRunning && (
            <Text style={styles.runningLabel}>Recording...</Text>
          )}
          {timer.isPaused && timer.elapsedSeconds > 0 && (
            <Text style={styles.pausedLabel}>Paused</Text>
          )}
        </View>

        {/* Bottom: Controls */}
        <View style={styles.controlsRow}>
          {!isActive ? (
            <TouchableOpacity style={styles.mainButton} onPress={timer.start}>
              <Ionicons name="play" size={28} color="#fff" />
              <Text style={styles.mainButtonText}>Start</Text>
            </TouchableOpacity>
          ) : timer.isRunning ? (
            <TouchableOpacity style={styles.mainButton} onPress={timer.stop}>
              <Ionicons name="pause" size={28} color="#fff" />
              <Text style={styles.mainButtonText}>Stop</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.pausedControls}>
              <TouchableOpacity style={styles.secondaryButton} onPress={timer.resume}>
                <Ionicons name="play" size={24} color="#fff" />
                <Text style={styles.secondaryButtonText}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, !canSave && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={!canSave || saveRecord.isPending}
              >
                <Ionicons name="checkmark" size={24} color="#fff" />
                <Text style={styles.primaryButtonText}>
                  {saveRecord.isPending ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Reset button - only when active */}
        {isActive && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={timer.reset}
            disabled={timer.isRunning}
          >
            <Text style={[styles.resetText, timer.isRunning && styles.resetTextDisabled]}>
              Reset
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Route Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBg }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}>Select Route</Text>
            {TIMER_ROUTES.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[styles.option, { borderBottomColor: theme.colors.border }, selectedRouteId === route.id && { backgroundColor: theme.colors.inputBg }]}
                onPress={() => {
                  setSelectedRouteId(route.id);
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.optionText, { color: theme.colors.text }, selectedRouteId === route.id && { color: theme.colors.primary }]}>
                  {route.label}
                </Text>
                {selectedRouteId === route.id && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Recent Times */}
      <View style={[styles.historySection, { backgroundColor: theme.colors.cardBg }]}>
        <Text style={[styles.historyTitle, { color: theme.colors.text }]}>Recent Times</Text>
        {recordsLoading ? (
          <Text style={[styles.placeholderText, { color: theme.colors.textMuted }]}>Loading...</Text>
        ) : recentRecords.length === 0 ? (
          <Text style={[styles.placeholderText, { color: theme.colors.textMuted }]}>
            No recorded times yet. Start tracking your commute!
          </Text>
        ) : (
          <View style={styles.recordsList}>
            {recentRecords.map((record) => (
              <View key={record.id} style={[styles.recordRow, { borderBottomColor: theme.colors.border }]}>
                <View style={styles.recordInfo}>
                  <Text style={[styles.recordRoute, { color: theme.colors.text }]}>
                    {getRecordLabel(record.route, record.vehicle)}
                  </Text>
                  <Text style={[styles.recordMeta, { color: theme.colors.textMuted }]}>
                    {record.vehicle} · {formatDate(record.timestamp)}
                  </Text>
                </View>
                <Text style={[styles.recordDuration, { color: theme.colors.primary }]}>
                  {formatDuration(record.durationSeconds)}
                </Text>
                <IconButton
                  icon="close"
                  size={18}
                  iconColor={theme.colors.textMuted}
                  onPress={() => handleDelete(record.id, record.route, record.vehicle)}
                  style={styles.deleteButton}
                />
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  // Main card
  mainCard: {
    height: SCREEN_HEIGHT * 0.55,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  // Top row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  routeSelectorDisabled: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  routeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  routeTextDisabled: {
    color: 'rgba(255,255,255,0.6)',
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  vehicleButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  vehicleButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  // Center
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  timerDisplay: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  runningLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  pausedLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  // Controls
  controlsRow: {
    alignItems: 'center',
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  mainButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  pausedControls: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  resetButton: {
    alignSelf: 'center',
    marginTop: 12,
  },
  resetText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  resetTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
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
  // History section
  historySection: {
    borderRadius: 12,
    padding: 16,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  placeholderText: {
    textAlign: 'center',
    paddingVertical: 16,
  },
  recordsList: {
    gap: 0,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  recordInfo: {
    flex: 1,
  },
  recordRoute: {
    fontSize: 14,
    fontWeight: '500',
  },
  recordMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  recordDuration: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  deleteButton: {
    margin: 0,
  },
});
