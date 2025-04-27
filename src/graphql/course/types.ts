// src/graphql/course/types.ts

import { Course } from '@models/course';

/**
 * 모든 과정 목록 조회 결과 타입
 */
export interface ListCoursesResult {
  listCourses: {
    items: Course[];
    nextToken?: string;
  }
}

/**
 * 특정 과정 조회 결과 타입
 */
export interface GetCourseResult {
  getCourse: Course | null;
}

/**
 * 강사별 과정 조회 결과 타입
 */
export interface GetCoursesByInstructorResult {
  getCoursesByInstructor: {
    items: Course[];
    nextToken?: string;
  }
}

/**
 * 고객사별 과정 조회 결과 타입
 */
export interface GetCoursesByCustomerResult {
  getCoursesByCustomer: {
    items: Course[];
    nextToken?: string;
  }
}

/**
 * 과정 검색 결과 타입
 */
export interface SearchCoursesResult {
  searchCourses: {
    items: Course[];
    nextToken?: string;
  }
}

/**
 * 과정 생성 결과 타입
 */
export interface CreateCourseResult {
  createCourse: Course;
}

/**
 * 과정 수정 결과 타입
 */
export interface UpdateCourseResult {
  updateCourse: Course;
}

/**
 * 과정 삭제 결과 타입
 */
export interface DeleteCourseResult {
  deleteCourse: {
    courseId: string;
  } | null;
}

/**
 * 과정 상태 변경 결과 타입
 */
export interface UpdateCourseStatusResult {
  updateCourseStatus: {
    courseId: string;
    status: string;
    updatedAt: string;
  };
}

/**
 * 과정 필터 입력 타입
 * Amplify/AppSync에서 자동 생성되는 필터 타입
 */
export interface ModelCourseFilterInput {
  courseId?: ModelIDInput;
  startDate?: ModelStringInput;
  catalogId?: ModelStringInput;
  instructor?: ModelStringInput;
  customerId?: ModelStringInput;
  status?: ModelStringInput;
  isAddedToCalendar?: ModelBooleanInput;
  and?: ModelCourseFilterInput[];
  or?: ModelCourseFilterInput[];
  not?: ModelCourseFilterInput;
}

/**
 * 과정 검색 필터 입력 타입
 * 전문 검색에 사용되는 필터
 */
export interface SearchableCourseFilterInput {
  startDateFrom?: string;
  startDateTo?: string;
  status?: string;
  catalogId?: string;
  instructor?: string;
  customerId?: string;
  searchText?: string;
  isAddedToCalendar?: boolean;
}

/**
 * ID 필터 입력 타입
 */
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

/**
 * 문자열 필터 입력 타입
 */
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

/**
 * 불리언 필터 입력 타입
 */
interface ModelBooleanInput {
  ne?: boolean;
  eq?: boolean;
  attributeExists?: boolean;
  attributeType?: string;
}

/**
 * 크기 필터 입력 타입
 */
interface ModelSizeInput {
  ne?: number;
  eq?: number;
  le?: number;
  lt?: number;
  ge?: number;
  gt?: number;
  between?: [number, number];
}
