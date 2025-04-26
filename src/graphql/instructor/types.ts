// src/graphql/instructor/types.ts

// 쿼리 결과 타입
export interface ListInstructorsResult {
    listInstructors: {
      items: Array<any>;
      nextToken?: string;
    }
  }
  
  export interface GetInstructorResult {
    getInstructor: any | null;
  }
  
  export interface SearchInstructorsResult {
    searchInstructors: {
      items: Array<any>;
      nextToken?: string;
    }
  }
  
  // 뮤테이션 결과 타입
  export interface CreateInstructorResult {
    createInstructor: any;
  }
  
  export interface UpdateInstructorResult {
    updateInstructor: any;
  }
  
  export interface ChangeInstructorStatusResult {
    changeInstructorStatus: {
      id: string;
      status: string;
      updatedAt: string;
    };
  }
  
  // 입력 타입
  export interface InstructorFilterInput {
    id?: string;
    username?: string;
    email?: string;
    name?: string;
    status?: string;
    and?: InstructorFilterInput[];
    or?: InstructorFilterInput[];
  }
  
  export interface InstructorSearchFilterInput {
    specialties?: string[];
    status?: string;
    searchText?: string;
  }
  