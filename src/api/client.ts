import axios from 'axios';

const API_KEY = process.env.EXPO_PUBLIC_WSF_API_KEY;

export const scheduleApi = axios.create({
  baseURL: 'https://www.wsdot.wa.gov/ferries/api/schedule/rest',
  params: { apiaccesscode: API_KEY },
});

export const vesselsApi = axios.create({
  baseURL: 'https://www.wsdot.wa.gov/ferries/api/vessels/rest',
  params: { apiaccesscode: API_KEY },
});

export const terminalsApi = axios.create({
  baseURL: 'https://www.wsdot.wa.gov/ferries/api/terminals/rest',
  params: { apiaccesscode: API_KEY },
});
