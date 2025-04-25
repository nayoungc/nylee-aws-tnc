import { a } from '@aws-amplify/backend';

// 기존 DynamoDB 테이블을 모델로 정의
export const schema = a.schema({
  // CourseCatalog
  CourseCatalog: a.model({
    catalogId: a.id().required(),
    title: a.string().required(),
    version: a.string().required(),
    awsCode: a.string(),
    description: a.string(),
    hours: a.number(),
    level: a.string()
  }).authorization((allow) => [
    allow.authenticated().to(['read']),
    allow.admin().to(['create', 'update', 'delete'])
  ]),

  // CourseModule
  CourseModule: a.model({
    catalogId: a.id().required(),
    moduleNumber: a.string().required(),
    moduleId: a.string().required(),
    title: a.string(),
    description: a.string(),
    duration: a.string(),
    objectives: a.array(a.string()),
    order: a.number()
  }).authorization((allow) => [
    allow.authenticated().to(['read']),
    allow.admin().to(['create', 'update', 'delete'])
  ]),

  // 나머지 모델도 동일한 방식으로 정의
  // CourseLab, CourseMaterial, CourseQuiz, CourseQuestion, Course, Customer, UserQuiz, 
  // UserResponse, UserSurvey, UserSurveyResponse, SurveyAnalytic, DashboardMetric
  
  // 예시로 몇 개만 더 추가
  CourseLab: a.model({
    catalogId: a.id().required(),
    labId: a.string().required(),
    moduleId: a.string().required(),
    labNumber: a.string().required(),
    title: a.string(),
    description: a.string(),
    duration: a.string(),
    difficulty: a.string(),
    instructions: a.string()
  }).authorization((allow) => [
    allow.authenticated().to(['read']),
    allow.admin().to(['create', 'update', 'delete'])
  ]),

  Course: a.model({
    courseId: a.id().required(),
    startDate: a.string().required(),
    catalogId: a.string().required(),
    shareCode: a.string().required(),
    instructor: a.string().required(),
    customerId: a.string().required(),
    endDate: a.string(),
    location: a.string(),
    maxStudents: a.number(),
    currentStudents: a.number(),
    status: a.string()
  }).authorization((allow) => [
    allow.authenticated().to(['read']),
    allow.admin().to(['create', 'update', 'delete'])
  ]),

  Customer: a.model({
    customerId: a.id().required(),
    customerName: a.string().required(),
    contactEmail: a.string(),
    contactPhone: a.string(),
    address: a.string(),
    industry: a.string(),
    notes: a.string()
  }).authorization((allow) => [
    allow.authenticated().to(['read']),
    allow.admin().to(['create', 'update', 'delete'])
  ])
});
