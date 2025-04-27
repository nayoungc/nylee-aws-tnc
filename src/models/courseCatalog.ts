// src/models/courseCatalog.ts

/**
 * 코스 카탈로그 상태 타입
 * 코스의 라이프사이클 상태를 나타냄
 */
export type CourseCatalogStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

/**
 * 코스 카탈로그 인터페이스
 * 학습 과정의 기본 정보와 메타데이터를 포함
 */
export interface CourseCatalog {
  id: string;               // 고유 식별자
  title: string;            // 코스 제목
  awsCode?: string;         // AWS 코스 코드 (있는 경우)
  version?: string;         // 코스 버전
  durations?: number;       // 코스 기간 (시간)
  level?: string;           // 난이도 (Beginner, Intermediate, Advanced 등)
  description?: string;     // 코스 설명
  category?: string;        // 카테고리 (Machine Learning, Security 등)
  tags?: string[];          // 관련 태그
  objectives?: string[];    // 학습 목표
  createdAt?: string;       // 생성 일시
  updatedAt?: string;       // 업데이트 일시
  createdBy?: string;       // 생성자 ID
  status?: CourseCatalogStatus; // 코스 상태
}

/**
 * 카탈로그 생성 및 수정에 사용되는 입력 타입
 */
export interface CourseCatalogInput {
  title: string;
  awsCode?: string;
  version?: string;
  durations?: number;
  level?: string;
  description?: string;
  category?: string;
  tags?: string[];
  objectives?: string[];
  status?: CourseCatalogStatus;
}

/**
 * 과정 카탈로그 필터링을 위한 인터페이스
 * 클라이언트 측에서 사용되는 간소화된 필터
 */
export interface CourseCatalogFilter {
  text?: string;
  level?: string;
  category?: string;
  tags?: string[];
}