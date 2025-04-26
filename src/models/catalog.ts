// src/models/catalog.ts
export interface CourseCatalog {
  id: string;               // PK - Amplify는 id를 기본 키로 사용
  title: string;            // 제목
  awsCode?: string;         // AWS 코드 (예: AWS-100)
  version?: string;         // 버전
  durations?: number;       // 교육 기간 (시간)
  level?: string;           // 난이도 (입문, 중급, 고급)
  description?: string;     // 설명
  category?: string;        // 분류
  tags?: string[];          // 태그
  prerequisites?: string[]; // 선수 과목
  objectives?: string[];    // 학습 목표
  createdAt?: string;       // 생성 시간
  updatedAt?: string;       // 수정 시간
  createdBy?: string;       // 생성자
  status?: 'active' | 'draft' | 'archived'; // 상태
}

// 카탈로그 생성 및 수정에 사용되는 입력 타입
export interface CourseCatalogInput {
  title: string;
  awsCode?: string;
  version?: string;
  durations?: number;
  level?: string;
  description?: string;
  category?: string;
  tags?: string[];
  prerequisites?: string[];
  objectives?: string[];
  status?: 'active' | 'draft' | 'archived';
}

// 과정 카탈로그 필터링을 위한 인터페이스
export interface CatalogFilter {
  text?: string;
  level?: string;
}