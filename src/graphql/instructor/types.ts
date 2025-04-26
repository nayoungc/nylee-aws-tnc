// src/graphql/instructor/types.ts
import { Instructor } from '@/models/instructor';

/**
 * 백엔드 API에서 반환되는 강사 정보 타입
 * 프론트엔드 모델과의 차이를 고려하여 username 필드 제외
 */
export type ApiInstructor = Omit<Instructor, 'username'> & {
  // 백엔드에서 추가로 제공하는 필드가 있다면 여기에 정의
};

/**
 * 강사 목록 조회 쿼리 결과 타입
 * @property {ApiInstructor[]} listInstructors.items - 조회된 강사 목록
 * @property {string | null} listInstructors.nextToken - 페이지네이션 토큰
 */
export interface ListInstructorsResult {
  listInstructors: {
    items: ApiInstructor[];
    nextToken?: string | null;
  };
}

/**
 * 단일 강사 조회 쿼리 결과 타입
 * @property {ApiInstructor | null} getInstructor - 조회된 강사 정보 또는 null
 */
export interface GetInstructorResult {
  getInstructor: ApiInstructor | null;
}

/**
 * 강사 검색 쿼리 결과 타입
 * @property {ApiInstructor[]} searchInstructors.items - 검색된 강사 목록
 * @property {string | null} searchInstructors.nextToken - 페이지네이션 토큰
 */
export interface SearchInstructorsResult {
  searchInstructors: {
    items: ApiInstructor[];
    nextToken?: string | null;
  };
}

/**
 * 강사 생성 뮤테이션 결과 타입
 * @property {ApiInstructor} createInstructor - 생성된 강사 정보
 */
export interface CreateInstructorResult {
  createInstructor: ApiInstructor;
}

/**
 * 강사 업데이트 뮤테이션 결과 타입
 * @property {ApiInstructor} updateInstructor - 업데이트된 강사 정보
 */
export interface UpdateInstructorResult {
  updateInstructor: ApiInstructor;
}

/**
 * 강사 상태 변경 뮤테이션 결과 타입
 * @property {object} changeInstructorStatus - 상태 변경 결과
 * @property {string} changeInstructorStatus.id - 강사 ID
 * @property {string} changeInstructorStatus.status - 변경된 상태
 * @property {string} changeInstructorStatus.updatedAt - 업데이트 시간
 */
export interface ChangeInstructorStatusResult {
  changeInstructorStatus: {
    id: string;
    status: string;
    updatedAt: string;
  };
}

/**
 * AWS AppSync 표준 강사 필터 입력 타입
 * DynamoDB 쿼리와 호환되는 필터 구조
 */
export interface ModelInstructorFilterInput {
  /** ID 필터 조건 */
  id?: ModelStringInput;
  /** 이메일 필터 조건 */
  email?: ModelStringInput;
  /** 이름 필터 조건 */
  name?: ModelStringInput;
  /** 상태 필터 조건 */
  status?: ModelStringInput;
  /** AND 조건 (모든 조건을 충족해야 함) */
  and?: ModelInstructorFilterInput[];
  /** OR 조건 (하나 이상의 조건을 충족해야 함) */
  or?: ModelInstructorFilterInput[];
  /** NOT 조건 (조건과 일치하지 않아야 함) */
  not?: ModelInstructorFilterInput;
}

/**
 * 문자열 필드용 모델 필터 입력 타입
 * AWS AppSync 표준 필터 타입
 */
export interface ModelStringInput {
  /** 같지 않음 */
  ne?: string;
  /** 같음 */
  eq?: string;
  /** 이하 */
  le?: string;
  /** 미만 */
  lt?: string;
  /** 이상 */
  ge?: string;
  /** 초과 */
  gt?: string;
  /** 포함 */
  contains?: string;
  /** 포함하지 않음 */
  notContains?: string;
  /** 범위 내 (시작값, 종료값) */
  between?: [string, string];
  /** 시작문자 일치 */
  beginsWith?: string;
  /** 속성 존재 여부 */
  attributeExists?: boolean;
  /** 속성 타입 */
  attributeType?: string;
  /** 크기 조건 */
  size?: ModelSizeInput;
}

/**
 * 크기 비교용 모델 필터 입력 타입
 * 문자열 길이나 배열 크기 필터링에 사용
 */
export interface ModelSizeInput {
  /** 같지 않음 */
  ne?: number;
  /** 같음 */
  eq?: number;
  /** 이하 */
  le?: number;
  /** 미만 */
  lt?: number;
  /** 이상 */
  ge?: number;
  /** 초과 */
  gt?: number;
  /** 범위 내 (시작값, 종료값) */
  between?: [number, number];
}

/**
 * 강사 검색용 필터 입력 타입
 * 전문 분야, 상태, 텍스트 검색 기능 제공
 */
export interface InstructorSearchFilterInput {
  /** 전문 분야 필터 (배열) */
  specialties?: string[];
  /** 상태 필터 (ACTIVE/INACTIVE) */
  status?: string;
  /** 텍스트 검색어 */
  searchText?: string;
}