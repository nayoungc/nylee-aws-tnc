// src/index.tsx
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

console.log('Amplify 설정 적용 시작');
Amplify.configure(awsExports);
console.log('Amplify 설정 완료', Amplify.getConfig());