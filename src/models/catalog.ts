export interface CourseCatalog {
  catalogId: string;
  title: string;
  version: string;
  awsCode?: string;
  description?: string;
  hours?: number;
  level?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 과정 카탈로그 필터링을 위한 인터페이스
export interface CatalogFilter {
  text?: string;
  level?: string;
}