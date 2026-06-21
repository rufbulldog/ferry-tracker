import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RouteProvider, useRoute } from '../src/context/RouteContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { useUserLocation } from '../src/hooks/useUserLocation';
import { findNearestLocation, getRouteDefaults } from '../src/utils/locations';
import { loadPersonalLocations } from '../src/store/personalLocations';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5_000,
      retry: 2,
    },
  },
});

function LocationDefaultsSetter() {
  const { location } = useUserLocation();
  const { setLocationDefaults } = useRoute();
  const [personalLoaded, setPersonalLoaded] = useState(false);

  // Load saved home/work locations once at startup (from on-device storage).
  useEffect(() => {
    loadPersonalLocations().finally(() => setPersonalLoaded(true));
  }, []);

  useEffect(() => {
    if (!location || !personalLoaded) return;
    const nearest = findNearestLocation(location.latitude, location.longitude);
    if (nearest && nearest.distanceMeters < 10000) {
      const defaults = getRouteDefaults(nearest.location.id);
      setLocationDefaults(defaults.routeGroup, defaults.direction);
    }
  }, [location, personalLoaded, setLocationDefaults]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <RouteProvider>
              <LocationDefaultsSetter />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
              </Stack>
            </RouteProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
