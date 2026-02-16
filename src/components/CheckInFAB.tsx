import { Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '../context/RouteContext';
import { useTransitRecords } from '../hooks/useTransitRecords';
import {
  ETA_CONTACT_NUMBER,
  FERRY_CROSSING_MINUTES,
  FERRY_TO_HOME_FALLBACK_MINUTES,
} from '../hooks/useRecommendation';
import { addMinutes, formatTime } from '../utils/time';

export function CheckInFAB() {
  const { route } = useRoute();
  const { data: transitRecords } = useTransitRecords();

  if (route !== 'seattle-bainbridge') {
    return null;
  }

  const handlePress = () => {
    // Compute ETA
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

    const smsUrl = `sms:${ETA_CONTACT_NUMBER}&body=${encodeURIComponent(message)}`;
    Linking.openURL(smsUrl);
  };

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={handlePress}
      activeOpacity={0.8}
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
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
