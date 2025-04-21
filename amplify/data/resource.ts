// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { courseCatalogSchema } from './models/courseCatalog';
import { courseCatalogModuleSchema } from './models/courseCatalogModule';
import { courseCatalogLabSchema } from './models/courseCatalogLab';
import { courseCatalogMaterialSchema } from './models/courseCatalogMaterial';
import { courseCatalogQuestionSchema } from './models/courseCatalogQuestion'; 
import { courseSchema } from './models/course';
import { customerSchema } from './models/customer';
import { userQuizSchema } from './models/userQuiz';
import { userResponseSchema } from './models/userResponse';
import { userSurveySchema } from './models/userSurvey';
import { userSurveyResponseSchema } from './models/userSurveyResponse';
import { surveyAnalyticsSchema } from './models/surveyAnalytics';
import { dashboardMetricSchema } from './models/dashboardMetric';

// 모든 모델 합치기 (관계 설정 부분 제거)
const schema = a.schema({
  ...courseCatalogSchema.models,
  ...courseCatalogModuleSchema.models,
  ...courseCatalogLabSchema.models,
  ...courseCatalogMaterialSchema.models,
  ...courseCatalogQuestionSchema.models,
  ...courseSchema.models,
  ...customerSchema.models,
  ...userQuizSchema.models,
  ...userResponseSchema.models,
  ...userSurveySchema.models,
  ...userSurveyResponseSchema.models,
  ...surveyAnalyticsSchema.models,
  ...dashboardMetricSchema.models
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