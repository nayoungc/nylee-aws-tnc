import { defineBackend } from '@aws-amplify/backend';
import { auth } from './backend/auth/resource';
import { data } from './backend/api/resource';
import { storage } from './backend/storage/resource';

const backend = defineBackend({
  auth,
  data,
  storage
});
