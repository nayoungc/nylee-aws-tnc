// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // CourseCatalog 모델
  CourseCatalog: a
    .model({
      id: a.id(),
      title: a.string().required(),
      description: a.string(),
      duration: a.integer(),
      level: a.string(),
      delivery_method: a.string(),
      objectives: a.string(),
      target_audience: a.string()
    })
    .authorization(allow => [allow.authenticated()]),

  // Customer 모델
  Customer: a
    .model({
      id: a.id(),
      name: a.string().required()
    })
    .authorization(allow => [allow.authenticated()]),

  // Instructor 모델
  Instructor: a
    .model({
      id: a.id(),
      name: a.string().required(),
      email: a.string().required(),
      status: a.string(),
      profile: a.string(),
      cognitoId: a.string()
    })
    .authorization(allow => [allow.authenticated()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});