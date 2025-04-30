import { Survey } from '@/models/survey';

// GraphQL API 응답 타입들
export interface ApiSurvey extends Omit<Survey, 'metadata' | 'questionItems'> {
  metadata?: Record<string, any>;
  questionItems: Array<{
    id: string;
    text: string;
    type: string;
    options?: string[] | null;
    required: boolean;
    order?: number | null;
    metadata?: Record<string, any> | null;
  }>;
}

export interface ListSurveysApiResult {
  listSurveys?: {
    items: ApiSurvey[];
    nextToken?: string | null;
  };
  getSurveysByCatalog?: {
    items: ApiSurvey[];
    nextToken?: string | null;
  };
  getSurveysByCourse?: {
    items: ApiSurvey[];
    nextToken?: string | null;
  };
}

export interface GetSurveyResult {
  getSurvey?: ApiSurvey;
}

export interface CreateSurveyResult {
  createSurvey: ApiSurvey;
}

export interface UpdateSurveyResult {
  updateSurvey?: ApiSurvey;
  updateSurveyStatus?: ApiSurvey;
}

export interface SendRemindersResult {
  sendSurveyReminders: {
    instanceId: string;
    sentCount: number;
  };
}

// API 입력 타입
export type CreateSurveyApiInput = {
  surveyCatalogId: string;
  title: string;
  description?: string | null;
  status: string;
  deployOption: string;
  deployWhen?: string | null;
  startDate: string;
  endDate: string;
  courseId?: string | null;
  courseName?: string | null;
  totalParticipants?: number | null;
  notifyParticipants?: boolean | null;
  sendReminders?: boolean | null;
  sendReportToAdmin?: boolean | null;
  metadata?: Record<string, any> | null;
  questionItems: Array<{
    text: string;
    type: string;
    options?: string[] | null;
    required: boolean;
    order?: number | null;
    metadata?: Record<string, any> | null;
    id?: string | null;
  }>;
};

export type UpdateSurveyApiInput = {
  instanceId: string;
  title?: string;
  description?: string | null;
  status?: string;
  startDate?: string;
  endDate?: string;
  totalParticipants?: number | null;
  totalResponses?: number | null;
  completionRate?: number | null;
  notifyParticipants?: boolean | null;
  sendReminders?: boolean | null;
  sendReportToAdmin?: boolean | null;
  metadata?: Record<string, any> | null;
  questionItems?: Array<{
    text: string;
    type: string;
    options?: string[] | null;
    required: boolean;
    order?: number | null;
    metadata?: Record<string, any> | null;
    id?: string | null;
  }>;
};

export interface ModelSurveyFilterInput {
  surveyCatalogId?: { eq?: string };
  courseId?: { eq?: string };
  status?: { eq?: string };
  startDate?: { ge?: string; le?: string };
  endDate?: { ge?: string; le?: string };
}