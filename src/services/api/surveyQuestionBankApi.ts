// src/api/surveyQuestionBankApi.ts
/**
 * 설문 질문 은행 API 서비스
 * @description 설문조사 질문 은행의 CRUD 및 검색 기능을 제공하는 API 서비스
 */

import { generateClient } from 'aws-amplify/api';
import * as queries from '@/graphql/surveyQuestionBank';
import { 
  SurveyQuestionBank,
  SurveyQuestionBankInput,
  SurveyQuestionBankUpdate
} from '@/models/surveyQuestionBank';

const client = generateClient();

/**
 * 설문조사 질문 은행 API 서비스
 */
const surveyQuestionBankApi = {
  /**
   * 질문 은행 항목 목록 조회
   * @param filter 필터 조건
   * @param limit 한 번에 가져올 항목 수
   * @param nextToken 페이지네이션 토큰
   * @returns 질문 은행 항목 목록과 next token
   */
  listSurveyQuestionBankItems: async (
    filter?: any, 
    limit: number = 100,
    nextToken?: string
  ): Promise<{ items: SurveyQuestionBank[]; nextToken?: string }> => {
    try {
      const response = await client.graphql({
        query: queries.listSurveyQuestionBankItems,
        variables: { filter, limit, nextToken }
      });
      
      return response.data?.listSurveyQuestionBankItems || { items: [] };
    } catch (error) {
      console.error('질문 은행 항목 목록 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 질문 은행 항목 상세 조회
   * @param questionId 질문 ID
   * @returns 질문 은행 항목 또는 null
   */
  getSurveyQuestionBankItem: async (questionId: string): Promise<SurveyQuestionBank | null> => {
    try {
      const response = await client.graphql({
        query: queries.getSurveyQuestionBankItem,
        variables: { questionId }
      });
      
      return response.data?.getSurveyQuestionBankItem || null;
    } catch (error) {
      console.error(`질문 은행 항목 조회 오류 (ID: \${questionId}):`, error);
      throw error;
    }
  },

  /**
   * 태그로 질문 은행 항목 검색
   * @param tag 태그
   * @param limit 한 번에 가져올 항목 수
   * @param nextToken 페이지네이션 토큰
   * @returns 태그로 검색된 질문 은행 항목 목록
   */
  getSurveyQuestionBankItemsByTag: async (
    tag: string,
    limit: number = 100,
    nextToken?: string
  ): Promise<{ items: SurveyQuestionBank[]; nextToken?: string }> => {
    try {
      const response = await client.graphql({
        query: queries.getSurveyQuestionBankItemsByTag,
        variables: { tag, limit, nextToken }
      });
      
      return response.data?.getSurveyQuestionBankItemsByTag || { items: [] };
    } catch (error) {
      console.error(`태그로 질문 은행 항목 검색 오류 (태그: \${tag}):`, error);
      throw error;
    }
  },

  /**
   * 유형별 질문 은행 항목 검색
   * @param type 질문 유형
   * @param limit 한 번에 가져올 항목 수
   * @param nextToken 페이지네이션 토큰
   * @returns 유형별 질문 은행 항목 목록
   */
  getSurveyQuestionBankItemsByType: async (
    type: string,
    limit: number = 100,
    nextToken?: string
  ): Promise<{ items: SurveyQuestionBank[]; nextToken?: string }> => {
    try {
      const response = await client.graphql({
        query: queries.getSurveyQuestionBankItemsByType,
        variables: { type, limit, nextToken }
      });
      
      return response.data?.getSurveyQuestionBankItemsByType || { items: [] };
    } catch (error) {
      console.error(`유형별 질문 은행 항목 검색 오류 (유형: \${type}):`, error);
      throw error;
    }
  },

  /**
   * 텍스트로 질문 은행 항목 검색
   * @param text 검색 텍스트
   * @param limit 한 번에 가져올 항목 수
   * @param nextToken 페이지네이션 토큰
   * @returns 검색된 질문 은행 항목 목록
   */
  searchSurveyQuestionBankItems: async (
    text: string,
    limit: number = 100,
    nextToken?: string
  ): Promise<{ items: SurveyQuestionBank[]; nextToken?: string }> => {
    try {
      const response = await client.graphql({
        query: queries.searchSurveyQuestionBankItems,
        variables: { text, limit, nextToken }
      });
      
      return response.data?.searchSurveyQuestionBankItems || { items: [] };
    } catch (error) {
      console.error(`텍스트로 질문 은행 항목 검색 오류 (텍스트: \${text}):`, error);
      throw error;
    }
  },

  /**
   * 질문 은행 항목 생성
   * @param input 질문 은행 항목 생성 입력 데이터
   * @returns 생성된 질문 은행 항목
   */
  createSurveyQuestionBankItem: async (input: SurveyQuestionBankInput): Promise<SurveyQuestionBank> => {
    try {
      const response = await client.graphql({
        query: queries.createSurveyQuestionBankItem,
        variables: { input }
      });
      
      const createdItem = response.data?.createSurveyQuestionBankItem;
      if (!createdItem) {
        throw new Error('질문 은행 항목 생성에 실패했습니다.');
      }
      
      return createdItem;
    } catch (error) {
      console.error('질문 은행 항목 생성 오류:', error);
      throw error;
    }
  },

  /**
   * 질문 은행 항목 업데이트
   * @param questionId 질문 ID
   * @param input 질문 은행 항목 업데이트 입력 데이터
   * @returns 업데이트된 질문 은행 항목
   */
  updateSurveyQuestionBankItem: async (
    questionId: string, 
    input: SurveyQuestionBankUpdate
  ): Promise<SurveyQuestionBank> => {
    try {
      const response = await client.graphql({
        query: queries.updateSurveyQuestionBankItem,
        variables: { questionId, input }
      });
      
      const updatedItem = response.data?.updateSurveyQuestionBankItem;
      if (!updatedItem) {
        throw new Error('질문 은행 항목 업데이트에 실패했습니다.');
      }
      
      return updatedItem;
    } catch (error) {
      console.error(`질문 은행 항목 업데이트 오류 (ID: \${questionId}):`, error);
      throw error;
    }
  },

  /**
   * 질문 은행 항목 삭제
   * @param questionId 질문 ID
   * @returns 삭제된 질문의 ID
   */
  deleteSurveyQuestionBankItem: async (questionId: string): Promise<{ questionId: string }> => {
    try {
      const response = await client.graphql({
        query: queries.deleteSurveyQuestionBankItem,
        variables: { questionId }
      });
      
      const deletedItem = response.data?.deleteSurveyQuestionBankItem;
      if (!deletedItem) {
        throw new Error('질문 은행 항목 삭제에 실패했습니다.');
      }
      
      return deletedItem;
    } catch (error) {
      console.error(`질문 은행 항목 삭제 오류 (ID: \${questionId}):`, error);
      throw error;
    }
  }
};

export default surveyQuestionBankApi;