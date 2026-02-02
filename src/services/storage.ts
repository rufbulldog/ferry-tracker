import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TransitRecord,
  DepartureSnapshot,
  DailyTrends,
  UserPreferences,
  STORAGE_KEYS,
} from '../types/storage';

// Transit Records (Timer feature)
export async function getTransitRecords(): Promise<TransitRecord[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.TRANSIT_RECORDS);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error reading transit records:', error);
    return [];
  }
}

export async function saveTransitRecord(record: TransitRecord): Promise<void> {
  try {
    const records = await getTransitRecords();
    records.push(record);
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSIT_RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving transit record:', error);
    throw error;
  }
}

export async function deleteTransitRecord(id: string): Promise<void> {
  try {
    const records = await getTransitRecords();
    const filtered = records.filter(r => r.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSIT_RECORDS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting transit record:', error);
    throw error;
  }
}

export async function clearTransitRecords(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TRANSIT_RECORDS);
  } catch (error) {
    console.error('Error clearing transit records:', error);
    throw error;
  }
}

// Daily Trends (Trends feature)
function getTrendsKey(date: string): string {
  return `${STORAGE_KEYS.TRENDS_PREFIX}${date}`;
}

export async function getDailyTrends(date: string): Promise<DailyTrends | null> {
  try {
    const json = await AsyncStorage.getItem(getTrendsKey(date));
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Error reading daily trends:', error);
    return null;
  }
}

export async function saveDepartureSnapshot(snapshot: DepartureSnapshot): Promise<void> {
  try {
    const date = snapshot.timestamp.split('T')[0]; // Extract YYYY-MM-DD
    const trends = await getDailyTrends(date) || { date, snapshots: [] };

    // Avoid duplicates by checking if this departure was already recorded
    const exists = trends.snapshots.some(
      s => s.scheduledTime === snapshot.scheduledTime && s.route === snapshot.route
    );

    if (!exists) {
      trends.snapshots.push(snapshot);
      await AsyncStorage.setItem(getTrendsKey(date), JSON.stringify(trends));
    }
  } catch (error) {
    console.error('Error saving departure snapshot:', error);
    throw error;
  }
}

export async function getRecentTrends(days: number = 7): Promise<DailyTrends[]> {
  try {
    const results: DailyTrends[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const trends = await getDailyTrends(dateStr);
      if (trends) {
        results.push(trends);
      }
    }

    return results;
  } catch (error) {
    console.error('Error reading recent trends:', error);
    return [];
  }
}

// Clean up old trend data (keep last N days)
export async function cleanupOldTrends(keepDays: number = 7): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const trendsKeys = keys.filter(k => k.startsWith(STORAGE_KEYS.TRENDS_PREFIX));

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const keysToDelete = trendsKeys.filter(key => {
      const dateStr = key.replace(STORAGE_KEYS.TRENDS_PREFIX, '');
      return dateStr < cutoffStr;
    });

    if (keysToDelete.length > 0) {
      await AsyncStorage.multiRemove(keysToDelete);
    }
  } catch (error) {
    console.error('Error cleaning up old trends:', error);
  }
}

// User Preferences
export async function getPreferences(): Promise<UserPreferences | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Error reading preferences:', error);
    return null;
  }
}

export async function savePreferences(preferences: UserPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
