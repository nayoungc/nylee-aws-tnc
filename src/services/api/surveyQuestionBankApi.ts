// src/api/surveyQuestionBankApi.ts
/**
 * 설문 질문 은행 API 서비스
 * @description 설문조사 질문 은행의 CRUD 및 검색 기능을 제공하는 API 서비스
 */

import { generateClient } from 'aws-amplify/api';
import { safelyExtractData } from '@/utils/graphql';

// GraphQL 쿼리/뮤테이션 import 수정
import { 
  listSurveyQuestionBankItems,
  getSurveyQuestionBankItem,
  getSurveyQuestionBankItemsByTag,
  getSurveyQuestionBankItemsByType, 
  searchSurveyQuestionBankItems,
  createSurveyQuestionBankItem as createSurveyQuestionBankItemMutation,
  updateSurveyQuestionBankItem as updateSurveyQuestionBankItemMutation,
  deleteSurveyQuestionBankItem as deleteSurveyQuestionBankItemMutation
} from '@/graphql/queries';

import {
  ApiSurveyQuestionBank,
  ListSurveyQuestionBankItemsResult,
  GetSurveyQuestionBankItemResult,
  CreateSurveyQuestionBankItemInput,
  UpdateSurveyQuestionBankItemInput,
  CreateSurveyQuestionBankItemResult,
  UpdateSurveyQuestionBankItemResult,
  DeleteSurveyQuestionBankItemResult,
  ModelSurveyQuestionBankFilterInput
} from '@/graphql/surveyQuestionBank/types';

import { 
  SurveyQuestionBank, 
  SurveyQuestionBankInput, 
  SurveyQuestionBankUpdate, 
  SurveyQuestionBankFilter 
} from '@/models/surveyQuestionBank';

// Amplify API 클라이언트 생성
const client = generateClient();

/**
 * API 응답을 프론트엔드 모델로 변환
 * @param apiQuestion API에서 반환된 질문 은행 데이터
 * @returns 프론트엔드 모델 형식의 질문 은행 항목
 */
const mapToFrontendModel = (apiQuestion: ApiSurveyQuestionBank): SurveyQuestionBank => {
  return {
    questionId: apiQuestion.questionId,
    text: apiQuestion.text,
    type: apiQuestion.type,
    options: apiQuestion.options,
    tags: apiQuestion.tags,
    category: apiQuestion.category,
    metadata: apiQuestion.metadata,
    createdAt: apiQuestion.createdAt,
    updatedAt: apiQuestion.updatedAt,
    createdBy: apiQuestion.createdBy
  };
};

/**
 * 필터를 API 필터 형식으로 변환
 * @param filter 프론트엔드 필터
 * @returns API 필터 형식
 */
const mapToApiFilter = (filter: SurveyQuestionBankFilter = {}): ModelSurveyQuestionBankFilterInput => {
  const apiFilter: ModelSurveyQuestionBankFilterInput = {};
  
  if (filter.text) {
    const searchFilters: ModelSurveyQuestionBankFilterInput[] = [
      { text: { contains: filter.text } }
    ];
    
    apiFilter.or = searchFilters;
  }
  
  if (filter.type) {
    apiFilter.type = { eq: filter.type };
  }
  
  if (filter.category) {
    apiFilter.category = { eq: filter.category };
  }
  
  if (filter.tags && filter.tags.length > 0) {
    // 여러 태그 중 하나라도 포함된 항목 검색
    const tagFilters = filter.tags.map(tag => ({ 
      tags: { contains: tag } 
    }));
    
    if (apiFilter.or) {
      apiFilter.or = [...apiFilter.or, ...tagFilters];
    } else {
      apiFilter.or = tagFilters;
    }
  }
  
  return apiFilter;
};

/**
 * 설문조사 질문 은행 API 서비스
 */
