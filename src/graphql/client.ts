// src/graphql/client.ts
import { generateClient } from 'aws-amplify/api';

// ==================== 타입 정의 ====================

// CourseCatalog 모델
export interface CourseCatalog {
  catalogId: string;
  version: string;
  title: string;
  course_name?: string; // UI 호환성을 위한 필드
  awsCode?: string;
  description?: string;
  level?: string;
  duration?: number;
  price?: number;
  currency?: string;
  isPublished: boolean;
  publishedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // UI용 추가 필드
  status?: string;
  category?: string;
  deliveryMethod?: string;
  objectives?: string[];
  targetAudience?: string[];
}

// Course 모델
export interface Course {
  courseId: string;
  startDate: string;
  catalogId: string; 
  version?: string;
  title: string;
  description?: string;
  endDate?: string;
  status: string;
  shareCode?: string;
  instructor?: string;
  customerId: string;
  customerName?: string;
  maxSeats?: number;
  currentSeats?: number;
  location?: string;
  isVirtual?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// CourseCatalogModule 모델
export interface CourseCatalogModule {
  catalogId: string;
  moduleNumber: string;
  moduleId: string;
  title: string;
  description?: string;
  duration?: number;
  order: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// CourseCatalogLab 모델
export interface CourseCatalogLab {
  catalogId: string;
  labId: string;
  moduleId: string;
  labNumber: string;
  title: string;
  description?: string;
  content?: string;
  duration?: number;
  order: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// CourseCatalogMaterial 모델
export interface CourseCatalogMaterial {
  catalogId: string;
  materialTypeId: string;
  moduleId: string;
  materialType: string;
  title: string;
  description?: string;
  url?: string;
  fileSize?: number;
  fileType?: string;
  createdAt?: string;
  updatedAt?: string;
}

// CourseCatalogQuestion 모델
export interface CourseCatalogQuestion {
  quizId: string;
  questionNumber: string;
  catalogId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Customer 모델
export interface Customer {
  customerId: string;
  customerName: string;
  email?: string;
  phone?: string;
  address?: string;
  organizationName?: string;
  organizationSize?: number;
  industry?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Assessment 모델
export interface Assessment {
  id: string;
  type: string;
  title: string;
  description?: string;
  courseId?: string;
  catalogId?: string;
  status: string;
  questionCount: number;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// UserQuiz 모델
export interface UserQuiz {
  userId: string;
  courseId_quizType_quizId: string;
  courseId: string;
  quizType: string;
  quizId: string;
  completionTime?: string;
  score?: number;
  status: string;
  timeSpent?: number;
  startTime?: string;
  endTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

// UserResponse 모델
export interface UserResponse {
  userId_courseId_quizId: string;
  questionNumber_attemptNumber: string;
  quizId: string;
  questionNumber: string;
  courseId: string;
  userId: string;
  attemptNumber: number;
  selectedAnswer?: string;
  isCorrect: string;
  timeSpent?: number;
  createdAt?: string;
  updatedAt?: string;
}

// UserSurvey 모델
export interface UserSurvey {
  randomId: string;
  courseId_surveyType_surveyId: string;
  courseId: string;
  surveyType: string;
  surveyId: string;
  completionTime?: string;
  comments?: string;
  createdAt?: string;
  updatedAt?: string;
}

// UserSurveyResponse 모델
export interface UserSurveyResponse {
  randomId_courseId_surveyId: string;
  questionNumber: string;
  surveyId: string;
  courseId: string;
  randomId: string;
  questionText: string;
  responseType: string;
  responseValue?: string;
  responseText?: string;
  createdAt?: string;
  updatedAt?: string;
}

// SurveyAnalytics 모델
export interface SurveyAnalytics {
  surveyId: string;
  courseId: string;
  totalResponses: number;
  averageRating?: number;
  questionBreakdown?: string;
  keyInsights?: string[];
  updatedAt: string;
  createdAt?: string;
}

// DashboardMetric 모델
export interface DashboardMetric {
  metricType: string;
  timeFrame_entityId: string;
  entityId: string;
  timeFrame: string;
  metricValue: number;
  additionalData?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 모든 모델 타입을 포함한 스키마 타입 (실제 모델 이름은 백엔드에서 정의된 대로 사용)
export type Schema = {
  models: {
    CourseCatalog: {
      list: (options?: any) => Promise<{data: CourseCatalog[], errors?: any[]}>;
      get: (key: {catalogId: string, version?: string}) => Promise<{data: CourseCatalog, errors?: any[]}>;
    };
    Course: {
      list: (options?: any) => Promise<{data: Course[], errors?: any[]}>;
      get: (key: {courseId: string, startDate?: string}) => Promise<{data: Course, errors?: any[]}>;
      create: (input: Partial<Course>) => Promise<{data: Course, errors?: any[]}>;
      update: (input: Partial<Course>) => Promise<{data: Course, errors?: any[]}>;
      delete: (key: {courseId: string, startDate?: string}) => Promise<{data: Course, errors?: any[]}>;
    };
    CourseCatalogModule: {
      list: (options?: any) => Promise<{data: CourseCatalogModule[], errors?: any[]}>;
      get: (key: {catalogId: string, moduleNumber: string}) => Promise<{data: CourseCatalogModule, errors?: any[]}>;
      create: (input: Partial<CourseCatalogModule>) => Promise<{data: CourseCatalogModule, errors?: any[]}>;
      update: (input: Partial<CourseCatalogModule>) => Promise<{data: CourseCatalogModule, errors?: any[]}>;
      delete: (key: {catalogId: string, moduleNumber: string}) => Promise<{data: CourseCatalogModule, errors?: any[]}>;
    };
    CourseCatalogLab: {
      list: (options?: any) => Promise<{data: CourseCatalogLab[], errors?: any[]}>;
      get: (key: {catalogId: string, labId: string}) => Promise<{data: CourseCatalogLab, errors?: any[]}>;
      create: (input: Partial<CourseCatalogLab>) => Promise<{data: CourseCatalogLab, errors?: any[]}>;
      update: (input: Partial<CourseCatalogLab>) => Promise<{data: CourseCatalogLab, errors?: any[]}>;
      delete: (key: {catalogId: string, labId: string}) => Promise<{data: CourseCatalogLab, errors?: any[]}>;
    };
    CourseCatalogMaterial: {
      list: (options?: any) => Promise<{data: CourseCatalogMaterial[], errors?: any[]}>;
      get: (key: {catalogId: string, materialTypeId: string}) => Promise<{data: CourseCatalogMaterial, errors?: any[]}>;
      create: (input: Partial<CourseCatalogMaterial>) => Promise<{data: CourseCatalogMaterial, errors?: any[]}>;
      update: (input: Partial<CourseCatalogMaterial>) => Promise<{data: CourseCatalogMaterial, errors?: any[]}>;
      delete: (key: {catalogId: string, materialTypeId: string}) => Promise<{data: CourseCatalogMaterial, errors?: any[]}>;
    };
    CourseCatalogQuestion: {
      list: (options?: any) => Promise<{data: CourseCatalogQuestion[], errors?: any[]}>;
      get: (key: {quizId: string, questionNumber: string}) => Promise<{data: CourseCatalogQuestion, errors?: any[]}>;
      create: (input: Partial<CourseCatalogQuestion>) => Promise<{data: CourseCatalogQuestion, errors?: any[]}>;
      update: (input: Partial<CourseCatalogQuestion>) => Promise<{data: CourseCatalogQuestion, errors?: any[]}>;
      delete: (key: {quizId: string, questionNumber: string}) => Promise<{data: CourseCatalogQuestion, errors?: any[]}>;
    };
    Customer: {
      list: (options?: any) => Promise<{data: Customer[], errors?: any[]}>;
      get: (key: {customerId: string}) => Promise<{data: Customer, errors?: any[]}>;
      create: (input: Partial<Customer>) => Promise<{data: Customer, errors?: any[]}>;
      update: (input: Partial<Customer>) => Promise<{data: Customer, errors?: any[]}>;
      delete: (key: {customerId: string}) => Promise<{data: Customer, errors?: any[]}>;
    };
    UserQuiz: {
      list: (options?: any) => Promise<{data: UserQuiz[], errors?: any[]}>;
      get: (key: {userId: string, courseId_quizType_quizId: string}) => Promise<{data: UserQuiz, errors?: any[]}>;
      create: (input: Partial<UserQuiz>) => Promise<{data: UserQuiz, errors?: any[]}>;
      update: (input: Partial<UserQuiz>) => Promise<{data: UserQuiz, errors?: any[]}>;
      delete: (key: {userId: string, courseId_quizType_quizId: string}) => Promise<{data: UserQuiz, errors?: any[]}>;
    };
    UserResponse: {
      list: (options?: any) => Promise<{data: UserResponse[], errors?: any[]}>;
      get: (key: {userId_courseId_quizId: string, questionNumber_attemptNumber: string}) => Promise<{data: UserResponse, errors?: any[]}>;
      create: (input: Partial<UserResponse>) => Promise<{data: UserResponse, errors?: any[]}>;
      update: (input: Partial<UserResponse>) => Promise<{data: UserResponse, errors?: any[]}>;
      delete: (key: {userId_courseId_quizId: string, questionNumber_attemptNumber: string}) => Promise<{data: UserResponse, errors?: any[]}>;
    };
    UserSurvey: {
      list: (options?: any) => Promise<{data: UserSurvey[], errors?: any[]}>;
      get: (key: {randomId: string, courseId_surveyType_surveyId: string}) => Promise<{data: UserSurvey, errors?: any[]}>;
      create: (input: Partial<UserSurvey>) => Promise<{data: UserSurvey, errors?: any[]}>;
      update: (input: Partial<UserSurvey>) => Promise<{data: UserSurvey, errors?: any[]}>;
      delete: (key: {randomId: string, courseId_surveyType_surveyId: string}) => Promise<{data: UserSurvey, errors?: any[]}>;
    };
    UserSurveyResponse: {
      list: (options?: any) => Promise<{data: UserSurveyResponse[], errors?: any[]}>;
      get: (key: {randomId_courseId_surveyId: string, questionNumber: string}) => Promise<{data: UserSurveyResponse, errors?: any[]}>;
      create: (input: Partial<UserSurveyResponse>) => Promise<{data: UserSurveyResponse, errors?: any[]}>;
      update: (input: Partial<UserSurveyResponse>) => Promise<{data: UserSurveyResponse, errors?: any[]}>;
      delete: (key: {randomId_courseId_surveyId: string, questionNumber: string}) => Promise<{data: UserSurveyResponse, errors?: any[]}>;
    };
    SurveyAnalytics: {
      list: (options?: any) => Promise<{data: SurveyAnalytics[], errors?: any[]}>;
      get: (key: {surveyId: string, courseId: string}) => Promise<{data: SurveyAnalytics, errors?: any[]}>;
      create: (input: Partial<SurveyAnalytics>) => Promise<{data: SurveyAnalytics, errors?: any[]}>;
      update: (input: Partial<SurveyAnalytics>) => Promise<{data: SurveyAnalytics, errors?: any[]}>;
      delete: (key: {surveyId: string, courseId: string}) => Promise<{data: SurveyAnalytics, errors?: any[]}>;
    };
    DashboardMetric: {
      list: (options?: any) => Promise<{data: DashboardMetric[], errors?: any[]}>;
      get: (key: {metricType: string, timeFrame_entityId: string}) => Promise<{data: DashboardMetric, errors?: any[]}>;
      create: (input: Partial<DashboardMetric>) => Promise<{data: DashboardMetric, errors?: any[]}>;
      update: (input: Partial<DashboardMetric>) => Promise<{data: DashboardMetric, errors?: any[]}>;
      delete: (key: {metricType: string, timeFrame_entityId: string}) => Promise<{data: DashboardMetric, errors?: any[]}>;
    };
  };
};

// ==================== 클라이언트 생성 ====================

// 타입 오류 방지를 위해 any 타입으로 클라이언트 생성
export const client = generateClient() as any;

// 실제 모델 이름 검색용 헬퍼 함수 (개발 시 사용)
export function logAvailableModels() {
  console.log('Available models:', Object.keys(client.models));
  return Object.keys(client.models);
}

// ==================== 타입 안전한 래퍼 함수들 ====================

// CourseCatalog 관련 함수
export async function listCourseCatalogs(options?: any) {
  try {
    return await client.models.CourseCatalog.list(options);
  } catch (error) {
    console.error('Error listing course catalogs:', error);
    throw error;
  }
}

export async function getCourseCatalog(catalogId: string, version: string = 'v1') {
  try {
    return await client.models.CourseCatalog.get({ catalogId, version });
  } catch (error) {
    console.error('Error getting course catalog:', error);
    throw error;
  }
}

// Course 관련 함수
export async function listCourses(options?: any) {
  try {
    return await client.models.Course.list(options);
  } catch (error) {
    console.error('Error listing courses:', error);
    throw error;
  }
}

export async function getCourse(courseId: string, startDate?: string) {
  try {
    return await client.models.Course.get({ courseId, startDate });
  } catch (error) {
    console.error('Error getting course:', error);
    throw error;
  }
}

export async function createCourse(courseData: Partial<Course>) {
  try {
    return await client.models.Course.create(courseData);
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
}

export async function updateCourse(courseData: Partial<Course>) {
  try {
    return await client.models.Course.update(courseData);
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
}

export async function deleteCourse(courseId: string, startDate: string) {
  try {
    return await client.models.Course.delete({ courseId, startDate });
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
}

// CourseModule 관련 함수
export async function listCourseModules(options?: any) {
  try {
    return await client.models.CourseCatalogModule.list(options);
  } catch (error) {
    console.error('Error listing course modules:', error);
    throw error;
  }
}

export async function getModulesByCatalogId(catalogId: string) {
  try {
    return await client.models.CourseCatalogModule.list({
      filter: { catalogId: { eq: catalogId } }
    });
  } catch (error) {
    console.error('Error getting modules by catalog ID:', error);
    throw error;
  }
}

// CourseLab 관련 함수
export async function listCourseLabs(options?: any) {
  try {
    return await client.models.CourseCatalogLab.list(options);
  } catch (error) {
    console.error('Error listing course labs:', error);
    throw error;
  }
}

export async function getLabsByModuleId(moduleId: string) {
  try {
    return await client.models.CourseCatalogLab.list({
      filter: { moduleId: { eq: moduleId } }
    });
  } catch (error) {
    console.error('Error getting labs by module ID:', error);
    throw error;
  }
}

// CourseMaterial 관련 함수
export async function listCourseMaterials(options?: any) {
  try {
    return await client.models.CourseCatalogMaterial.list(options);
  } catch (error) {
    console.error('Error listing course materials:', error);
    throw error;
  }
}

export async function getMaterialsByModuleId(moduleId: string) {
  try {
    return await client.models.CourseCatalogMaterial.list({
      filter: { moduleId: { eq: moduleId } }
    });
  } catch (error) {
    console.error('Error getting materials by module ID:', error);
    throw error;
  }
}

// Customer 관련 함수
export async function listCustomers(options?: any) {
  try {
    return await client.models.Customer.list(options);
  } catch (error) {
    console.error('Error listing customers:', error);
    throw error;
  }
}

export async function getCustomer(customerId: string) {
  try {
    return await client.models.Customer.get({ customerId });
  } catch (error) {
    console.error('Error getting customer:', error);
    throw error;
  }
}

// Quiz 관련 함수
export async function listQuestionsByQuizId(quizId: string) {
  try {
    return await client.models.CourseCatalogQuestion.list({
      filter: { quizId: { eq: quizId } }
    });
  } catch (error) {
    console.error('Error getting questions by quiz ID:', error);
    throw error;
  }
}

// UserQuiz 및 응답 관련 함수
export async function getUserQuizzesByCourseId(courseId: string, userId: string) {
  try {
    return await client.models.UserQuiz.list({
      filter: { 
        courseId: { eq: courseId },
        userId: { eq: userId }
      }
    });
  } catch (error) {
    console.error('Error getting user quizzes:', error);
    throw error;
  }
}

export async function getUserResponsesByQuizAttempt(userId: string, courseId: string, quizId: string) {
  try {
    const userId_courseId_quizId = `\${userId}#\${courseId}#\${quizId}`;
    return await client.models.UserResponse.list({
      filter: { 
        userId_courseId_quizId: { eq: userId_courseId_quizId }
      }
    });
  } catch (error) {
    console.error('Error getting user responses:', error);
    throw error;
  }
}

// Survey 관련 함수
export async function getUserSurveysByCourseId(courseId: string) {
  try {
    return await client.models.UserSurvey.list({
      filter: { courseId: { eq: courseId } }
    });
  } catch (error) {
    console.error('Error getting user surveys:', error);
    throw error;
  }
}

// 통계 및 분석 관련 함수
export async function getSurveyAnalyticsByCourse(courseId: string) {
  try {
    return await client.models.SurveyAnalytics.list({
      filter: { courseId: { eq: courseId } }
    });
  } catch (error) {
    console.error('Error getting survey analytics:', error);
    throw error;
  }
}

export async function getDashboardMetrics(metricType: string) {
  try {
    return await client.models.DashboardMetric.list({
      filter: { metricType: { eq: metricType } }
    });
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    throw error;
  }
}

// 데이터 변환 함수
export function mapToCourseViewModel(item: any): CourseCatalog {
  return {
    catalogId: item.catalogId || '',
    version: item.version || 'v1',
    title: item.title || '',
    course_name: item.title || '',
    awsCode: item.awsCode,
    description: item.description,
    category: item.category || '',
    level: item.level,
    duration: item.duration,
    price: item.price,
    currency: item.currency,
    isPublished: item.isPublished !== undefined ? item.isPublished : true,
    publishedDate: item.publishedDate,
    deliveryMethod: item.deliveryMethod || '',
    objectives: item.objectives || [],
    targetAudience: item.targetAudience || [],
    status: item.status || 'ACTIVE',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}