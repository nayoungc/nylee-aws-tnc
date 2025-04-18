import { defineBackend } from '@aws-amplify/backend';
import { auth } from '../auth/resource';
import { data } from './data';
import { functions } from './function';
import { storage } from './storage';

export const backend = defineBackend({
  auth,
  data,
  functions,
  storage,
  // 환경 변수
  environmentVariables: {
    SYSTEM_NAME: 'TnC-Assessment-System',
    RESOURCE_PREFIX: 'TnC',
  },
});

// // amplify/backend.ts
// import { defineBackend } from '@aws-amplify/backend';
// import { auth } from './auth/resource';
// import { data } from './data/resource';
// import { storage } from './storage/resource';
// import { websocketConnectFunction } from './functions/websocketConnect/resource';
// import { websocketDisconnectFunction } from './functions/websocketDisconnect/resource';
// import { websocketDefaultFunction } from './functions/websocketDefault/resource';
// import { websocketMessageFunction } from './functions/websocketMessage/resource';
// import { createWebSocketApi } from './custom/websocketApi';
// import { CfnOutput, Stack } from 'aws-cdk-lib';

// // 백엔드 정의
// const backend = defineBackend({
//   auth,
//   data,
//   storage,
//   websocketConnectFunction,
//   websocketDisconnectFunction,
//   websocketDefaultFunction,
//   websocketMessageFunction,
// });

// // CDK 확장을 사용하여 WebSocket API 생성
// backend.extends((stack: Stack) => {
//   const webSocketApiEndpoint = createWebSocketApi(
//     stack,
//     websocketConnectFunction.node.defaultChild as any,
//     websocketDisconnectFunction.node.defaultChild as any,
//     websocketDefaultFunction.node.defaultChild as any,
//     websocketMessageFunction.node.defaultChild as any
//   );
  
//   // WebSocket API 엔드포인트를 출력으로 추가
//   new CfnOutput(stack, 'WebSocketApiEndpoint', {
//     value: webSocketApiEndpoint,
//     description: 'WebSocket API Endpoint',
//     exportName: 'TnCWebSocketApiEndpoint',
//   });
// });