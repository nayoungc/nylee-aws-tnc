// src/graphql/types.ts
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