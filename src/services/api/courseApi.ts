// src/services/courseApi.ts
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api';
import i18n from '@/i18n'; 
import { Course, CourseInput } from '@models/course';
import * as queries from '@graphql/course';
import * as mutations from '@graphql/course';

// GraphQL 클라이언트 생성
const client = generateClient();

// CourseFilter 인터페이스 정의
export interface CourseFilter {
  startDateRange?: {
    from: string;
    to: string;
  };
  status?: string;
  catalogId?: string;
  instructor?: string;
  customerId?: string;
  searchText?: string;
}

// ListCourseResult 인터페이스 정의
export interface ListCoursesResult {
  items: Course[];
  nextToken?: string | null;
}

// GraphQL 결과를 위한 타입 정의
interface GetCourseQuery {
  getCourse: Course;
}

interface ListCoursesQuery {
  listCourses: ListCoursesResult;
}

interface CreateCourseQuery {
  createCourse: Course;
}

interface UpdateCourseQuery {
  updateCourse: Course;
}

interface DeleteCourseQuery {
  deleteCourse: Course;
}

export class CourseApi {
  // 단일 과정 조회
  static async getCourse(courseId: string): Promise<Course | null> {
    try {
      const result = await client.graphql<GetCourseQuery>({
        query: queries.getCourse,
        variables: { courseId },
      });
      
      // GraphQLResult 타입으로 타입 단언
      return (result as GraphQLResult<GetCourseQuery>).data?.getCourse || null;
    } catch (error: any) {
      console.error('Error fetching course:', error);
      throw new Error(i18n.t('errors.failedToGetCourse', { error: error.message }));
    }
  }

  // 과정 목록 조회
  static async listCourses(filter?: CourseFilter, limit?: number, nextToken?: string): Promise<ListCoursesResult> {
    try {
      const result = await client.graphql<ListCoursesQuery>({
        query: queries.listCourses,
        variables: { filter, limit, nextToken },
      });
      
      // GraphQLResult 타입으로 타입 단언
      if (!(result as GraphQLResult<ListCoursesQuery>).data) {
        return { items: [] };
      }
      
      return (result as GraphQLResult<ListCoursesQuery>).data.listCourses;
    } catch (error: any) {
      console.error('Error listing courses:', error);
      throw new Error(i18n.t('errors.failedToListCourses', { error: error.message }));
    }
  }

  // 과정 생성
  static async createCourse(input: CourseInput): Promise<Course> {
    try {
      const result = await client.graphql<CreateCourseQuery>({
        query: mutations.createCourse,
        variables: { input },
      });
      
      // GraphQLResult 타입으로 타입 단언
      if (!(result as GraphQLResult<CreateCourseQuery>).data) {
        throw new Error('Failed to create course: No data returned');
      }
      
      return (result as GraphQLResult<CreateCourseQuery>).data.createCourse;
    } catch (error: any) {
      console.error('Error creating course:', error);
      throw new Error(i18n.t('errors.failedToCreateCourse', { error: error.message }));
    }
  }

  // 과정 업데이트
  static async updateCourse(courseId: string, input: Partial<CourseInput>): Promise<Course> {
    try {
      const result = await client.graphql<UpdateCourseQuery>({
        query: mutations.updateCourse,
        variables: { courseId, input },
      });
      
      // GraphQLResult 타입으로 타입 단언
      if (!(result as GraphQLResult<UpdateCourseQuery>).data) {
        throw new Error('Failed to update course: No data returned');
      }
      
      return (result as GraphQLResult<UpdateCourseQuery>).data.updateCourse;
    } catch (error: any) {
      console.error('Error updating course:', error);
      throw new Error(i18n.t('errors.failedToUpdateCourse', { error: error.message }));
    }
  }

  // 과정 삭제
  static async deleteCourse(courseId: string): Promise<Course | null> {
    try {
      const result = await client.graphql<DeleteCourseQuery>({
        query: mutations.deleteCourse,
        variables: { courseId },
      });
      
      // GraphQLResult 타입으로 타입 단언
      return (result as GraphQLResult<DeleteCourseQuery>).data?.deleteCourse || null;
    } catch (error: any) {
      console.error('Error deleting course:', error);
      throw new Error(i18n.t('errors.failedToDeleteCourse', { error: error.message }));
    }
  }
}
