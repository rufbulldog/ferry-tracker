import axios from 'axios';

// All Washington State Ferries data is fetched through our own backend proxy,
// which holds the WSF API key server-side (see infra/lambda/proxy). No API key
// ships in the app bundle. The base URL is the public API Gateway endpoint.
const PROXY_URL = process.env.EXPO_PUBLIC_API_URL;
const wsfBaseURL = `${PROXY_URL}/wsf`;

export const scheduleApi = axios.create({ baseURL: wsfBaseURL });
export const vesselsApi = axios.create({ baseURL: wsfBaseURL });
export const terminalsApi = axios.create({ baseURL: wsfBaseURL });
