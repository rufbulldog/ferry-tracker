/**
 * Tests for src/store/personalLocations.ts
 *
 * Covers:
 * - loadPersonalLocations(): happy path, empty storage, parse error (data loss)
 * - getContactNumber() getter
 * - getPersonalLocations() derived list
 * - setPersonalCoords() persistence and cache update
 * - subscribePersonalLocations() / unsubscribe
 */

// Mock AsyncStorage before importing the module under test so that ts-jest
// picks up the mock at module-evaluation time.
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadPersonalLocations,
  getPersonalCoords,
  getContactNumber,
  getPersonalLocations,
  setPersonalCoords,
  subscribePersonalLocations,
} from './personalLocations';

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  // Reset module-level cache between tests by loading empty storage.
  mockGetItem.mockResolvedValue(null);
});

// ---------------------------------------------------------------------------
// loadPersonalLocations
// ---------------------------------------------------------------------------

describe('loadPersonalLocations', () => {
  test('returns false and populates cache when storage has valid JSON', async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify({ home: { lat: 47.6, lon: -122.3 }, contactNumber: '555-1234' }),
    );

    const dataLost = await loadPersonalLocations();

    expect(dataLost).toBe(false);
    expect(getPersonalCoords()).toEqual({
      home: { lat: 47.6, lon: -122.3 },
      contactNumber: '555-1234',
    });
  });

  test('returns false and sets empty cache when storage is null (first run)', async () => {
    mockGetItem.mockResolvedValue(null);

    const dataLost = await loadPersonalLocations();

    expect(dataLost).toBe(false);
    expect(getPersonalCoords()).toEqual({});
  });

  test('returns true and resets cache when stored JSON is malformed (data loss)', async () => {
    mockGetItem.mockResolvedValue('not-valid-json{{{');

    const dataLost = await loadPersonalLocations();

    expect(dataLost).toBe(true);
    expect(getPersonalCoords()).toEqual({});
  });

  test('returns true and resets cache when AsyncStorage.getItem throws', async () => {
    mockGetItem.mockRejectedValue(new Error('disk error'));

    const dataLost = await loadPersonalLocations();

    expect(dataLost).toBe(true);
    expect(getPersonalCoords()).toEqual({});
  });

  test('notifies listeners after load', async () => {
    mockGetItem.mockResolvedValue(null);
    const listener = jest.fn();
    const unsub = subscribePersonalLocations(listener);

    await loadPersonalLocations();

    expect(listener).toHaveBeenCalledTimes(1);
    unsub();
  });
});

// ---------------------------------------------------------------------------
// getContactNumber
// ---------------------------------------------------------------------------

describe('getContactNumber', () => {
  test('returns undefined when cache has no contactNumber', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ home: { lat: 47.6, lon: -122.3 } }));
    await loadPersonalLocations();

    expect(getContactNumber()).toBeUndefined();
  });

  test('returns the contactNumber stored in cache', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ contactNumber: '206-555-0100' }));
    await loadPersonalLocations();

    expect(getContactNumber()).toBe('206-555-0100');
  });
});

// ---------------------------------------------------------------------------
// getPersonalLocations
// ---------------------------------------------------------------------------

describe('getPersonalLocations', () => {
  test('returns empty array when neither home nor work is set', async () => {
    mockGetItem.mockResolvedValue(null);
    await loadPersonalLocations();

    expect(getPersonalLocations()).toEqual([]);
  });

  test('returns only home entry when only home is set', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ home: { lat: 47.6, lon: -122.3 } }));
    await loadPersonalLocations();

    expect(getPersonalLocations()).toEqual([
      { id: 'home', label: 'Home', lat: 47.6, lon: -122.3 },
    ]);
  });

  test('returns both home and work entries when both are set', async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify({
        home: { lat: 47.6, lon: -122.3 },
        work: { lat: 47.7, lon: -122.2 },
      }),
    );
    await loadPersonalLocations();

    expect(getPersonalLocations()).toEqual([
      { id: 'home', label: 'Home', lat: 47.6, lon: -122.3 },
      { id: 'work', label: 'Work', lat: 47.7, lon: -122.2 },
    ]);
  });

  test('contactNumber does not appear in getPersonalLocations output', async () => {
    mockGetItem.mockResolvedValue(
      JSON.stringify({ home: { lat: 47.6, lon: -122.3 }, contactNumber: '555-9999' }),
    );
    await loadPersonalLocations();

    const locs = getPersonalLocations();
    expect(locs).toHaveLength(1);
    expect(locs[0]).not.toHaveProperty('contactNumber');
  });
});

// ---------------------------------------------------------------------------
// setPersonalCoords
// ---------------------------------------------------------------------------

describe('setPersonalCoords', () => {
  test('updates cache and persists to AsyncStorage', async () => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    await loadPersonalLocations();

    await setPersonalCoords({ home: { lat: 48.0, lon: -122.5 }, contactNumber: '555-0000' });

    expect(getPersonalCoords()).toEqual({ home: { lat: 48.0, lon: -122.5 }, contactNumber: '555-0000' });
    expect(mockSetItem).toHaveBeenCalledWith(
      '@ferry_app_personal_locations',
      JSON.stringify({ home: { lat: 48.0, lon: -122.5 }, contactNumber: '555-0000' }),
    );
  });

  test('spreading existing cache preserves contactNumber when saving new coords', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify({ contactNumber: '555-1234' }));
    mockSetItem.mockResolvedValue(undefined);
    await loadPersonalLocations();

    // Simulate what settings.tsx does: spread the current cache, override one key.
    const current = getPersonalCoords();
    await setPersonalCoords({ ...current, home: { lat: 47.9, lon: -122.4 } });

    expect(getPersonalCoords()).toEqual({
      contactNumber: '555-1234',
      home: { lat: 47.9, lon: -122.4 },
    });
  });

  test('notifies listeners after set', async () => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    await loadPersonalLocations();

    const listener = jest.fn();
    const unsub = subscribePersonalLocations(listener);

    await setPersonalCoords({ work: { lat: 47.5, lon: -122.1 } });

    expect(listener).toHaveBeenCalledTimes(1);
    unsub();
  });
});

// ---------------------------------------------------------------------------
// subscribePersonalLocations
// ---------------------------------------------------------------------------

describe('subscribePersonalLocations', () => {
  test('unsubscribe prevents further notifications', async () => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    await loadPersonalLocations();

    const listener = jest.fn();
    const unsub = subscribePersonalLocations(listener);
    unsub();

    await setPersonalCoords({ home: { lat: 47.6, lon: -122.3 } });

    expect(listener).not.toHaveBeenCalled();
  });

  test('multiple subscribers each receive the notification', async () => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    await loadPersonalLocations();

    const listenerA = jest.fn();
    const listenerB = jest.fn();
    const unsubA = subscribePersonalLocations(listenerA);
    const unsubB = subscribePersonalLocations(listenerB);

    await setPersonalCoords({});

    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(1);
    unsubA();
    unsubB();
  });
});
