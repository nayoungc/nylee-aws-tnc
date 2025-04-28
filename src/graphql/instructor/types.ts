/**
 * 강사 상태 열거형
 */
export enum InstructorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

/**
 * 강사 번역 타입
 */
export interface InstructorTranslation {
  id: string;
  instructorId: string;
  locale: string;
  name?: string;
  profile?: string;
}

/**
 * 강사 기본 모델 타입
 */
export interface Instructor {
  id: string;
  username: string;
  email: string;
  name: string;
  profile?: string;
  specialties?: string[];
  status?: InstructorStatus;
  createdAt?: string;
  updatedAt?: string;
  locale?: string;
  translations?: InstructorTranslation[];
}

/**
 * 강사 필터 입력 타입
 */
export interface InstructorFilterInput {
  specialties?: string[];
  status?: InstructorStatus;
  searchText?: string;
}

/**
 * 페이지네이션을 위한 연결 타입
 */
export interface InstructorConnection {
  items: Instructor[];
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
  getInstructor: Instructor | null;
}

/**
 * 강사 검색 쿼리 결과 타입
 */
export interface SearchInstructorsResult {
  searchInstructors: Instructor[];
}

/**
 * 강사 상태 업데이트 뮤테이션 결과 타입
 */
export interface UpdateInstructorStatusResult {
  updateInstructorStatus: Instructor;
}

/**
 * 강사 프로필 업데이트 뮤테이션 결과 타입
 */
export interface UpdateInstructorProfileResult {
  updateInstructorProfile: Instructor;
}

/**
 * 강사 전문 분야 업데이트 뮤테이션 결과 타입
 */
export interface UpdateInstructorSpecialtiesResult {
  updateInstructorSpecialties: Instructor;
}

/**
 * 강사 번역 정보 업데이트 뮤테이션 결과 타입
 */
export interface UpdateInstructorTranslationResult {
  updateInstructorTranslation: InstructorTranslation;
}