// src/graphql/courseSurvey/types.d.ts
import { CourseSurvey } from '@/models/courseSurvey';

// 쿼리 결과 타입
export interface ListCourseSurveysResult {
  listCourseSurveys: {
    items: CourseSurvey[];
    nextToken?: string | null;
  };
}

export interface GetCourseSurveyResult {
  getCourseSurvey: CourseSurvey | null;
}

export interface GetCourseSurveysByCourseIdResult {
  getCourseSurveysByCourseId: {
    items: CourseSurvey[];
    nextToken?: string | null;
  };
}

export interface GetActiveCourseSurveysResult {
  getActiveCourseSurveys: {
    items: CourseSurvey[];
    nextToken?: string | null;
  };
}

// 뮤테이션 결과 타입
export interface CreateCourseSurveyResult {
  createCourseSurvey: CourseSurvey;
}

export interface UpdateCourseSurveyResult {
  updateCourseSurvey: CourseSurvey;
}

export interface DeleteCourseSurveyResult {
  deleteCourseSurvey: {
    courseSurveyId: string;
  };
}

export interface ActivateCourseSurveyResult {
  activateCourseSurvey: {
    courseSurveyId: string;
    isActive: boolean;
  };
}

// 필터 타입
export interface ModelCourseSurveyFilterInput {
  courseSurveyId?: ModelIDInput;
  courseId?: ModelIDInput;
  surveyCatalogId?: ModelIDInput;
  isActive?: ModelBooleanInput;
  startDate?: ModelStringInput;
  endDate?: ModelStringInput;
  and?: ModelCourseSurveyFilterInput[];
  or?: ModelCourseSurveyFilterInput[];
  not?: ModelCourseSurveyFilterInput;
}

// 기본 필터 타입
interface ModelIDInput {
  ne?: string;
  eq?: string;
  le?: string;
  lt?: string;
  ge?: string;
  gt?: string;
  contains?: string;
  notContains?: string;
  between?: [string, string];
  beginsWith?: string;
}

interface ModelStringInput {
  ne?: string;
  eq?: string;
  le?: string;
  lt?: string;
  ge?: string;
  gt?: string;
  contains?: string;
  notContains?: string;
  between?: [string, string];
  beginsWith?: string;
  attributeExists?: boolean;
  attributeType?: string;
  size?: ModelSizeInput;
}

interface ModelBooleanInput {
  ne?: boolean;
  eq?: boolean;
  attributeExists?: boolean;
  attributeType?: string;
}

interface ModelSizeInput {
  ne?: number;
  eq?: number;
  le?: number;
  lt?: number;
  ge?: number;
  gt?: number;
  between?: [number, number];
}