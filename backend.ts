// backend.ts (프로젝트 루트에 생성)
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './backend/auth/resource';
import { api } from './backend/api/resource';
import { storage } from './backend/storage/resource';

const backend = defineBackend({
  auth,
  api,
  storage
  // 필요한 다른 리소스들...
});
