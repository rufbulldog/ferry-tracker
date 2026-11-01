import { useEffect, useState } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RouteProvider, useRoute } from '../src/context/RouteContext';
import { BestSailingProvider } from '../src/context/BestSailingContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { useUserLocation } from '../src/hooks/useUserLocation';
import { findNearestLocation, getRouteDefaults } from '../src/utils/locations';
import { loadPersonalLocations } from '../src/store/personalLocations';

// React Native has no window focus events, so react-query never knows the app
// came back from the background — it would keep serving the pre-suspend vessel
// positions until the next poll tick. Tie "focused" to AppState so every live
// query refetches the moment the app is foregrounded.
focusManager.setEventListener((handleFocus) => {
  if (Platform.OS === 'web') return undefined;
  const sub = AppState.addEventListener('change', (state) => handleFocus(state === 'active'));
  return () => sub.remove();
});

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

  // Load saved personal settings once at startup (from on-device storage).
  useEffect(() => {
    loadPersonalLocations().then((dataLost) => {
      if (dataLost) {
        Alert.alert(
          'Settings reset',
          'Your saved locations and check-in contact could not be read and have been cleared. Please re-enter them in Settings.',
        );
      }
    }).finally(() => setPersonalLoaded(true));
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
              <BestSailingProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="planner" options={{ presentation: 'modal' }} />
                </Stack>
              </BestSailingProvider>
            </RouteProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
