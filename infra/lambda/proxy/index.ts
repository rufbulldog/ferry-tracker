import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const WSF_API_KEY = process.env.WSF_API_KEY!;
const WSF_BASE_URL = 'https://www.wsdot.wa.gov/ferries/api';

function response(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Proxy request:', event.httpMethod, event.path);

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return response(200, {});
    }

    const path = event.path;

    // /wsf/vessels - Vessel locations
    if (path === '/wsf/vessels') {
      const url = `${WSF_BASE_URL}/vessels/rest/vessellocations?apiaccesscode=${WSF_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) {
        return response(res.status, { error: `WSF API error: ${res.status}` });
      }
      const data = await res.json();
      return response(200, data);
    }

    // /wsf/terminals - Terminal sailing space
    if (path === '/wsf/terminals') {
      const url = `${WSF_BASE_URL}/terminals/rest/terminalsailingspace?apiaccesscode=${WSF_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) {
        return response(res.status, { error: `WSF API error: ${res.status}` });
      }
      const data = await res.json();
      return response(200, data);
    }

    return response(404, { error: 'Not found' });

  } catch (error) {
    console.error('Proxy error:', error);
    return response(500, { error: 'Internal server error' });
  }
}
