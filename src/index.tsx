// src/index.tsx
import { Amplify } from 'aws-amplify';
import config from './amplifyconfiguration.json';  // 이 파일명 사용

Amplify.configure(config);