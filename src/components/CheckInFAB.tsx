import { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '../context/RouteContext';
import { useTransitRecords } from '../hooks/useTransitRecords';
import { useNextDepartures } from '../hooks/useNextDepartures';
import {
  ETA_CONTACT_NUMBER,
  FERRY_CROSSING_MINUTES,
  FERRY_TO_HOME_FALLBACK_MINUTES,
} from '../hooks/useRecommendation';
import { sendEtaSms } from '../api/backend';
import { addMinutes, formatTime } from '../utils/time';

type CheckInState = 'idle' | 'checked-in' | 'sent';

export function CheckInFAB() {
  const { route } = useRoute();
  const { data: transitRecords } = useTransitRecords();
  const { data: departures } = useNextDepartures('seattle-bainbridge');

  const [state, setState] = useState<CheckInState>('idle');
  const [checkedInVesselId, setCheckedInVesselId] = useState<number | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Reset state when route changes away
  useEffect(() => {
    if (route !== 'seattle-bainbridge') {
      setState('idle');
      setCheckedInVesselId(null);
    }
  }, [route]);

  // Pulse animation while checked in
  useEffect(() => {
    if (state === 'checked-in') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.85, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state, pulseAnim]);

  // Watch for departure and auto-send SMS
  useEffect(() => {
    if (state !== 'checked-in' || !checkedInVesselId || !departures) return;

    const vessel = departures.find(d => d.vesselId === checkedInVesselId);
    if (vessel && vessel.status === 'departed') {
      // Compute ETA and send via backend
      let ferryToHomeMinutes = FERRY_TO_HOME_FALLBACK_MINUTES;
      if (transitRecords && transitRecords.length > 0) {
        const homeRecords = transitRecords.filter(
          r => r.route === 'ferry-to-home' && r.vehicle === 'bike'
        );
        if (homeRecords.length > 0) {
          const totalSeconds = homeRecords.reduce((sum, r) => sum + r.durationSeconds, 0);
          ferryToHomeMinutes = Math.ceil(totalSeconds / homeRecords.length / 60);
        }
      }

      const totalMinutes = FERRY_CROSSING_MINUTES + ferryToHomeMinutes;
      const etaTime = addMinutes(new Date(), totalMinutes);
      const message = `⛴️ Boarded, ETA: ${formatTime(etaTime)}`;

      setState('sent');
      sendEtaSms(ETA_CONTACT_NUMBER, message).catch((err) => {
        console.error('Failed to send ETA SMS:', err);
        Alert.alert('SMS Error', 'Could not send ETA. Check backend configuration.');
      });

      // Reset after 5 seconds
      setTimeout(() => {
        setState('idle');
        setCheckedInVesselId(null);
      }, 5000);
    }
  }, [state, checkedInVesselId, departures, transitRecords]);

  if (route !== 'seattle-bainbridge') {
    return null;
  }

  const handlePress = () => {
    if (state === 'idle') {
      // Find the next non-departed ferry to check in to
      const nextFerry = departures?.find(d => d.status !== 'departed' && !d.isCancelled);
      if (!nextFerry) {
        Alert.alert('No Ferry', 'No upcoming departures to check in to.');
        return;
      }
      setCheckedInVesselId(nextFerry.vesselId);
      setState('checked-in');
    } else if (state === 'checked-in') {
      // Cancel check-in
      setState('idle');
      setCheckedInVesselId(null);
    }
  };

  const getStyle = () => {
    switch (state) {
      case 'checked-in': return styles.fabCheckedIn;
      case 'sent': return styles.fabSent;
      default: return styles.fabIdle;
    }
  };

  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (state) {
      case 'checked-in': return 'checkmark-circle';
      case 'sent': return 'checkmark-done';
      default: return 'locate';
    }
  };

  const getLabel = () => {
    switch (state) {
      case 'checked-in': return 'Checked In';
      case 'sent': return 'ETA Sent!';
      default: return 'Check In';
    }
  };

  return (
    <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity
        style={[styles.fab, getStyle()]}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={state === 'sent'}
      >
        <Ionicons name={getIcon()} size={18} color="#fff" />
        <Text style={styles.label}>{getLabel()}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 96,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  fabIdle: {
    backgroundColor: '#1565C0',
  },
  fabCheckedIn: {
    backgroundColor: '#2E7D32',
  },
  fabSent: {
    backgroundColor: '#1B5E20',
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
