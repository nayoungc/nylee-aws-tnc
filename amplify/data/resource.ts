import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  // 과정 카탈로그 모델
  TncCourseCatalog: a
    .model({
      id: a.id(), 
      course_id: a.string().required(), // AWS-GOE와 같은 고유 코스 ID
      course_name: a.string().required(),
      level: a.string(),
      duration: a.string(),
      delivery_method: a.string(),
      description: a.string(),
      objectives: a.string().array(), // 문자열 배열
      target_audience: a.string().array(), // 문자열 배열
    })
    .authorization(allow => [allow.authenticated()]),

  // 고객사 모델 - 단순 구조
  TncCustomer: a
    .model({
      id: a.id(),
      name: a.string().required()
    })
    .authorization(allow => [allow.authenticated()]),

  // 강사 모델
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