import { defineFunction } from '@aws-amplify/backend';
import { Runtime, Architecture } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ai } from './ai';

// 문제 자동 생성 Lambda
export const questionGeneratorFunction = defineFunction({
  name: 'TnC-QuestionGenerator',
  entry: '../functions/generativeAI/src/generativeAI.js',
  handler: 'handler',
  runtime: Runtime.NODEJS_18_X,
  architecture: Architecture.ARM_64,
  memorySize: 1024,
  timeout: 300, // 5분
  logRetention: RetentionDays.ONE_WEEK,
  environment: {
    QUESTIONS_TABLE: 'TnC-Questions',
    BEDROCK_MODEL_ID: ai.bedrockModels.claude,
  }
});

// Bedrock 권한 추가
ai.addBedrockPermissions(questionGeneratorFunction);

// 응답 데이터 분석 Lambda
export const analyticsFunction = defineFunction({
  name: 'TnC-Analytics',
  entry: '../functions/analytics/src/index.js',
  runtime: Runtime.NODEJS_18_X,
  architecture: Architecture.ARM_64,
  memorySize: 512,
  timeout: 180, // 3분
  environment: {
    RESPONSES_TABLE: 'TnC-Responses',
    QUESTIONS_TABLE: 'TnC-Questions',
    REPORTS_BUCKET: 'tnc-reports',
  }
});

// WebSocket 연결 처리 Lambda
export const websocketConnectFunction = defineFunction({
  name: 'TnC-WebSocketConnect',
  entry: '../functions/websocket/src/connect.js',
  runtime: Runtime.NODEJS_18_X,
  memorySize: 256,
  timeout: 15,
});

// WebSocket 메시지 처리 Lambda
export const websocketMessageFunction = defineFunction({
  name: 'TnC-WebSocketMessage',
  entry: '../functions/websocket/src/message.js',
  runtime: Runtime.NODEJS_18_X,
  memorySize: 256,
  timeout: 30,
});

// WebSocket 연결 해제 Lambda
export const websocketDisconnectFunction = defineFunction({
  name: 'TnC-WebSocketDisconnect',
  entry: '../functions/websocket/src/disconnect.js',
  runtime: Runtime.NODEJS_18_X,
  memorySize: 256,
  timeout: 15,
});

// 발음 평가 Lambda (예시로 포함)
export const pronunciationEvaluationFunction = defineFunction({
  name: 'TnC-PronunciationEvaluation',
  entry: '../functions/pronunciationEvaluation/src/pronunciationEvaluation.js',
  runtime: Runtime.NODEJS_18_X,
  memorySize: 512,
  timeout: 60,
});

// 함수 모음 내보내기
export const functions = {
  questionGeneratorFunction,
  analyticsFunction,
  websocketConnectFunction,
  websocketMessageFunction,
  websocketDisconnectFunction,
  pronunciationEvaluationFunction,
};
