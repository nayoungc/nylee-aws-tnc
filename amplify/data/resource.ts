// amplify/data/resource.ts
import { defineData } from '@aws-amplify/backend';
import { courseCatalogSchema } from './schemas/courseCatalog';
import { moduleSchema } from './schemas/module';
import { labSchema } from './schemas/lab';
import { courseSchema } from './schemas/course';
import { customerSchema } from './schemas/customer'; 
import { a } from '@aws-amplify/backend';

// 모든 스키마 합치기
const schema = a.schema({
  ...courseCatalogSchema,
  ...moduleSchema,
  ...labSchema,
  ...courseSchema,
  ...customerSchema
});

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});