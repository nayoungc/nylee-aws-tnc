// src/graphql/instructor/types.ts
import { InstructorStatus } from '@/models/instructor';

/**
 * API에서 반환되는 강사 타입
 */
export interface ApiInstructor {
  id: string;
  email: string;
  name: string;
  profile?: string;
  status?: InstructorStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * 페이지네이션을 위한 연결 타입
 */
export interface InstructorConnection {
  items: ApiInstructor[];
  nextToken?: string | null;
}

/**
 * 강사 목록 조회 쿼리 결과 타입
 */
export interface ListInstructorsResult {
  listInstructors: InstructorConnection;
}

/**
 * 단일 강사 조회 쿼리 결과 타입
 */
export interface GetInstructorResult {
  getInstructor: ApiInstructor | null;
}

/**
 * 강사 검색 쿼리 결과 타입 - API가 없으므로 listInstructors에 필터를 적용하여 사용
 */
export interface SearchInstructorsResult {
  listInstructors: InstructorConnection;
}

/**
 * 강사 생성 뮤테이션 결과 타입
 */
export interface CreateInstructorResult {
  createInstructor: ApiInstructor;
}

/**
 * 강사 업데이트 뮤테이션 결과 타입
 */
export interface UpdateInstructorResult {
  updateInstructor: ApiInstructor;
}

/**
 * 강사 상태 변경 뮤테이션 결과 타입
 */
export interface ChangeInstructorStatusResult {
  changeInstructorStatus: {
    id: string;
    status: InstructorStatus;
    updatedAt: string;
  };
}

/**
 * 강사 필터 타입 (API에서 사용)
 */
export interface ModelInstructorFilterInput {
  status?: InstructorStatus;
  name?: {
    contains?: string;
  };
  email?: {
    contains?: string;
  };
  profile?: {
    contains?: string;
  };
  and?: ModelInstructorFilterInput[];
  or?: ModelInstructorFilterInput[];
}