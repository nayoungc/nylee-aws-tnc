// amplify/data/resource.ts
// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  CourseCatalog: a
    .model({
      // id가 기본 키가 되며 a.id()를 사용
      id: a.id().required(),
      title: a.string().required(),
      awsCode: a.string(),
      version: a.string(),
      durations: a.integer(),
      level: a.string(),
      description: a.string(),
      category: a.string(),
      tags: a.list(a.string()),        // a.array() → a.list() 로 변경
      prerequisites: a.list(a.string()), // a.array() → a.list() 로 변경
      objectives: a.list(a.string()),    // a.array() → a.list() 로 변경
      status: a.enum(['active', 'draft', 'archived']),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      createdBy: a.string()
    })
    .authorization(allow => [allow.publicApiKey()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30
    }
  }
});