// amplify/data/resource.ts
import { defineData } from '@aws-amplify/backend';
import { courseCatalogSchema } from './schemas/courseCatalog';
import { moduleSchema } from './schemas/modules';
import { labSchema } from './schemas/labs';
import { courseSchema } from './schemas/courses';
import { customerSchema } from './schemas/customer'; 
import { a } from '@aws-amplify/backend';

// 모든 스키마 합치기
const schema = a.schema({
  ...courseCatalogSchema,
  ...modulesSchema,
  ...labsSchema,
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