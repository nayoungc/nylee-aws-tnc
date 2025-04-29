// src/api/surveyResponseApi.ts
/**
 * 설문조사 응답 API 서비스
 * @description 설문조사 응답의 CRUD 및 검색 기능을 제공하는 API 서비스
 */

import { generateClient } from 'aws-amplify/api';
import * as queries from '@/graphql/surveyResponse';
import * as mutations from '@/graphql/surveyResponse';
import { 
  SurveyResponse,
  SurveyResponseInput,
  SurveyResponseUpdate
} from '@/models/surveyResponse';

const client = generateClient();

/**
 * 설문조사 응답 API 서비스
 */
const surveyResponseApi = {
  /**
   * 설문조사 응답 목록 조회
   * @param filter 필터 조건
   * @param limit 한 번에 가져올 항목 수
   * @param nextToken 페이지네이션 토큰
   * @returns 설문조사 응답 목록 및 페이지네이션 정보
   */
  listSurveyResponses: async (
    filter?: any,
    limit: number = 100,
    nextToken?: string
  ): Promise<{ items: SurveyResponse[]; nextToken?: string | null }> => {
    try {
      const result = await client.graphql({
        query: queries.listSurveyResponses,
        variables: { filter, limit, nextToken }
      });
      
      return result.data?.listSurveyResponses || { items: [] };
    } catch (error) {
      console.error('설문조사 응답 목록 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 설문조사 응답 상세 조회
   * @param responseId 응답 ID
   * @returns 설문조사 응답 또는 null
   */
  getSurveyResponse: async (responseId: string): Promise<SurveyResponse | null> => {
    try {
      const result = await client.graphql({
        query: queries.getSurveyResponse,
        variables: { responseId }
      });
      
      return result.data?.getSurveyResponse || null;
    } catch (error) {
      console.error(`설문조사 응답 조회 오류 (ID: \${responseId}):`, error);
      throw error;
    }
  },

  /**
   * 과정 설문조사 ID별 응답 조회
   * @param courseSurveyId 과정 설문조사 ID
   * @param limit 한 번에 가져올 항목 수
   * @param nextToken 페이지네이션 토큰
   * @returns 과정 설문조사별 응답 목록
   */
  getSurveyResponsesByCourseSurveyId: async (
    courseSurveyId: string,
    limit: number = 100,
    nextToken?: string
  ): Promise<{ items: SurveyResponse[]; nextToken?: string | null }> => {
    try {
      const result = await client.graphql({
        query: queries.getSurveyResponsesByCourseSurveyId,
        variables: { courseSurveyId, limit, nextToken }
      });
      
      return result.data?.getSurveyResponsesByCourseSurveyId || { items: [] };
    } catch (error) {
      console.error(`과정 설문조사별 응답 조회 오류 (ID: \${courseSurveyId}):`, error);
      throw error;
    }
  },

  /**
   * 학생 ID별 응답 조회
   * @param studentId 학생 ID
   * @param limit 한 번에 가져올 항목 수
   * @param nextToken 페이지네이션 토큰
   * @returns 학생별 응답 목록
   */
  getSurveyResponsesByStudentId: async (
    studentId: string,
    limit: number = 100,
    nextToken?: string
  ): Promise<{ items: SurveyResponse[]; nextToken?: string | null }> => {
    try {
      const result = await client.graphql({
        query: queries.getSurveyResponsesByStudentId,
        variables: { studentId, limit, nextToken }
      });
      
      return result.data?.getSurveyResponsesByStudentId || { items: [] };
    } catch (error) {
      console.error(`학생별 응답 조회 오류 (ID: \${studentId}):`, error);
      throw error;
    }
  },

  /**
   * 설문조사 응답 통계 조회
   * @param courseSurveyId 과정 설문조사 ID
   * @returns 설문조사 응답 통계
   */
  getSurveyResponseStatistics: async (courseSurveyId: string): Promise<any> => {
    try {
      const result = await client.graphql({
        query: queries.getSurveyResponseStatistics,
        variables: { courseSurveyId }
      });
      
      return result.data?.getSurveyResponseStatistics || null;
    } catch (error) {
      console.error(`설문조사 응답 통계 조회 오류 (ID: \${courseSurveyId}):`, error);
      throw error;
    }
  },

  /**
   * 설문조사 응답 생성
   * @param input 설문조사 응답 생성 입력 데이터
   * @returns 생성된 설문조사 응답
   */
  createSurveyResponse: async (input: SurveyResponseInput): Promise<SurveyResponse> => {
    try {
      const result = await client.graphql({
        query: mutations.createSurveyResponse,
        variables: { input }
      });
      
      const createdResponse = result.data?.createSurveyResponse;
      if (!createdResponse) {
        throw new Error('설문조사 응답 생성에 실패했습니다.');
      }
      
      return createdResponse;
    } catch (error) {
      console.error('설문조사 응답 생성 오류:', error);
      throw error;
    }
  },

  /**
   * 설문조사 응답 업데이트
   * @param responseId 응답 ID
   * @param input 설문조사 응답 업데이트 입력 데이터
   * @returns 업데이트된 설문조사 응답
   */
  updateSurveyResponse: async (
    responseId: string,
    input: SurveyResponseUpdate
  ): Promise<SurveyResponse> => {
    try {
      const result = await client.graphql({
        query: mutations.updateSurveyResponse,
        variables: { responseId, input }
      });
      
      const updatedResponse = result.data?.updateSurveyResponse;
      if (!updatedResponse) {
        throw new Error('설문조사 응답 업데이트에 실패했습니다.');
      }
      
      return updatedResponse;
    } catch (error) {
      console.error(`설문조사 응답 업데이트 오류 (ID: \${responseId}):`, error);
      throw error;
    }
  },

  /**
   * 설문조사 응답 삭제
   * @param responseId 응답 ID
   * @returns 삭제된 응답의 ID
   */
  deleteSurveyResponse: async (responseId: string): Promise<{ responseId: string }> => {
    try {
      const result = await client.graphql({
        query: mutations.deleteSurveyResponse,
        variables: { responseId }
      });
      
      const deletedResponse = result.data?.deleteSurveyResponse;
      if (!deletedResponse) {
        throw new Error('설문조사 응답 삭제에 실패했습니다.');
      }
      
      return deletedResponse;
    } catch (error) {
      console.error(`설문조사 응답 삭제 오류 (ID: \${responseId}):`, error);
      throw error;
    }
  }
};

export default surveyResponseApi;