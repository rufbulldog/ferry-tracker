import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { themes, ThemeName, Theme, themeNames } from '../../src/utils/themes';
import {
  getPersonalCoords,
  setPersonalCoords,
  type PersonalCoords,
} from '../../src/store/personalLocations';

interface ThemeSwatchProps {
  themeId: ThemeName;
  theme: Theme;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeSwatch({ themeId, theme, isSelected, onSelect }: ThemeSwatchProps) {
  const isLight = themeId.endsWith('-white');
  const swatchBg = isLight ? '#FFFFFF' : theme.colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.swatch,
        { backgroundColor: swatchBg },
        isLight && { borderWidth: 2, borderColor: theme.colors.primary },
        isSelected && [styles.swatchSelected, { borderColor: theme.colors.border }],
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {theme.logoUrl && (
        <Image
          source={{ uri: theme.logoUrl }}
          style={styles.logoImageDirect}
          resizeMode="contain"
        />
      )}
      {isSelected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

function coordToText(v: number | undefined): string {
  return typeof v === 'number' && Number.isFinite(v) ? String(v) : '';
}

function parsePair(latStr: string, lonStr: string): { lat: number; lon: number } | undefined {
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : undefined;
}

function PersonalLocationsSection({ theme }: { theme: Theme }) {
  const initial = getPersonalCoords();
  const [homeLat, setHomeLat] = useState(coordToText(initial.home?.lat));
  const [homeLon, setHomeLon] = useState(coordToText(initial.home?.lon));
  const [workLat, setWorkLat] = useState(coordToText(initial.work?.lat));
  const [workLon, setWorkLon] = useState(coordToText(initial.work?.lon));
  const [saving, setSaving] = useState(false);

  const fillCurrent = async (which: 'home' | 'work') => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location permission needed',
        'Enable location access to use your current position.'
      );
      return;
    }
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const lat = String(pos.coords.latitude);
    const lon = String(pos.coords.longitude);
    if (which === 'home') {
      setHomeLat(lat);
      setHomeLon(lon);
    } else {
      setWorkLat(lat);
      setWorkLon(lon);
    }
  };

  const onSave = async () => {
    const next: PersonalCoords = {};
    const home = parsePair(homeLat, homeLon);
    const work = parsePair(workLat, workLon);
    if (home) next.home = home;
    if (work) next.work = work;
    setSaving(true);
    try {
      await setPersonalCoords(next);
      Alert.alert('Saved', 'Your personal locations were updated.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      color: theme.colors.text,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.pageBg,
    },
  ];

  const rows: { key: 'home' | 'work'; label: string }[] = [
    { key: 'home', label: 'Home' },
    { key: 'work', label: 'Work' },
  ];

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.cardBg }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Personal locations
      </Text>
      <Text style={[styles.infoText, { color: theme.colors.textMuted, marginBottom: 16 }]}>
        Optional. Used to auto-pick your route by GPS. Stored only on this device — never
        uploaded or built into the app.
      </Text>

      {rows.map(({ key, label }) => {
        const latVal = key === 'home' ? homeLat : workLat;
        const lonVal = key === 'home' ? homeLon : workLon;
        const setLat = key === 'home' ? setHomeLat : setWorkLat;
        const setLon = key === 'home' ? setHomeLon : setWorkLon;
        return (
          <View key={key} style={styles.locRow}>
            <Text style={[styles.locLabel, { color: theme.colors.text }]}>{label}</Text>
            <View style={styles.coordInputs}>
              <TextInput
                value={latVal}
                onChangeText={setLat}
                placeholder="Latitude"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                style={inputStyle}
              />
              <TextInput
                value={lonVal}
                onChangeText={setLon}
                placeholder="Longitude"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                style={inputStyle}
              />
            </View>
            <TouchableOpacity
              onPress={() => fillCurrent(key)}
              style={styles.useCurrentBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={16} color={theme.colors.primary} />
              <Text style={[styles.useCurrentText, { color: theme.colors.primary }]}>
                Use current location
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <TouchableOpacity
        onPress={onSave}
        disabled={saving}
        activeOpacity={0.8}
        style={[styles.saveBtn, { backgroundColor: theme.colors.primary, opacity: saving ? 0.6 : 1 }]}
      >
        <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save locations'}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { themeName, theme, setTheme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.pageBg }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <Text style={[styles.pageTitle, { color: theme.colors.text }]}>
        Settings
      </Text>

      <View style={[styles.section, { backgroundColor: theme.colors.cardBg }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Theme
        </Text>

        <View style={styles.swatchGrid}>
          {themeNames.map((id) => (
            <ThemeSwatch
              key={id}
              themeId={id}
              theme={themes[id]}
              isSelected={themeName === id}
              onSelect={() => setTheme(id)}
            />
          ))}
        </View>
      </View>

      <PersonalLocationsSection theme={theme} />

      <View style={[styles.section, { backgroundColor: theme.colors.cardBg }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          About
        </Text>
        <Text style={[styles.infoText, { color: theme.colors.textMuted }]}>
          Ferry Tracker v1.0.0
        </Text>
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
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 70,
    height: 70,
    borderRadius: 10,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: {
    borderWidth: 3,
  },
  logoImageDirect: {
    width: 40,
    height: 40,
    marginTop: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 14,
  },
  locRow: {
    marginBottom: 16,
  },
  locLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  coordInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  useCurrentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  useCurrentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
