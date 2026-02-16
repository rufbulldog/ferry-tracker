import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const DEPARTURES_TABLE = process.env.DEPARTURES_TABLE!;
const TRANSIT_TABLE = process.env.TRANSIT_TABLE!;

function response(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(body),
  };
}

// GET /trends?route=X&date=YYYY-MM-DD
async function getTrends(route: string, date: string): Promise<APIGatewayProxyResult> {
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  const result = await docClient.send(new QueryCommand({
    TableName: DEPARTURES_TABLE,
    KeyConditionExpression: '#route = :route AND #ts BETWEEN :start AND :end',
    ExpressionAttributeNames: {
      '#route': 'route',
      '#ts': 'timestamp',
    },
    ExpressionAttributeValues: {
      ':route': route,
      ':start': startOfDay.toISOString(),
      ':end': endOfDay.toISOString(),
    },
  }));

  return response(200, {
    route,
    date,
    departures: result.Items || [],
  });
}

// GET /trends/recent?route=X&days=7
async function getRecentTrends(route: string, days: number): Promise<APIGatewayProxyResult> {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const result = await docClient.send(new QueryCommand({
    TableName: DEPARTURES_TABLE,
    KeyConditionExpression: '#route = :route AND #ts >= :start',
    ExpressionAttributeNames: {
      '#route': 'route',
      '#ts': 'timestamp',
    },
    ExpressionAttributeValues: {
      ':route': route,
      ':start': startDate.toISOString(),
    },
  }));

  return response(200, {
    route,
    days,
    departures: result.Items || [],
  });
}

// GET /trends/latest?route=X&limit=1
// Returns the most recent departure(s) for a route (for real-time display)
async function getLatestDepartures(route: string, limit: number = 1): Promise<APIGatewayProxyResult> {
  const now = new Date();
  // Look back 2 hours max - covers longest crossing time plus buffer
  const startDate = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  const result = await docClient.send(new QueryCommand({
    TableName: DEPARTURES_TABLE,
    KeyConditionExpression: '#route = :route AND #ts >= :start',
    ExpressionAttributeNames: {
      '#route': 'route',
      '#ts': 'timestamp',
    },
    ExpressionAttributeValues: {
      ':route': route,
      ':start': startDate.toISOString(),
    },
    ScanIndexForward: false, // Most recent first
    Limit: limit,
  }));

  return response(200, {
    route,
    departures: result.Items || [],
  });
}

// GET /transit-records
async function getTransitRecords(): Promise<APIGatewayProxyResult> {
  const result = await docClient.send(new ScanCommand({
    TableName: TRANSIT_TABLE,
    Limit: 100,
  }));

  // Sort by timestamp descending
  const items = (result.Items || []).sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return response(200, { records: items });
}

// POST /transit-records
async function createTransitRecord(body: string): Promise<APIGatewayProxyResult> {
  const data = JSON.parse(body);

  const item = {
    id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    route: data.route,
    vehicle: data.vehicle,
    durationSeconds: data.durationSeconds,
    timestamp: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({
    TableName: TRANSIT_TABLE,
    Item: item,
  }));

  return response(201, item);
}

// DELETE /transit-records/:id
async function deleteTransitRecord(id: string): Promise<APIGatewayProxyResult> {
  await docClient.send(new DeleteCommand({
    TableName: TRANSIT_TABLE,
    Key: { id },
  }));

  return response(200, { deleted: id });
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Request:', event.httpMethod, event.path, event.queryStringParameters);

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return response(200, {});
    }

    const path = event.path;
    const method = event.httpMethod;
    const query = event.queryStringParameters || {};

    // Trends endpoints
    if (path === '/trends' && method === 'GET') {
      const route = query.route;
      const date = query.date || new Date().toISOString().split('T')[0];
      if (!route) return response(400, { error: 'route parameter required' });
      return getTrends(route, date);
    }

    if (path === '/trends/recent' && method === 'GET') {
      const route = query.route;
      const days = parseInt(query.days || '7', 10);
      if (!route) return response(400, { error: 'route parameter required' });
      return getRecentTrends(route, days);
    }

    if (path === '/trends/latest' && method === 'GET') {
      const route = query.route;
      const limit = parseInt(query.limit || '1', 10);
      if (!route) return response(400, { error: 'route parameter required' });
      return getLatestDepartures(route, limit);
    }

    // Transit records endpoints
    if (path === '/transit-records' && method === 'GET') {
      return getTransitRecords();
    }

    if (path === '/transit-records' && method === 'POST') {
      if (!event.body) return response(400, { error: 'body required' });
      return createTransitRecord(event.body);
    }

    if (path.startsWith('/transit-records/') && method === 'DELETE') {
      const id = path.split('/').pop();
      if (!id) return response(400, { error: 'id required' });
      return deleteTransitRecord(id);
    }

    return response(404, { error: 'Not found' });

  } catch (error) {
    console.error('Handler error:', error);
    return response(500, { error: 'Internal server error' });
  }
}
