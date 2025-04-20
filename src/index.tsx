// src/index.tsx
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

// 모든 설정을 한 번에 적용
Amplify.configure(awsExports);

// 개발 환경에서만 로깅 (선택 사항)
if (process.env.NODE_ENV !== 'production') {
  console.log('Amplify 설정 완료');
}