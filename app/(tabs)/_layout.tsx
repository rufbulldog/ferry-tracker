import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RouteSelector } from '../../src/components/RouteSelector';
import { CheckInFAB } from '../../src/components/CheckInFAB';
import { useTheme } from '../../src/context/ThemeContext';

function TabHeader() {
  return <RouteSelector />;
}

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarStyle: {
            backgroundColor: theme.colors.cardBg,
            borderTopColor: theme.colors.border,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Time',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="boat" size={size} color={color} />
            ),
            header: () => <TabHeader />,
            headerShown: true,
          }}
        />
        <Tabs.Screen
          name="recommend"
          options={{
            title: 'Leave',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bulb" size={size} color={color} />
            ),
            header: () => <TabHeader />,
            headerShown: true,
          }}
        />
        <Tabs.Screen
          name="trends"
          options={{
            title: 'Trends',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trending-up" size={size} color={color} />
            ),
            header: () => <TabHeader />,
            headerShown: true,
          }}
        />
        <Tabs.Screen
          name="timer"
          options={{
            title: 'Timer',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="timer" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <CheckInFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
