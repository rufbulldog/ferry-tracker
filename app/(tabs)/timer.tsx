import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Text, Card, Button, SegmentedButtons, IconButton } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimer } from '../../src/hooks/useTimer';
import { useRecentTransitRecords, useSaveTransitRecord, useDeleteTransitRecord } from '../../src/hooks/useTransitRecords';
import { TransitRoute, Vehicle } from '../../src/types/storage';

// Timer route options - these map to TransitRoute types for storage
type TimerRoute =
  | 'bi-home-to-ferry'      // Home → Bainbridge Ferry
  | 'bi-ferry-to-work'      // Seattle dock → Work
  | 'bi-work-to-ferry'      // Work → Seattle ferry
  | 'bi-ferry-to-home'      // Bainbridge dock → Home
  | 'kingston-home-to-ferry'; // Home → Kingston ferry

const TIMER_ROUTES: { id: TimerRoute; label: string; storageRoute: TransitRoute; carOnly: boolean }[] = [
  { id: 'bi-home-to-ferry', label: 'Home → Bainbridge Ferry', storageRoute: 'home-to-ferry', carOnly: false },
  { id: 'bi-ferry-to-work', label: 'Seattle dock → Work', storageRoute: 'ferry-to-work', carOnly: false },
  { id: 'bi-work-to-ferry', label: 'Work → Seattle ferry', storageRoute: 'work-to-ferry', carOnly: false },
  { id: 'bi-ferry-to-home', label: 'Bainbridge dock → Home', storageRoute: 'ferry-to-home', carOnly: false },
  { id: 'kingston-home-to-ferry', label: 'Home → Kingston ferry', storageRoute: 'home-to-ferry', carOnly: true },
];

