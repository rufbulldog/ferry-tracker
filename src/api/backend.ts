import axios from 'axios';
import { TransitRecord, DepartureSnapshot } from '../types/storage';

// API URL from environment - will be set after CDK deploy
const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transit Records API
export interface CreateTransitRecordInput {
  route: string;
  vehicle: string;
  durationSeconds: number;
}

export async function getTransitRecords(): Promise<TransitRecord[]> {
  if (!API_URL) {
    console.warn('API_URL not configured, returning empty array');
    return [];
  }
  const response = await api.get<{ records: TransitRecord[] }>('/transit-records');
  return response.data.records;
}

export async function createTransitRecord(input: CreateTransitRecordInput): Promise<TransitRecord> {
  if (!API_URL) {
    throw new Error('API_URL not configured');
  }
  const response = await api.post<TransitRecord>('/transit-records', input);
  return response.data;
}

export async function deleteTransitRecord(id: string): Promise<void> {
  if (!API_URL) {
    throw new Error('API_URL not configured');
  }
  await api.delete(`/transit-records/${id}`);
}

// Trends API
export interface TrendsResponse {
  route: string;
  date?: string;
  days?: number;
  departures: DepartureSnapshot[];
}

export async function getTodayTrends(route: string): Promise<DepartureSnapshot[]> {
  if (!API_URL) {
    console.warn('API_URL not configured, returning empty array');
    return [];
  }
  const today = new Date().toISOString().split('T')[0];
  const response = await api.get<TrendsResponse>('/trends', {
    params: { route, date: today },
  });
  return response.data.departures;
}

export async function getRecentTrends(route: string, days: number = 7): Promise<DepartureSnapshot[]> {
  if (!API_URL) {
    console.warn('API_URL not configured, returning empty array');
    return [];
  }
  const response = await api.get<TrendsResponse>('/trends/recent', {
    params: { route, days },
  });
  return response.data.departures;
}
