import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { themes, ThemeName, Theme, basicThemes, teamThemes } from '../../src/utils/themes';

interface ThemeSwatchProps {
  themeId: ThemeName;
  theme: Theme;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeSwatch({ themeId, theme, isSelected, onSelect }: ThemeSwatchProps) {
  // Cougars needs its cardBg (grey) as swatch background since logo is dark on crimson
  const isCougars = themeId === 'cougars';
  const swatchBg = isCougars ? theme.colors.cardBg : theme.colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.swatch,
        { backgroundColor: swatchBg },
        isSelected && styles.swatchSelected,
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
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      )}
      <Text style={styles.swatchLabel} numberOfLines={1}>
        {theme.label}
      </Text>
    </TouchableOpacity>
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

        <Text style={[styles.groupLabel, { color: theme.colors.textMuted }]}>
          Basic Colors
        </Text>
        <View style={styles.swatchGrid}>
          {basicThemes.map((id) => (
            <ThemeSwatch
              key={id}
              themeId={id}
              theme={themes[id]}
              isSelected={themeName === id}
              onSelect={() => setTheme(id)}
            />
          ))}
        </View>

        <Text style={[styles.groupLabel, { color: theme.colors.textMuted }]}>
          Team Colors
        </Text>
        <View style={styles.swatchGrid}>
          {teamThemes.map((id) => (
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
  groupLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
    marginTop: 8,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    width: 80,
    height: 100,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  logoImageDirect: {
    width: 48,
    height: 48,
    marginTop: 4,
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoText: {
    fontSize: 14,
  },
});