// All route labels for displaying history
const ALL_ROUTE_LABELS: Record<TransitRoute, string> = {
  'home-to-ferry': 'Home → Ferry',
  'ferry-to-work': 'Ferry → Work',
  'work-to-ferry': 'Work → Ferry',
  'ferry-to-home': 'Ferry → Home',
};

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

  const timer = useTimer();
  const { data: recentRecords, isLoading: recordsLoading } = useRecentTransitRecords(10);
  const saveRecord = useSaveTransitRecord();
  const deleteRecord = useDeleteTransitRecord();

  const selectedRoute = TIMER_ROUTES.find(r => r.id === selectedRouteId) || TIMER_ROUTES[0];

  // If car-only route is selected, force vehicle to car
  useEffect(() => {
    if (selectedRoute.carOnly && vehicle !== 'car') {
      setVehicle('car');
    }
  }, [selectedRoute.carOnly, vehicle]);

  const handleDelete = (id: string, route: TransitRoute) => {
    Alert.alert(
      'Delete Record',
      `Delete this ${ALL_ROUTE_LABELS[route]} record?`,
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

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={styles.content}>
      {/* Timer Display */}
      <Card style={styles.timerCard}>
        <Card.Content style={styles.timerContent}>
          <Text style={styles.timerDisplay}>
            {timer.formattedTime}
          </Text>
          <Text variant="bodyMedium" style={styles.timerRoute}>
            {selectedRoute.label} ({vehicle})
          </Text>
        </Card.Content>
      </Card>

      {/* Route Selection */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Timing</Text>
        <Card.Content>
          <TouchableOpacity
            style={[styles.dropdown, timer.isRunning && styles.dropdownDisabled]}
            onPress={() => !timer.isRunning && setModalVisible(true)}
            activeOpacity={timer.isRunning ? 1 : 0.7}
          >
            <Text style={[styles.dropdownText, timer.isRunning && styles.dropdownTextDisabled]}>
              {selectedRoute.label}
            </Text>
            <Ionicons name="chevron-down" size={20} color={timer.isRunning ? '#999' : '#1565C0'} />
          </TouchableOpacity>

          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
              <View style={styles.modalContent}>
                {TIMER_ROUTES.map((route) => (
                  <TouchableOpacity
                    key={route.id}
                    style={[styles.option, selectedRouteId === route.id && styles.optionSelected]}
                    onPress={() => {
                      setSelectedRouteId(route.id);
                      setModalVisible(false);
                    }}
                  >
                    {selectedRouteId === route.id && (
                      <Ionicons name="checkmark" size={20} color="#1565C0" style={styles.checkIcon} />
                    )}
                    <Text style={[styles.optionText, selectedRouteId === route.id && styles.optionTextSelected]}>
                      {route.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Modal>
        </Card.Content>
      </Card>

      {/* Vehicle Selection - hidden for car-only routes */}
      {!selectedRoute.carOnly && (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Vehicle</Text>
          <Card.Content>
            <SegmentedButtons
              value={vehicle}
              onValueChange={(value) => !timer.isRunning && setVehicle(value as Vehicle)}
              buttons={[
                {
                  value: 'bike',
                  label: 'Bike',
                  disabled: timer.isRunning,
                  style: vehicle === 'bike' ? styles.buttonSelected : styles.buttonUnselected,
                  labelStyle: vehicle === 'bike' ? styles.labelSelected : styles.labelUnselected,
                },
                {
                  value: 'car',
                  label: 'Car',
                  disabled: timer.isRunning,
                  style: vehicle === 'car' ? styles.buttonSelected : styles.buttonUnselected,
                  labelStyle: vehicle === 'car' ? styles.labelSelected : styles.labelUnselected,
                },
              ]}
            />
          </Card.Content>
        </Card>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {!timer.isRunning && !timer.isPaused ? (
          <Button
            mode="contained"
            onPress={timer.start}
            style={styles.startButton}
            labelStyle={styles.controlButtonLabel}
          >
            Start Timer
          </Button>
        ) : timer.isRunning ? (
          <Button
            mode="contained"
            onPress={timer.stop}
            style={styles.stopButton}
            labelStyle={styles.controlButtonLabel}
          >
            Stop Timer
          </Button>
        ) : (
          <View style={styles.pausedControls}>
            <Button
              mode="contained"
              onPress={timer.resume}
              style={[styles.resumeButton, styles.halfButton]}
              labelStyle={styles.controlButtonLabel}
            >
              Resume
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={[styles.saveButton, styles.halfButton]}
              labelStyle={styles.controlButtonLabel}
              disabled={!canSave || saveRecord.isPending}
            >
              {saveRecord.isPending ? 'Saving...' : 'Save'}
            </Button>
          </View>
        )}

        {(timer.isRunning || timer.isPaused) && (
          <Button
            mode="outlined"
            onPress={timer.reset}
            style={styles.resetButton}
            disabled={timer.isRunning}
          >
            Reset
          </Button>
        )}
      </View>

      {/* Recent Times */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Recent Times</Text>
        <Card.Content>
          {recordsLoading ? (
            <Text style={styles.placeholderText}>Loading...</Text>
          ) : recentRecords.length === 0 ? (
            <Text style={styles.placeholderText}>
              No recorded times yet. Start tracking your commute!
            </Text>
          ) : (
            <View style={styles.recordsList}>
              {recentRecords.map((record) => (
                <View key={record.id} style={styles.recordRow}>
                  <View style={styles.recordInfo}>
                    <Text variant="bodyMedium" style={styles.recordRoute}>
                      {ALL_ROUTE_LABELS[record.route]}
                    </Text>
                    <Text variant="bodySmall" style={styles.recordMeta}>
                      {record.vehicle} - {formatDate(record.timestamp)}
                    </Text>
                  </View>
                  <Text variant="titleMedium" style={styles.recordDuration}>
                    {formatDuration(record.durationSeconds)}
                  </Text>
                  <IconButton
                    icon="delete"
                    size={20}
                    iconColor="#C62828"
                    onPress={() => handleDelete(record.id, record.route)}
                  />
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  buttonSelected: {
    backgroundColor: '#1565C0',
    borderColor: '#1565C0',
  },
  buttonUnselected: {
    backgroundColor: '#fff',
    borderColor: '#1565C0',
  },
  labelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  labelUnselected: {
    color: '#1565C0',
    fontWeight: '500',
  },
  timerCard: {
    marginBottom: 16,
    backgroundColor: '#1565C0',
  },
  timerContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  timerRoute: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1565C0',
    borderRadius: 4,
  },
  dropdownDisabled: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1565C0',
    fontWeight: '500',
  },
  dropdownTextDisabled: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 300,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionSelected: {
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#1565C0',
    fontWeight: '500',
  },
  checkIcon: {
    marginRight: 12,
  },
  controls: {
    marginBottom: 16,
    gap: 8,
  },
  pausedControls: {
    flexDirection: 'row',
    gap: 8,
  },
  halfButton: {
    flex: 1,
  },
  startButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
  },
  stopButton: {
    backgroundColor: '#C62828',
    paddingVertical: 8,
  },
  resumeButton: {
    backgroundColor: '#1565C0',
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
  },
  resetButton: {
    borderColor: '#666',
  },
  controlButtonLabel: {
    fontSize: 18,
  },
  placeholderText: {
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
  recordsList: {
    gap: 12,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordInfo: {
    flex: 1,
  },
  recordRoute: {
    color: '#333',
  },
  recordMeta: {
    color: '#999',
    marginTop: 2,
  },
  recordDuration: {
    color: '#1565C0',
    fontWeight: '600',
  },
});
