import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { themes, ThemeName, Theme, themeNames } from '../../src/utils/themes';

interface ThemeSwatchProps {
  themeId: ThemeName;
  theme: Theme;
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeSwatch({ themeId, theme, isSelected, onSelect }: ThemeSwatchProps) {
  const swatchBg = theme.colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.swatch,
        { backgroundColor: swatchBg },
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
});
