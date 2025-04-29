// src/api/surveyApi.ts
import { generateClient } from 'aws-amplify/api';
import { safelyExtractData } from '@/utils/graphql';
import {
  getSurveyCatalog,
  listSurveyCatalogs,
  getSurveyCatalogsByCategory,
  getSurveyCatalogsByCreator,
  getSurveyCatalogsByCourse,
  searchSurveyCatalogsByTags,
  createSurveyCatalog,
  updateSurveyCatalog,
  deleteSurveyCatalog,
  addQuestionItems,
  removeQuestionItems,
  updateQuestionOrder,
  activateSurveyCatalog,
  deactivateSurveyCatalog,
  deploySurvey
} from '@/graphql/survey';
import {
  SurveyCatalog, 
  SurveyCatalogInput, 
  UpdateSurveyCatalogInput,
  QuestionItem, 
  QuestionItemInput,
  DeploySurveyInput,
  SurveyCatalogFilter
} from '@/models/surveyCatalog';

// Amplify API 클라이언트 생성
const client = generateClient();

/**
 * 설문조사 API 서비스
 * @description 설문조사 템플릿의 CRUD 및 문항 관리, 배포 등의 기능을 제공하는 API 서비스
 */
export const surveyApi = {
  /**
   * 전체 설문조사 템플릿 목록 조회
   * @returns 설문조사 템플릿 목록
   */
  getSurveyCatalogs: async (filter?: SurveyCatalogFilter): Promise<SurveyCatalog[]> => {
    try {
      const response = await client.graphql({
        query: listSurveyCatalogs,
        variables: { filter, limit: 1000 }
      });
      
      const data = safelyExtractData(response);
      return data?.listSurveyCatalogs?.items || [];
    } catch (error) {
      console.error('설문조사 템플릿 목록 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 설문조사 템플릿 상세 조회
   * @param id 설문조사 템플릿 ID
   * @returns 설문조사 템플릿 정보
   */
  getSurveyCatalog: async (id: string): Promise<SurveyCatalog | null> => {
    try {
      const response = await client.graphql({
        query: getSurveyCatalog,
        variables: { surveyCatalogId: id }
      });
      
      const data = safelyExtractData(response);
      return data?.getSurveyCatalog || null;
    } catch (error) {
      console.error(`설문조사 템플릿 조회 오류 (ID: \${id}):`, error);
      throw error;
    }
  },

  /**
   * 카테고리별 설문조사 템플릿 조회
   * @param category 카테고리
   * @returns 카테고리별 설문조사 템플릿 목록
   */
  getSurveyCatalogsByCategory: async (category: string): Promise<SurveyCatalog[]> => {
    try {
      const response = await client.graphql({
        query: getSurveyCatalogsByCategory,
        variables: { category, limit: 1000 }
      });
      
      const data = safelyExtractData(response);
      return data?.getSurveyCatalogsByCategory?.items || [];
    } catch (error) {
      console.error(`카테고리별 설문조사 템플릿 조회 오류 (카테고리: \${category}):`, error);
      throw error;
    }
  },

  /**
   * 생성자별 설문조사 템플릿 조회
   * @param createdBy 생성자 ID
   * @returns 생성자별 설문조사 템플릿 목록
   */
  getSurveyCatalogsByCreator: async (createdBy: string): Promise<SurveyCatalog[]> => {
    try {
      const response = await client.graphql({
        query: getSurveyCatalogsByCreator,
        variables: { createdBy, limit: 1000 }
      });
      
      const data = safelyExtractData(response);
      return data?.getSurveyCatalogsByCreator?.items || [];
    } catch (error) {
      console.error(`생성자별 설문조사 템플릿 조회 오류 (생성자: \${createdBy}):`, error);
      throw error;
    }
  },

  /**
   * 과정별 설문조사 템플릿 조회
   * @param courseId 과정 ID
   * @returns 과정별 설문조사 템플릿 목록
   */
  getSurveyCatalogsByCourse: async (courseId: string): Promise<SurveyCatalog[]> => {
    try {
      const response = await client.graphql({
        query: getSurveyCatalogsByCourse,
        variables: { courseId, limit: 1000 }
      });
      
      const data = safelyExtractData(response);
      return data?.getSurveyCatalogsByCourse?.items || [];
    } catch (error) {
      console.error(`과정별 설문조사 템플릿 조회 오류 (과정 ID: \${courseId}):`, error);
      throw error;
    }
  },

  /**
   * 태그로 설문조사 템플릿 검색
   * @param tags 태그 목록
   * @returns 태그로 검색한 설문조사 템플릿 목록
   */
  searchSurveyCatalogsByTags: async (tags: string[]): Promise<SurveyCatalog[]> => {
    try {
      const response = await client.graphql({
        query: searchSurveyCatalogsByTags,
        variables: { tags, limit: 1000 }
      });
      
      const data = safelyExtractData(response);
      return data?.searchSurveyCatalogsByTags?.items || [];
    } catch (error) {
      console.error(`태그로 설문조사 템플릿 검색 오류 (태그: \${tags.join(', ')}):`, error);
      throw error;
    }
  },

  /**
   * 설문조사 템플릿 생성
   * @param input 설문조사 템플릿 생성 입력 데이터
   * @returns 생성된 설문조사 템플릿
   */
  createSurveyCatalog: async (input: SurveyCatalogInput): Promise<SurveyCatalog> => {
    try {
      const response = await client.graphql({
        query: createSurveyCatalog,
        variables: { input }
      });
      
      const data = safelyExtractData(response);
      if (!data?.createSurveyCatalog) {
        throw new Error('설문조사 템플릿 생성에 실패했습니다.');
      }
      
      return data.createSurveyCatalog;
    } catch (error) {
      console.error('설문조사 템플릿 생성 오류:', error);
      throw error;
    }
  },

  /**
   * 설문조사 템플릿 업데이트
   * @param input 설문조사 템플릿 업데이트 입력 데이터
   * @returns 업데이트된 설문조사 템플릿
   */
  updateSurveyCatalog: async (input: UpdateSurveyCatalogInput): Promise<SurveyCatalog> => {
    try {
      const response = await client.graphql({
        query: updateSurveyCatalog,
        variables: { input }
      });
      
      const data = safelyExtractData(response);
      if (!data?.updateSurveyCatalog) {
        throw new Error('설문조사 템플릿 업데이트에 실패했습니다.');
      }
      
      return data.updateSurveyCatalog;
    } catch (error) {
      console.error(`설문조사 템플릿 업데이트 오류 (ID: \${input.surveyCatalogId}):`, error);
      throw error;
    }
  },

  /**
   * 설문조사 템플릿 삭제
   * @param id 설문조사 템플릿 ID
   * @returns 삭제 성공 여부
   */
  deleteSurveyCatalog: async (id: string): Promise<boolean> => {
    try {
      const response = await client.graphql({
        query: deleteSurveyCatalog,
        variables: { surveyCatalogId: id }
      });
      
      const data = safelyExtractData(response);
      return !!data?.deleteSurveyCatalog;
    } catch (error) {
      console.error(`설문조사 템플릿 삭제 오류 (ID: \${id}):`, error);
      throw error;
    }
  },

  /**
   * 설문조사 템플릿에 문항 추가
   * @param surveyCatalogId 설문조사 템플릿 ID
   * @param questionItems 추가할 문항 목록
   * @returns 업데이트된 설문조사 템플릿
   */
  addQuestionItems: async (surveyCatalogId: string, questionItems: QuestionItemInput[]): Promise<SurveyCatalog> => {
    try {
      const response = await client.graphql({
        query: addQuestionItems,
        variables: { surveyCatalogId, questionItems }
      });
      
      const data = safelyExtractData(response);
      if (!data?.addQuestionItems) {
        throw new Error('문항 추가에 실패했습니다.');
      }
      
      return data.addQuestionItems;
    } catch (error) {
      console.error(`문항 추가 오류 (ID: \${surveyCatalogId}):`, error);
      throw error;
    }
  },

  /**
   * 설문조사 템플릿에서 문항 제거
   * @param surveyCatalogId 설문조사 템플릿 ID
   * @param questionIds 제거할 문항 ID 목록
   * @returns 업데이트된 설문조사 템플릿
   */
  removeQuestionItems: async (surveyCatalogId: string, questionIds: string[]): Promise<SurveyCatalog> => {
    try {
      const response = await client.graphql({
        query: removeQuestionItems,
        variables: { surveyCatalogId, questionIds }
      });
      
      const data = safelyExtractData(response);
      if (!data?.removeQuestionItems) {
        throw new Error('문항 제거에 실패했습니다.');
      }
      
      return data.removeQuestionItems;
    } catch (error) {
      console.error(`문항 제거 오류 (ID: \${surveyCatalogId}):`, error);
      throw error;
    }
  },

  /**
   * 설문조사 템플릿의 문항 순서 업데이트
   * @param surveyCatalogId 설문조사 템플릿 ID
   * @param questionIds 순서대로 정렬된 문항 ID 목록
   * @returns 업데이트된 설문조사 템플릿
   */
  updateQuestionOrder: async (surveyCatalogId: string, questionIds: string[]): Promise<SurveyCatalog> => {
    try {
      const response = await client.graphql({
        query: updateQuestionOrder,
        variables: { surveyCatalogId, questionIds }
      });
      
      const data = safelyExtractData(response);
      if (!data?.updateQuestionOrder) {
        throw new Error('문항 순서 업데이트에 실패했습니다.');
      }
      
      return data.updateQuestionOrder;
    } catch (error) {
      console.error(`문항 순서 업데이트 오류 (ID: \${surveyCatalogId}):`, error);
      throw error;
    }
  },

  /**
   * 설문조사 템플릿 활성화
   * @param id 설문조사 템플릿 ID
   * @returns 활성화된 설문조사 템플릿
   */
  activateSurveyCatalog: async (id: string): Promise<SurveyCatalog> => {
    try {
      const response = await client.graphql({
        query: activateSurveyCatalog,
        variables: { surveyCatalogId: id }
      });
      
      const data = safelyExtractData(response);
      if (!data?.activateSurveyCatalog) {
        throw new Error('설문조사 템플릿 활성화에 실패했습니다.');
      }
      
      return data.activateSurveyCatalog;
    } catch (error) {
      console.error(`설문조사 템플릿 활성화 오류 (ID: \${id}):`, error);
      throw error;
    }
  },

  /**
   * 설문조사 템플릿 비활성화
   * @param id 설문조사 템플릿 ID
   * @returns 비활성화된 설문조사 템플릿
   */
  deactivateSurveyCatalog: async (id: string): Promise<SurveyCatalog> => {
    try {
      const response = await client.graphql({
        query: deactivateSurveyCatalog,
        variables: { surveyCatalogId: id }
      });
      
      const data = safelyExtractData(response);
      if (!data?.deactivateSurveyCatalog) {
        throw new Error('설문조사 템플릿 비활성화에 실패했습니다.');
      }
      
      return data.deactivateSurveyCatalog;
    } catch (error) {
      console.error(`설문조사 템플릿 비활성화 오류 (ID: \${id}):`, error);
      throw error;
    }
  },

  /**
   * 설문조사 배포
   * @param input 설문조사 배포 입력 데이터
   * @returns 배포된 설문조사 템플릿
   */
  deploySurvey: async (input: DeploySurveyInput): Promise<SurveyCatalog> => {
    try {
      const response = await client.graphql({
        query: deploySurvey,
        variables: { input }
      });
      
      const data = safelyExtractData(response);
      if (!data?.deploySurvey) {
        throw new Error('설문조사 배포에 실패했습니다.');
      }
      
      return data.deploySurvey;
    } catch (error) {
      console.error(`설문조사 배포 오류 (ID: \${input.surveyCatalogId}):`, error);
      throw error;
    }
  }
};

export default surveyApi;