import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5_000,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#1565C0' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          >
            <Stack.Screen
              name="index"
              options={{ title: 'Ferry Tracker' }}
            />
            <Stack.Screen
              name="schedule"
              options={{ title: 'Full Schedule' }}
            />
            <Stack.Screen
              name="settings"
              options={{ title: 'Settings' }}
            />
          </Stack>
        </SafeAreaProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
