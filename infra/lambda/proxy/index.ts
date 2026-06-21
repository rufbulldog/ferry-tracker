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

/**
 * Map an API Gateway resource template (+ path params) to the upstream WSF REST
 * path. Returns null for unknown routes. Exported for unit testing.
 *
 * The WSF API key is appended by the caller and never leaves the backend.
 */
export function wsfPathFor(
  resource: string,
  params: Record<string, string | undefined> | null,
): string | null {
  switch (resource) {
    case '/wsf/vessels':
      return 'vessels/rest/vessellocations';
    case '/wsf/terminals':
      return 'terminals/rest/terminalsailingspace';
    case '/wsf/bulletins/{terminalId}': {
      const id = params?.terminalId;
      return id
        ? `terminals/rest/terminalbulletins/${encodeURIComponent(id)}`
        : null;
    }
    case '/wsf/schedule/{routeId}/{onlyRemaining}': {
      const routeId = params?.routeId;
      const onlyRemaining = params?.onlyRemaining;
      return routeId && onlyRemaining
        ? `schedule/rest/scheduletoday/${encodeURIComponent(routeId)}/${encodeURIComponent(onlyRemaining)}`
        : null;
    }
    default:
      return null;
  }
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Proxy request:', event.httpMethod, event.resource);

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return response(200, {});
    }

    const wsfPath = wsfPathFor(event.resource, event.pathParameters);
    if (!wsfPath) {
      return response(404, { error: 'Not found' });
    }

    const url = `${WSF_BASE_URL}/${wsfPath}?apiaccesscode=${WSF_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      return response(res.status, { error: `WSF API error: ${res.status}` });
    }
    const data = await res.json();
    return response(200, data);
  } catch (error) {
    console.error('Proxy error:', error);
    return response(500, { error: 'Internal server error' });
  }
}
