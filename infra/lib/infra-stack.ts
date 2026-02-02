import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as path from 'path';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // WSF API Key from environment or parameter
    const wsfApiKey = new cdk.CfnParameter(this, 'WsfApiKey', {
      type: 'String',
      description: 'Washington State Ferries API Key',
      noEcho: true,
    });

    // DynamoDB Table for ferry departures (trends data)
    const departuresTable = new dynamodb.Table(this, 'FerryDepartures', {
      tableName: 'ferry-departures',
      partitionKey: { name: 'route', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // DynamoDB Table for transit records (timer data)
    const transitTable = new dynamodb.Table(this, 'TransitRecords', {
      tableName: 'transit-records',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Collector Lambda - runs on schedule to fetch WSF data
    const collectorFn = new nodejs.NodejsFunction(this, 'CollectorFunction', {
      functionName: 'ferry-collector',
      entry: path.join(__dirname, '../lambda/collector/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        WSF_API_KEY: wsfApiKey.valueAsString,
        TABLE_NAME: departuresTable.tableName,
      },
    });

    departuresTable.grantReadWriteData(collectorFn);

    // Schedule collector to run every 2 minutes
    new events.Rule(this, 'CollectorSchedule', {
      ruleName: 'ferry-collector-schedule',
      schedule: events.Schedule.rate(cdk.Duration.minutes(2)),
      targets: [new targets.LambdaFunction(collectorFn)],
    });

    // API Lambda - handles REST endpoints
    const apiFn = new nodejs.NodejsFunction(this, 'ApiFunction', {
      functionName: 'ferry-api',
      entry: path.join(__dirname, '../lambda/api/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      environment: {
        DEPARTURES_TABLE: departuresTable.tableName,
        TRANSIT_TABLE: transitTable.tableName,
      },
    });

    departuresTable.grantReadData(apiFn);
    transitTable.grantReadWriteData(apiFn);

    // API Gateway
    const api = new apigateway.RestApi(this, 'FerryApi', {
      restApiName: 'Ferry Tracker API',
      description: 'API for ferry trends and transit records',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type'],
      },
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(apiFn);

    // /trends
    const trends = api.root.addResource('trends');
    trends.addMethod('GET', lambdaIntegration);

    // /trends/recent
    const trendsRecent = trends.addResource('recent');
    trendsRecent.addMethod('GET', lambdaIntegration);

    // /transit-records
    const transitRecords = api.root.addResource('transit-records');
    transitRecords.addMethod('GET', lambdaIntegration);
    transitRecords.addMethod('POST', lambdaIntegration);

    // /transit-records/{id}
    const transitRecord = transitRecords.addResource('{id}');
    transitRecord.addMethod('DELETE', lambdaIntegration);

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'DeparturesTableName', {
      value: departuresTable.tableName,
      description: 'DynamoDB table for departure trends',
    });

    new cdk.CfnOutput(this, 'TransitTableName', {
      value: transitTable.tableName,
      description: 'DynamoDB table for transit records',
    });
  }
}