export const fetchAllSurveyQuestionBankItems = async (
  filter: SurveyQuestionBankFilter = {},
  limit = 100,
  nextToken?: string
): Promise<{ items: SurveyQuestionBank[]; nextToken?: string }> => {
  try {
    const apiFilter = mapToApiFilter(filter);
    
    const response = await client.graphql({
      query: listSurveyQuestionBankItems,
      variables: { filter: apiFilter, limit, nextToken }
    });
    
    const data = safelyExtractData<ListSurveyQuestionBankItemsResult>(response);
    if (!data?.listSurveyQuestionBankItems?.items) {
      return { items: [] };
    }
    
    return {
      items: data.listSurveyQuestionBankItems.items.map(mapToFrontendModel),
      nextToken: data.listSurveyQuestionBankItems.nextToken
    };
  } catch (error) {
    console.error('질문 은행 항목 목록 조회 오류:', error);
    throw new Error(`질문 은행 항목을 불러오는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 질문 은행 항목 상세 조회
 * @param questionId 질문 ID
 * @returns 질문 은행 항목 또는 null
 */
export const fetchSurveyQuestionBankItem = async (questionId: string): Promise<SurveyQuestionBank | null> => {
  try {
    const response = await client.graphql({
      query: getSurveyQuestionBankItem,
      variables: { questionId }
    });
    
    const data = safelyExtractData<GetSurveyQuestionBankItemResult>(response);
    if (!data?.getSurveyQuestionBankItem) {
      return null;
    }
    
    return mapToFrontendModel(data.getSurveyQuestionBankItem);
  } catch (error) {
    console.error(`질문 은행 항목 조회 오류 (ID: \${questionId}):`, error);
    throw new Error(`질문 은행 항목을 불러오는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 태그로 질문 은행 항목 검색
 * @param tag 태그
 * @param limit 한 번에 가져올 항목 수
 * @param nextToken 페이지네이션 토큰
 * @returns 태그로 검색된 질문 은행 항목 목록
 */
export const fetchSurveyQuestionBankItemsByTag = async (
  tag: string,
  limit = 100,
  nextToken?: string
): Promise<{ items: SurveyQuestionBank[]; nextToken?: string }> => {
  try {
    const response = await client.graphql({
      query: getSurveyQuestionBankItemsByTag,
      variables: { tag, limit, nextToken }
    });
    
    const data = safelyExtractData<ListSurveyQuestionBankItemsResult>(response);
    if (!data?.getSurveyQuestionBankItemsByTag?.items) {
      return { items: [] };
    }
    
    return {
      items: data.getSurveyQuestionBankItemsByTag.items.map(mapToFrontendModel),
      nextToken: data.getSurveyQuestionBankItemsByTag.nextToken
    };
  } catch (error) {
    console.error(`태그로 질문 은행 항목 검색 오류 (태그: \${tag}):`, error);
    throw new Error(`태그로 질문 은행 항목을 검색하는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 유형별 질문 은행 항목 검색
 * @param type 질문 유형
 * @param limit 한 번에 가져올 항목 수
 * @param nextToken 페이지네이션 토큰
 * @returns 유형별 질문 은행 항목 목록
 */
export const fetchSurveyQuestionBankItemsByType = async (
  type: string,
  limit = 100,
  nextToken?: string
): Promise<{ items: SurveyQuestionBank[]; nextToken?: string }> => {
  try {
    const response = await client.graphql({
      query: getSurveyQuestionBankItemsByType,
      variables: { type, limit, nextToken }
    });
    
    const data = safelyExtractData<ListSurveyQuestionBankItemsResult>(response);
    if (!data?.getSurveyQuestionBankItemsByType?.items) {
      return { items: [] };
    }
    
    return {
      items: data.getSurveyQuestionBankItemsByType.items.map(mapToFrontendModel),
      nextToken: data.getSurveyQuestionBankItemsByType.nextToken
    };
  } catch (error) {
    console.error(`유형별 질문 은행 항목 검색 오류 (유형: \${type}):`, error);
    throw new Error(`유형별 질문 은행 항목을 검색하는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 텍스트로 질문 은행 항목 검색
 * @param text 검색 텍스트
 * @param limit 한 번에 가져올 항목 수
 * @param nextToken 페이지네이션 토큰
 * @returns 검색된 질문 은행 항목 목록
 */
export const searchSurveyQuestionBankItemsByText = async (
  text: string,
  limit = 100,
  nextToken?: string
): Promise<{ items: SurveyQuestionBank[]; nextToken?: string }> => {
  try {
    const response = await client.graphql({
      query: searchSurveyQuestionBankItems,
      variables: { text, limit, nextToken }
    });
    
    const data = safelyExtractData<ListSurveyQuestionBankItemsResult>(response);
    if (!data?.searchSurveyQuestionBankItems?.items) {
      return { items: [] };
    }
    
    return {
      items: data.searchSurveyQuestionBankItems.items.map(mapToFrontendModel),
      nextToken: data.searchSurveyQuestionBankItems.nextToken
    };
  } catch (error) {
    console.error(`텍스트로 질문 은행 항목 검색 오류 (텍스트: \${text}):`, error);
    throw new Error(`텍스트로 질문 은행 항목을 검색하는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 질문 은행 항목 생성
 * @param input 질문 은행 항목 생성 입력 데이터
 * @returns 생성된 질문 은행 항목
 */
export const createSurveyQuestionBankItem = async (input: SurveyQuestionBankInput): Promise<SurveyQuestionBank> => {
  try {
    const apiInput: CreateSurveyQuestionBankItemInput = {
      ...input
    };
    
    const response = await client.graphql({
      query: createSurveyQuestionBankItemMutation,
      variables: { input: apiInput }
    });
    
    const data = safelyExtractData<CreateSurveyQuestionBankItemResult>(response);
    if (!data?.createSurveyQuestionBankItem) {
      throw new Error('질문 은행 항목 생성에 실패했습니다.');
    }
    
    return mapToFrontendModel(data.createSurveyQuestionBankItem);
  } catch (error) {
    console.error('질문 은행 항목 생성 오류:', error);
    throw new Error(`질문 은행 항목 생성에 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 질문 은행 항목 업데이트
 * @param questionId 질문 ID
 * @param input 질문 은행 항목 업데이트 입력 데이터
 * @returns 업데이트된 질문 은행 항목
 */
export const updateSurveyQuestionBankItem = async (
  questionId: string,
  input: SurveyQuestionBankUpdate
): Promise<SurveyQuestionBank> => {
  try {
    const apiInput: UpdateSurveyQuestionBankItemInput = {
      questionId,
      ...input
    };
    
    const response = await client.graphql({
      query: updateSurveyQuestionBankItemMutation,
      variables: { input: apiInput }
    });
    
    const data = safelyExtractData<UpdateSurveyQuestionBankItemResult>(response);
    if (!data?.updateSurveyQuestionBankItem) {
      throw new Error('질문 은행 항목 업데이트에 실패했습니다.');
    }
    
    return mapToFrontendModel(data.updateSurveyQuestionBankItem);
  } catch (error) {
    console.error(`질문 은행 항목 업데이트 오류 (ID: \${questionId}):`, error);
    throw new Error(`질문 은행 항목 업데이트에 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 질문 은행 항목 삭제
 * @param questionId 질문 ID
 * @returns 삭제 성공 여부
 */
export const deleteSurveyQuestionBankItem = async (questionId: string): Promise<{ success: boolean }> => {
  try {
    const response = await client.graphql({
      query: deleteSurveyQuestionBankItemMutation,
      variables: { questionId }
    });
    
    const data = safelyExtractData<DeleteSurveyQuestionBankItemResult>(response);
    if (!data?.deleteSurveyQuestionBankItem?.questionId) {
      throw new Error('질문 은행 항목 삭제에 실패했습니다.');
    }
    
    return { success: true };
  } catch (error) {
    console.error(`질문 은행 항목 삭제 오류 (ID: \${questionId}):`, error);
    throw new Error(`질문 은행 항목 삭제에 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};