// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  CourseCatalog: a
    .model({
      catalogId: a.id().required(),
      version: a.string().required(),
      title: a.string().required(),
      awsCode: a.string(),
      description: a.string(),
      category: a.string(),
      level: a.string(),
      duration: a.string(),
      status: a.string(),
      objectives: a.array(a.string()),
      targetAudience: a.array(a.string()),
      prerequisites: a.array(a.string()),
      deliveryMethod: a.string()
    })
    .authorization(allow => [
      allow.public().to(['read']),
      allow.authenticated().to(['read', 'create', 'update', 'delete']),
    ])
    .primaryKey(keys => keys.partition('catalogId').sort('version'))
    // 글로벌 보조 인덱스 정의
    .index('byTitle', keys => keys.partition('title').sort('version'))
    .index('byAwsCode', keys => keys.partition('awsCode').sort('version'))
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    // API 키 설정 (필요시)
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
