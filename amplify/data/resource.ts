// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

// 코스 카탈로그 모델 정의 (간소화됨)
const schema = a.schema({
  CourseCatalog: a
    .model({
      courseId: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      instructor: a.string(),
      category: a.string(),
      duration: a.integer(),
      level: a.string(),
      tags: a.string(), // 태그를 단일 문자열로 저장 (JSON 형식으로 저장 가능)
      thumbnail: a.string(),
      status: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      // 인증된 사용자에게 모든 권한 부여 (간단하게)
      allow.authenticated(),
      
      // 또는 공개 API 키 접근 허용 (Todo 예제처럼)
      // allow.publicApiKey()
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API 키 사용하려면 아래 주석 해제
    // apiKeyAuthorizationMode: {
    //   expiresInDays: 30,
    // },
  },
});