// src/api/surveyResponseApi.ts
/**
 * 설문조사 응답 API 서비스
 * @description 설문조사 응답의 CRUD 및 검색 기능을 제공하는 API 서비스
 */

import { generateClient } from 'aws-amplify/api';
import { safelyExtractData } from '@/utils/graphql';
import { 
  listSurveyResponses,
  getSurveyResponse,
  getSurveyResponsesByCourseSurveyId,
  getSurveyResponsesByStudentId,
  getSurveyResponseStatistics,
  createSurveyResponse as createSurveyResponseMutation,
  updateSurveyResponse as updateSurveyResponseMutation,
  deleteSurveyResponse as deleteSurveyResponseMutation
} from '@/graphql/surveyResponse';

import {
  ApiSurveyResponse,
  ListSurveyResponsesResult,
  GetSurveyResponseResult,
  GetSurveyResponseStatisticsResult,
  CreateSurveyResponseInput,
  UpdateSurveyResponseInput,
  CreateSurveyResponseResult,
  UpdateSurveyResponseResult,
  DeleteSurveyResponseResult,
  ModelSurveyResponseFilterInput
} from '@/graphql/surveyResponse/types';

import {
  SurveyResponse,
  SurveyResponseInput,
  SurveyResponseUpdate,
  SurveyResponseFilter
} from '@/models/surveyResponse';

// Amplify API 클라이언트 생성
const client = generateClient();

/**
 * API 응답을 프론트엔드 모델로 변환
 * @param apiResponse API에서 반환된 설문조사 응답 데이터
 * @returns 프론트엔드 모델 형식의 설문조사 응답
 */
const mapToFrontendModel = (apiResponse: ApiSurveyResponse): SurveyResponse => {
  return {
    responseId: apiResponse.responseId,
    instanceId: apiResponse.instanceId,
    studentId: apiResponse.studentId,
    courseId: apiResponse.courseId,
    submittedAt: apiResponse.submittedAt,
    answers: apiResponse.answers,
    feedbackText: apiResponse.feedbackText,
    metadata: apiResponse.metadata,
    createdAt: apiResponse.createdAt,
    updatedAt: apiResponse.updatedAt
  };
};

/**
 * 필터를 API 필터 형식으로 변환
 * @param filter 프론트엔드 필터
 * @returns API 필터 형식
 */
const mapToApiFilter = (filter: SurveyResponseFilter = {}): ModelSurveyResponseFilterInput => {
  const apiFilter: ModelSurveyResponseFilterInput = {};
  
  if (filter.instanceId) {
    apiFilter.instanceId = { eq: filter.instanceId };
  }
  
  if (filter.courseId) {
    apiFilter.courseId = { eq: filter.courseId };
  }
  
  if (filter.studentId) {
    apiFilter.studentId = { eq: filter.studentId };
  }
  
  if (filter.submittedAtRange) {
    apiFilter.submittedAt = {};
    
    if (filter.submittedAtRange.from) {
      apiFilter.submittedAt.ge = filter.submittedAtRange.from;
    }
    
    if (filter.submittedAtRange.to) {
      apiFilter.submittedAt.le = filter.submittedAtRange.to;
    }
  }
  
  return apiFilter;
};

/**
 * 설문조사 응답 목록 조회
 * @param filter 필터 조건
 * @param limit 한 번에 가져올 항목 수
 * @param nextToken 페이지네이션 토큰
 * @returns 설문조사 응답 목록 및 페이지네이션 정보
 */
