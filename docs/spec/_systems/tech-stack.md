---
type: l3-system
spec_version: 1
name: tech-stack
discovered_from: code-graph + repo config
resource_count: 16
extractor_version: 1.0.1
renderer_version: 1.0.1
last_audited: 2026-06-23T02:47:38.277Z
---

# Technology stack — System Spec

What this system is built from — frameworks, languages, tooling, and cloud services — detected from dependencies, config files, AWS SDK / CDK imports, and the SAM template.

## Stack

```mermaid
flowchart TB
  subgraph n_cat_AWS_service["AWS service"]
    n_API_Gateway["API Gateway"]
    n_AWS_Lambda["AWS Lambda"]
    n_DynamoDB["DynamoDB"]
    n_EventBridge["EventBridge"]
  end
  subgraph n_cat_Build_deploy["Build / deploy"]
    n_EAS_Expo_Application_Services["EAS (Expo Application Services)"]
  end
  subgraph n_cat_Data_fetching["Data fetching"]
    n_Axios["Axios"]
    n_React_Query["React Query"]
  end
  subgraph n_cat_Frontend_framework["Frontend framework"]
    n_Expo["Expo"]
    n_React_Native["React Native"]
  end
  subgraph n_cat_Frontend_library["Frontend library"]
    n_React["React"]
    n_React_DOM["React DOM"]
  end
  subgraph n_cat_Hosting_CI["Hosting / CI"]
    n_AWS_Amplify["AWS Amplify"]
  end
  subgraph n_cat_IaC["IaC"]
    n_AWS_CDK["AWS CDK"]
  end
  subgraph n_cat_Language["Language"]
    n_TypeScript["TypeScript"]
  end
  subgraph n_cat_Routing["Routing"]
    n_Expo_Router["Expo Router"]
  end
  subgraph n_cat_Testing["Testing"]
    n_Jest["Jest"]
  end
```

## Inventory

| Technology | Category | Detected from |
|---|---|---|
| API Gateway | AWS service | import `aws-cdk-lib/aws-apigateway` |
| AWS Lambda | AWS service | import `aws-cdk-lib/aws-lambda-nodejs`, import `aws-cdk-lib/aws-lambda` |
| DynamoDB | AWS service | import `@aws-sdk/client-dynamodb`, import `@aws-sdk/lib-dynamodb`, import `aws-cdk-lib/aws-dynamodb` |
| EventBridge | AWS service | import `aws-cdk-lib/aws-events-targets`, import `aws-cdk-lib/aws-events` |
| EAS (Expo Application Services) | Build / deploy | `eas.json` |
| Axios | Data fetching | dep `axios` |
| React Query | Data fetching | dep `@tanstack/react-query` |
| Expo | Frontend framework | `app.json`, dep `expo` |
| React Native | Frontend framework | dep `react-native` |
| React | Frontend library | dep `react` |
| React DOM | Frontend library | dep `react-dom` |
| AWS Amplify | Hosting / CI | `amplify.yml` |
| AWS CDK | IaC | dep `aws-cdk-lib`, dep `aws-cdk`, dep `constructs` |
| TypeScript | Language | dep `typescript` |
| Expo Router | Routing | dep `expo-router` |
| Jest | Testing | `jest.config.js`, dep `jest`, dep `ts-jest` |

## Cross-refs

- [`INDEX.md`](../INDEX.md)
