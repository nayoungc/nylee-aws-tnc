// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { courseCatalogSchema } from './models/courseCatalog';
import { courseModuleSchema } from './models/courseModule';
import { courseLabSchema } from './models/courseLab';
import { courseMaterialSchema } from './models/courseMaterial';
import { customerSchema } from './models/customer';

// 모든 스키마 통합
const schema = a.schema({
  ...courseCatalogSchema.models,
  ...courseModuleSchema.models,
  ...courseLabSchema.models,
  ...courseMaterialSchema.models,
  ...customerSchema.models
})
.authorization((allow) => [
  allow.authenticated().to(['read']), 
  allow.group('Admin').to(['create', 'read', 'update', 'delete']),
  allow.owner().to(['read', 'create', 'update', 'delete'])
]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  }
});