export const fetchSurveyResponses = async (
  filter: SurveyResponseFilter = {},
  limit: number = 100,
  nextToken?: string
): Promise<{ items: SurveyResponse[]; nextToken?: string | null }> => {
  try {
    const apiFilter = mapToApiFilter(filter);
    
    const response = await client.graphql({
      query: listSurveyResponses,
      variables: { filter: apiFilter, limit, nextToken }
    });
    
    const data = safelyExtractData<ListSurveyResponsesResult>(response);
    if (!data?.listSurveyResponses?.items) {
      return { items: [] };
    }
    
    return {
      items: data.listSurveyResponses.items.map(mapToFrontendModel),
      nextToken: data.listSurveyResponses.nextToken
    };
  } catch (error) {
    console.error('설문조사 응답 목록 조회 오류:', error);
    throw new Error(`설문조사 응답을 불러오는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 설문조사 응답 상세 조회
 * @param responseId 응답 ID
 * @returns 설문조사 응답 또는 null
 */
export const fetchSurveyResponse = async (responseId: string): Promise<SurveyResponse | null> => {
  try {
    const response = await client.graphql({
      query: getSurveyResponse,
      variables: { responseId }
    });
    
    const data = safelyExtractData<GetSurveyResponseResult>(response);
    if (!data?.getSurveyResponse) {
      return null;
    }
    
    return mapToFrontendModel(data.getSurveyResponse);
  } catch (error) {
    console.error(`설문조사 응답 조회 오류 (ID: \${responseId}):`, error);
    throw new Error(`설문조사 응답을 불러오는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 과정 설문조사 ID별 응답 조회
 * @param instanceId 설문조사 인스턴스 ID
 * @param limit 한 번에 가져올 항목 수
 * @param nextToken 페이지네이션 토큰
 * @returns 과정 설문조사별 응답 목록
 */
export const fetchSurveyResponsesByInstance = async (
  instanceId: string,
  limit: number = 100,
  nextToken?: string
): Promise<{ items: SurveyResponse[]; nextToken?: string | null }> => {
  try {
    const response = await client.graphql({
      query: getSurveyResponsesByCourseSurveyId,
      variables: { instanceId, limit, nextToken }
    });
    
    const data = safelyExtractData<ListSurveyResponsesResult>(response);
    if (!data?.getSurveyResponsesByCourseSurveyId?.items) {
      return { items: [] };
    }
    
    return {
      items: data.getSurveyResponsesByCourseSurveyId.items.map(mapToFrontendModel),
      nextToken: data.getSurveyResponsesByCourseSurveyId.nextToken
    };
  } catch (error) {
    console.error(`과정 설문조사별 응답 조회 오류 (ID: \${instanceId}):`, error);
    throw new Error(`설문조사 인스턴스별 응답을 불러오는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 학생 ID별 응답 조회
 * @param studentId 학생 ID
 * @param limit 한 번에 가져올 항목 수
 * @param nextToken 페이지네이션 토큰
 * @returns 학생별 응답 목록
 */
export const fetchSurveyResponsesByStudent = async (
  studentId: string,
  limit: number = 100,
  nextToken?: string
): Promise<{ items: SurveyResponse[]; nextToken?: string | null }> => {
  try {
    const response = await client.graphql({
      query: getSurveyResponsesByStudentId,
      variables: { studentId, limit, nextToken }
    });
    
    const data = safelyExtractData<ListSurveyResponsesResult>(response);
    if (!data?.getSurveyResponsesByStudentId?.items) {
      return { items: [] };
    }
    
    return {
      items: data.getSurveyResponsesByStudentId.items.map(mapToFrontendModel),
      nextToken: data.getSurveyResponsesByStudentId.nextToken
    };
  } catch (error) {
    console.error(`학생별 응답 조회 오류 (ID: \${studentId}):`, error);
    throw new Error(`학생별 응답을 불러오는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 설문조사 응답 통계 조회
 * @param instanceId 설문조사 인스턴스 ID
 * @returns 설문조사 응답 통계
 */
export const fetchSurveyResponseStatistics = async (instanceId: string): Promise<any> => {
  try {
    const response = await client.graphql({
      query: getSurveyResponseStatistics,
      variables: { instanceId }
    });
    
    const data = safelyExtractData<GetSurveyResponseStatisticsResult>(response);
    if (!data?.getSurveyResponseStatistics) {
      return null;
    }
    
    return data.getSurveyResponseStatistics;
  } catch (error) {
    console.error(`설문조사 응답 통계 조회 오류 (ID: \${instanceId}):`, error);
    throw new Error(`설문조사 응답 통계를 불러오는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 설문조사 응답 생성
 * @param input 설문조사 응답 생성 입력 데이터
 * @returns 생성된 설문조사 응답
 */
export const createSurveyResponse = async (input: SurveyResponseInput): Promise<SurveyResponse> => {
  try {
    const apiInput: CreateSurveyResponseInput = {
      ...input
    };
    
    const response = await client.graphql({
      query: createSurveyResponseMutation,
      variables: { input: apiInput }
    });
    
    const data = safelyExtractData<CreateSurveyResponseResult>(response);
    if (!data?.createSurveyResponse) {
      throw new Error('설문조사 응답 생성에 실패했습니다.');
    }
    
    return mapToFrontendModel(data.createSurveyResponse);
  } catch (error) {
    console.error('설문조사 응답 생성 오류:', error);
    throw new Error(`설문조사 응답 생성에 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 설문조사 응답 업데이트
 * @param responseId 응답 ID
 * @param input 설문조사 응답 업데이트 입력 데이터
 * @returns 업데이트된 설문조사 응답
 */
export const updateSurveyResponse = async (
  responseId: string,
  input: SurveyResponseUpdate
): Promise<SurveyResponse> => {
  try {
    const apiInput: UpdateSurveyResponseInput = {
      responseId,
      ...input
    };
    
    const response = await client.graphql({
      query: updateSurveyResponseMutation,
      variables: { input: apiInput }
    });
    
    const data = safelyExtractData<UpdateSurveyResponseResult>(response);
    if (!data?.updateSurveyResponse) {
      throw new Error('설문조사 응답 업데이트에 실패했습니다.');
    }
    
    return mapToFrontendModel(data.updateSurveyResponse);
  } catch (error) {
    console.error(`설문조사 응답 업데이트 오류 (ID: \${responseId}):`, error);
    throw new Error(`설문조사 응답 업데이트에 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 설문조사 응답 삭제
 * @param responseId 응답 ID
 * @returns 삭제 성공 여부
 */
export const deleteSurveyResponse = async (responseId: string): Promise<{ success: boolean }> => {
  try {
    const response = await client.graphql({
      query: deleteSurveyResponseMutation,
      variables: { responseId }
    });
    
    const data = safelyExtractData<DeleteSurveyResponseResult>(response);
    if (!data?.deleteSurveyResponse?.responseId) {
      throw new Error('설문조사 응답 삭제에 실패했습니다.');
    }
    
    return { success: true };
  } catch (error) {
    console.error(`설문조사 응답 삭제 오류 (ID: \${responseId}):`, error);
    throw new Error(`설문조사 응답 삭제에 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};