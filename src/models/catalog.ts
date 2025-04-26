// src/models/catalog.ts
export type CatalogStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface CourseCatalog {
  id: string;               
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
  createdAt?: string;       
  updatedAt?: string;       
  createdBy?: string;       
  status?: CatalogStatus;   
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
  status?: CatalogStatus;
}

// 과정 카탈로그 필터링을 위한 인터페이스
export interface CatalogFilter {
  text?: string;
  level?: string;
  category?: string;
  tags?: string[];
}