// src/models/courseCatalog.ts
export interface CourseCatalog {
  id: string;
  course_name: string;
  course_id?: string;
  level?: string;
  duration?: string;
  delivery_method?: string;
  description?: string;
  objectives?: string[];
  target_audience?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 카탈로그 생성 및 수정에 사용되는 입력 타입
export interface CourseCatalogInput {
  course_name: string;
  course_id?: string;
  level?: string;
  duration?: string;
  delivery_method?: string;
  description?: string;
  objectives?: string[];
  target_audience?: string;
}

// 과정 카탈로그 필터링을 위한 인터페이스
export interface CourseCatalogFilter {
  text?: string;         // 검색어
  level?: string;        // 레벨별 필터링
  target_audience?: string; // 카테고리/대상별 필터링 (이전 category)
}