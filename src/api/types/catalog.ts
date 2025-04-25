// src/types/catalog.tss
export interface CourseCatalog {
    catalogId: string;        // 파티션 키
    title: string;            // 정렬 키 
    version: string;          // GSI1 정렬 키
    awsCode?: string;         // GSI2 해시 키
    description?: string;
    level?: string;
    duration?: number;
    deliveryMethod?: string;
    objectives?: string[];
    targetAudience?: string[];
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface CatalogModule {
    catalogId: string;        // 파티션 키
    moduleNumber: string;     // 정렬 키
    title: string;            // GSI1 해시 키
    description?: string;
    duration?: number;
    learningObjectives?: string[];
    prerequisites?: string[];
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface CatalogLab {
    catalogId: string;        // 파티션 키
    labNumber: string;        // 정렬 키
    moduleId: string;         // GSI1 해시 키 
    title: string;            // GSI2 해시 키
    description?: string;
    duration?: number;
    instructions?: string;
    resources?: string[];
    createdAt?: string;
    updatedAt?: string;
  }