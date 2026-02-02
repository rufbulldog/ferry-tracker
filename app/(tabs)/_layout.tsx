import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteSelector } from '../../src/components/RouteSelector';

function TabHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ backgroundColor: '#fff', paddingTop: insets.top }}>
      <RouteSelector />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1565C0',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      <Tabs.Screen
        name="recommend"
        options={{
          title: 'Recommend',
          href: '/recommend',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb" size={size} color={color} />
          ),
          header: () => <TabHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Depart',
          href: '/',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="boat" size={size} color={color} />
          ),
          header: () => <TabHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: 'Trends',
          href: '/trends',
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
          href: '/timer',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="timer" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
