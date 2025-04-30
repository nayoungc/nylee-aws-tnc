// src/api/courseApi.ts
/**
 * 과정 API 서비스
 * @description 교육 과정의 CRUD 및 검색 기능을 제공하는 API 서비스
 */

import { generateClient } from 'aws-amplify/api';
import * as queries from '@/graphql/course';
import * as mutations from '@/graphql/course';
import { Course, CourseInput, CourseFilter } from '@/models/course';
import i18n from '@/i18n';

const client = generateClient();

/**
 * 과정 목록 결과 인터페이스
 */
export interface ListCoursesResult {
  items: Course[];
  nextToken?: string | null;
}

/**
 * GraphQL 응답 타입 가드 함수
 */
function isGraphQLResult(result: any): result is { data: any } {
  return result && typeof result === 'object' && 'data' in result;
}

/**
 * 과정 API 서비스
 */
const courseApi = {
  /**
   * 단일 과정 조회
   * @param courseId 과정 ID
   * @returns 과정 정보 또는 null
   */
  getCourse: async (courseId: string): Promise<Course | null> => {
    try {
      const response = await client.graphql({
        query: queries.getCourse,
        variables: { courseId },
      });
      
      if (isGraphQLResult(response)) {
        return response.data?.getCourse || null;
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching course:', error);
      throw new Error(i18n.t('errors.failedToGetCourse', { error: error.message }));
    }
  },

  /**
   * 과정 목록 조회
   * @param filter 과정 필터 조건
   * @param limit 한 번에 가져올 항목 수
   * @param nextToken 페이지네이션 토큰
   * @returns 과정 목록 및 페이지네이션 정보
   */
  listCourses: async (
    filter?: CourseFilter, 
    limit: number = 50, 
    nextToken?: string
  ): Promise<ListCoursesResult> => {
    try {
      const response = await client.graphql({
        query: queries.listCourses,
        variables: { filter, limit, nextToken },
      });
      
      if (isGraphQLResult(response)) {
        return response.data?.listCourses || { items: [] };
      }
      return { items: [] };
    } catch (error: any) {
      console.error('Error listing courses:', error);
      throw new Error(i18n.t('errors.failedToListCourses', { error: error.message }));
    }
  },

  /**
   * 과정 생성
   * @param input 과정 생성 입력 데이터
   * @returns 생성된 과정 정보
   */
  createCourse: async (input: CourseInput): Promise<Course> => {
    try {
      const response = await client.graphql({
        query: mutations.createCourse,
        variables: { input },
      });
      
      if (!isGraphQLResult(response)) {
        throw new Error('Failed to create course: Invalid response format');
      }
      
      const createdCourse = response.data?.createCourse;
      if (!createdCourse) {
        throw new Error('Failed to create course: No data returned');
      }
      
      return createdCourse;
    } catch (error: any) {
      console.error('Error creating course:', error);
      throw new Error(i18n.t('errors.failedToCreateCourse', { error: error.message }));
    }
  },

  /**
   * 과정 업데이트
   * @param courseId 과정 ID
   * @param input 과정 업데이트 입력 데이터
   * @returns 업데이트된 과정 정보
   */
  updateCourse: async (courseId: string, input: Partial<CourseInput>): Promise<Course> => {
    try {
      const response = await client.graphql({
        query: mutations.updateCourse,
        variables: { courseId, input },
      });
      
      if (!isGraphQLResult(response)) {
        throw new Error('Failed to update course: Invalid response format');
      }
      
      const updatedCourse = response.data?.updateCourse;
      if (!updatedCourse) {
        throw new Error('Failed to update course: No data returned');
      }
      
      return updatedCourse;
    } catch (error: any) {
      console.error('Error updating course:', error);
      throw new Error(i18n.t('errors.failedToUpdateCourse', { error: error.message }));
    }
  },

  /**
   * 과정 삭제
   * @param courseId 과정 ID
   * @returns 삭제된 과정 정보 또는 null
   */
  deleteCourse: async (courseId: string): Promise<Course | null> => {
    try {
      const response = await client.graphql({
        query: mutations.deleteCourse,
        variables: { courseId },
      });
      
      if (isGraphQLResult(response)) {
        return response.data?.deleteCourse || null;
      }
      return null;
    } catch (error: any) {
      console.error('Error deleting course:', error);
      throw new Error(i18n.t('errors.failedToDeleteCourse', { error: error.message }));
    }
  }
};

export default courseApi;