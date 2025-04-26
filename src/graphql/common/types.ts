// src/graphql/common/types.ts
export interface BaseRecord {
    id: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export type PaginatedResponse<T> = {
    items: T[];
    nextToken?: string | null;
  };
  
  export interface ErrorResponse {
    message: string;
    code?: string;
    errorType?: string;
  }
  