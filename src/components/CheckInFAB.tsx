import { useState, useEffect } from 'react';
import { Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '../context/RouteContext';
import { useArrivalEta } from '../hooks/useArrivalEta';
import { getContactNumber, subscribePersonalLocations } from '../store/personalLocations';
import { formatTime } from '../utils/time';

export function CheckInFAB() {
  const [contactNumber, setContactNumber] = useState(() => getContactNumber());
  const { route } = useRoute();
  const { arrival } = useArrivalEta(route);

  useEffect(() => {
    return subscribePersonalLocations(() => setContactNumber(getContactNumber()));
  }, []);

  // Only the home-bound direction sends an SMS, and only when a contact is set
  if (route !== 'seattle-bainbridge' || !contactNumber) {
    return null;
  }

  const handlePress = () => {
    if (!arrival || !arrival.etaTime) return;
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
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
