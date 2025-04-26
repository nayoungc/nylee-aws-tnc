// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  CourseCatalog: a
    .model({
      id: a.id().required(),
      title: a.string().required(),
      awsCode: a.string(),
      version: a.string(),
      durations: a.integer(),
      level: a.string(),
      description: a.string(),
      category: a.string(),
      // 1. 배열 필드 정의는 다음과 같이 합니다:
      tags: a.string().array(),         // 올바른 문법: .array() 수정자 사용
      prerequisites: a.string().array(), // 올바른 문법: .array() 수정자 사용
      objectives: a.string().array(),    // 올바른 문법: .array() 수정자 사용
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