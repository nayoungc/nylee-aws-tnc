// src/graphql/course/types.ts

// 쿼리 결과 타입
export interface ListCoursesResult {
    listCourses: {
      items: Array<any>;
      nextToken?: string;
    }
  }
  
  export interface GetCourseResult {
    getCourse: any | null;
  }
  
  export interface GetCoursesByInstructorResult {
    getCoursesByInstructor: {
      items: Array<any>;
      nextToken?: string;
    }
  }
  
  export interface GetCoursesByCustomerResult {
    getCoursesByCustomer: {
      items: Array<any>;
      nextToken?: string;
    }
  }
  
  export interface SearchCoursesResult {
    searchCourses: {
      items: Array<any>;
      nextToken?: string;
    }
  }
  
  // 뮤테이션 결과 타입
  export interface CreateCourseResult {
    createCourse: any;
  }
  
  export interface UpdateCourseResult {
    updateCourse: any;
  }
  
  export interface DeleteCourseResult {
    deleteCourse: {
      courseId: string;
    } | null;
  }
  
  export interface UpdateCourseStatusResult {
    updateCourseStatus: {
      courseId: string;
      status: string;
      updatedAt: string;
    };
  }
  
  // 필터 타입
  export interface CourseFilterInput {
    courseId?: string;
    startDate?: string;
    catalogId?: string;
    instructor?: string;
    customerId?: string;
    status?: string;
    and?: CourseFilterInput[];
    or?: CourseFilterInput[];
  }
  
  export interface CourseSearchFilterInput {
    startDateFrom?: string;
    startDateTo?: string;
    status?: string;
    catalogId?: string;
    instructor?: string;
    customerId?: string;
    searchText?: string;
  }