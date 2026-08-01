import { useState, useEffect } from 'react';
import { Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRoute } from '../context/RouteContext';
import { useArrivalEta } from '../hooks/useArrivalEta';
import { getContactNumber, subscribePersonalLocations } from '../store/personalLocations';
import { setCheckIn } from '../store/checkIn';
import { formatTime } from '../utils/time';

export function CheckInFAB() {
  const [contactNumber, setContactNumber] = useState(() => getContactNumber());
  const { route } = useRoute();
  const { arrival, nextDeparture } = useArrivalEta(route);
  const router = useRouter();

  useEffect(() => {
    return subscribePersonalLocations(() => setContactNumber(getContactNumber()));
  }, []);

  // The Send ETA / check-in flow only applies to the home-bound sailing.
  if (route !== 'seattle-bainbridge') {
    return null;
  }

  // No contact saved yet → show an actionable reminder instead of hiding, so the
  // feature is discoverable. Tapping jumps to Settings to add a number.
  if (!contactNumber) {
    return (
      <TouchableOpacity
        style={[styles.fab, styles.fabReminder]}
        onPress={() => router.navigate('/settings')}
        activeOpacity={0.8}
      >
        <Ionicons name="information-circle-outline" size={18} color="#fff" />
        <Text style={styles.label}>Set a contact to send ETA</Text>
      </TouchableOpacity>
    );
  }

  const handlePress = () => {
    if (!arrival || !arrival.etaTime) return;
    // Pressing Send ETA doubles as a check-in: pin the boat we're aboard so the
    // ETA stays locked to it through the loading→departed transition.
    if (nextDeparture) {
      setCheckIn({
        route,
        vesselId: nextDeparture.vesselId,
        scheduledDeparture: nextDeparture.scheduledDeparture.getTime(),
        checkedInAt: Date.now(),
      });
    }
    const message = `⛴️ Boarded, ETA: ${formatTime(arrival.etaTime)}`;
    const smsUrl = `sms:${contactNumber}&body=${encodeURIComponent(message)}`;
    Linking.openURL(smsUrl);
  };

  const disabled = !arrival || !arrival.etaTime;

  return (
    <TouchableOpacity
      style={[styles.fab, disabled && styles.fabDisabled]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
      <Text style={styles.label}>Send ETA</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 28,
    backgroundColor: '#1565C0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  fabDisabled: {
    opacity: 0.5,
  },
  // Muted, neutral look so the reminder reads as a hint, not a primary action.
  fabReminder: {
    backgroundColor: '#455A64',
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
