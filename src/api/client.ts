import axios from 'axios';
import { Platform } from 'react-native';

const API_KEY = process.env.EXPO_PUBLIC_WSF_API_KEY;
const PROXY_URL = process.env.EXPO_PUBLIC_API_URL;

// On web, use the proxy to avoid CORS issues
const isWeb = Platform.OS === 'web';

export const scheduleApi = axios.create({
  baseURL: 'https://www.wsdot.wa.gov/ferries/api/schedule/rest',
  params: { apiaccesscode: API_KEY },
});

export const vesselsApi = isWeb
  ? axios.create({ baseURL: `${PROXY_URL}/wsf` })
  : axios.create({
      baseURL: 'https://www.wsdot.wa.gov/ferries/api/vessels/rest',
      params: { apiaccesscode: API_KEY },
    });

export const terminalsApi = isWeb
  ? axios.create({ baseURL: `${PROXY_URL}/wsf` })
  : axios.create({
      baseURL: 'https://www.wsdot.wa.gov/ferries/api/terminals/rest',
      params: { apiaccesscode: API_KEY },
    });
