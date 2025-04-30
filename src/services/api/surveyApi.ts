// src/api/surveyApi.ts
/**
 * 설문조사 API 서비스
 * @description 설문조사의 CRUD 및 관리 기능을 제공하는 API 서비스 - Zod 검증 포함
 */

import { generateClient } from 'aws-amplify/api';
import { safelyExtractData } from '@/utils/graphql';
import {
  getSurvey,
  listSurveys,
  getSurveysByCatalog,
  getSurveysByCourse,
  createSurvey as createSurveyMutation,
  updateSurvey as updateSurveyMutation,
  deleteSurvey as deleteSurveyMutation,
  updateSurveyStatus as updateSurveyStatusMutation,
  sendSurveyReminders as sendSurveyRemindersMutation,
  ApiSurvey,
  ListSurveysApiResult,
  GetSurveyResult,
  CreateSurveyApiInput,
  UpdateSurveyApiInput,
  CreateSurveyResult,
  UpdateSurveyResult,
  SendRemindersResult,
  ModelSurveyFilterInput
} from '@/graphql/survey';

import {
  Survey,
  SurveySchema,
  CreateSurveyInput,
  CreateSurveyInputSchema,
  UpdateSurveyInput,
  UpdateSurveyInputSchema,
  InstanceStatus,
  SurveyFilter,
  SurveyFilterSchema,
  ListSurveysResult,
  ListSurveysResultSchema
} from '@/models/survey';

import { ZodError } from 'zod';
import i18n from '@/i18n';

// Amplify API 클라이언트 생성
const client = generateClient();

/**
 * Zod 오류 메시지를 사용자 친화적인 형식으로 포맷팅
 * @param error Zod 오류 객체
 * @returns 포맷된 오류 메시지
 */
function formatZodError(error: ZodError): string {
  return error.errors.map(err => {
    const path = err.path.join('.');
    return `\${path ? path + ': ' : ''}\${err.message}`;
  }).join('; ');
}

/**
 * API 응답을 프론트엔드 모델로 변환
 * @param apiSurvey API에서 반환된 설문조사 데이터
 * @returns 프론트엔드 모델 형식의 설문조사
 */
const mapToFrontendModel = (apiSurvey: ApiSurvey): Survey => {
  try {
    return SurveySchema.parse(apiSurvey);
  } catch (zodError) {
    if (zodError instanceof ZodError) {
      console.error('Invalid survey data format:', formatZodError(zodError));
    }
    // 스키마 검증에 실패하더라도 데이터는 가능한 반환
    return apiSurvey as unknown as Survey;
  }
};

/**
 * 필터를 API 필터 형식으로 변환
 * @param filter 프론트엔드 필터
 * @returns API 필터 형식
 */
const mapToApiFilter = (filter?: SurveyFilter): ModelSurveyFilterInput | undefined => {
  if (!filter) return undefined;
  
  try {
    SurveyFilterSchema.parse(filter);
  } catch (zodError) {
    if (zodError instanceof ZodError) {
      console.error('Invalid filter format:', formatZodError(zodError));
      throw new Error(`Invalid filter: \${formatZodError(zodError)}`);
    }
  }
  
  const apiFilter: ModelSurveyFilterInput = {};
  
  if (filter.surveyCatalogId?.eq) {
    apiFilter.surveyCatalogId = { eq: filter.surveyCatalogId.eq };
  }
  
  if (filter.courseId?.eq) {
    apiFilter.courseId = { eq: filter.courseId.eq };
  }
  
  if (filter.status?.eq) {
    apiFilter.status = { eq: filter.status.eq };
  }
  
  if (filter.startDate?.ge || filter.startDate?.le) {
    apiFilter.startDate = {};
    if (filter.startDate.ge) apiFilter.startDate.ge = filter.startDate.ge;
    if (filter.startDate.le) apiFilter.startDate.le = filter.startDate.le;
  }
  
  if (filter.endDate?.ge || filter.endDate?.le) {
    apiFilter.endDate = {};
    if (filter.endDate.ge) apiFilter.endDate.ge = filter.endDate.ge;
    if (filter.endDate.le) apiFilter.endDate.le = filter.endDate.le;
  }
  
  return apiFilter;
};

/**
 * 단일 설문조사 조회
 * @param instanceId 설문조사 인스턴스 ID
 * @returns 설문조사 정보 또는 null
 */
export const fetchSurvey = async (instanceId: string): Promise<Survey | null> => {
  try {
    const response = await client.graphql({
      query: getSurvey,
      variables: { instanceId }
    });
    
    const data = safelyExtractData<GetSurveyResult>(response);
    if (!data?.getSurvey) {
      return null;
    }
    
    return mapToFrontendModel(data.getSurvey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    throw new Error(i18n.t('errors.failedToGetSurvey', { error: error instanceof Error ? error.message : String(error) }));
  }
};

/**
 * 설문조사 목록 조회
 * @param filter 설문조사 필터 조건
 * @param limit 한 번에 가져올 항목 수
 * @param nextToken 페이지네이션 토큰
 * @returns 설문조사 목록 및 페이지네이션 정보
 */
export const fetchSurveysList = async (
  filter?: SurveyFilter,
  limit: number = 50,
  nextToken?: string
): Promise<ListSurveysResult> => {
  try {
    const apiFilter = mapToApiFilter(filter);
    
    const response = await client.graphql({
      query: listSurveys,
      variables: { filter: apiFilter, limit, nextToken }
    });
    
    const data = safelyExtractData<ListSurveysApiResult>(response);
    if (!data?.listSurveys) {
      return { items: [] };
    }
    
    const result = {
      items: data.listSurveys.items.map(mapToFrontendModel),
      nextToken: data.listSurveys.nextToken || undefined
    };
    
    try {
      return ListSurveysResultSchema.parse(result);
    } catch (zodError) {
      if (zodError instanceof ZodError) {
        console.error('Invalid survey list data:', formatZodError(zodError));
      }
      return result;
    }
  } catch (error) {
    console.error('Error listing surveys:', error);
    throw new Error(i18n.t('errors.failedToListSurveys', { error: error instanceof Error ? error.message : String(error) }));
  }
};

/**
 * 카탈로그별 설문조사 목록 조회
 * @param surveyCatalogId 설문조사 카탈로그 ID
 * @param limit 한 번에 가져올 항목 수
 * @param nextToken 페이지네이션 토큰
 * @returns 설문조사 목록 및 페이지네이션 정보
 */
export const fetchSurveysByCatalog = async (
  surveyCatalogId: string,
  limit: number = 50,
  nextToken?: string
): Promise<ListSurveysResult> => {
  try {
    const response = await client.graphql({
      query: getSurveysByCatalog,
      variables: { surveyCatalogId, limit, nextToken }
    });
    
    const data = safelyExtractData<ListSurveysApiResult>(response);
    if (!data?.getSurveysByCatalog) {
      return { items: [] };
    }
    
    const result = {
      items: data.getSurveysByCatalog.items.map(mapToFrontendModel),
      nextToken: data.getSurveysByCatalog.nextToken || undefined
    };
    
    try {
      return ListSurveysResultSchema.parse(result);
    } catch (zodError) {
      if (zodError instanceof ZodError) {
        console.error('Invalid survey catalog data:', formatZodError(zodError));
      }
      return result;
    }
  } catch (error) {
    console.error('Error fetching surveys by catalog:', error);
    throw new Error(i18n.t('errors.failedToGetSurveysByCatalog', { error: error instanceof Error ? error.message : String(error) }));
  }
};

/**
 * 코스별 설문조사 목록 조회
 * @param courseId 코스 ID
 * @param limit 한 번에 가져올 항목 수
 * @param nextToken 페이지네이션 토큰
 * @returns 설문조사 목록 및 페이지네이션 정보
 */
export const fetchSurveysByCourse = async (
  courseId: string,
  limit: number = 50,
  nextToken?: string
): Promise<ListSurveysResult> => {
  try {
    const response = await client.graphql({
      query: getSurveysByCourse,
      variables: { courseId, limit, nextToken }
    });
    
    const data = safelyExtractData<ListSurveysApiResult>(response);
    if (!data?.getSurveysByCourse) {
      return { items: [] };
    }
    
    const result = {
      items: data.getSurveysByCourse.items.map(mapToFrontendModel),
      nextToken: data.getSurveysByCourse.nextToken || undefined
    };
    
    try {
      return ListSurveysResultSchema.parse(result);
    } catch (zodError) {
      if (zodError instanceof ZodError) {
        console.error('Invalid survey course data:', formatZodError(zodError));
      }
      return result;
    }
  } catch (error) {
    console.error('Error fetching surveys by course:', error);
    throw new Error(i18n.t('errors.failedToGetSurveysByCourse', { error: error instanceof Error ? error.message : String(error) }));
  }
};

/**
 * 설문조사 생성
 * @param input 설문조사 생성 입력 데이터
 * @returns 생성된 설문조사 정보
 */
export const createSurvey = async (input: CreateSurveyInput): Promise<Survey> => {
  try {
    // 입력 데이터 검증
    try {
      CreateSurveyInputSchema.parse(input);
    } catch (zodError) {
      if (zodError instanceof ZodError) {
        throw new Error(`Invalid survey input: \${formatZodError(zodError)}`);
      }
      throw zodError;
    }

    const apiInput: CreateSurveyApiInput = input as unknown as CreateSurveyApiInput;
    
    const response = await client.graphql({
      query: createSurveyMutation,
      variables: { input: apiInput }
    });
    
    const data = safelyExtractData<CreateSurveyResult>(response);
    if (!data?.createSurvey) {
      throw new Error('Failed to create survey: No data returned');
    }
    
    return mapToFrontendModel(data.createSurvey);
  } catch (error) {
    console.error('Error creating survey:', error);
    throw new Error(i18n.t('errors.failedToCreateSurvey', { error: error instanceof Error ? error.message : String(error) }));
  }
};

/**
 * 설문조사 업데이트
 * @param input 설문조사 업데이트 입력 데이터
 * @returns 업데이트된 설문조사 정보
 */
export const updateSurvey = async (input: UpdateSurveyInput): Promise<Survey> => {
  try {
    // 입력 데이터 검증
    try {
      UpdateSurveyInputSchema.parse(input);
    } catch (zodError) {
      if (zodError instanceof ZodError) {
        throw new Error(`Invalid update input: \${formatZodError(zodError)}`);
      }
      throw zodError;
    }

    const apiInput: UpdateSurveyApiInput = input as unknown as UpdateSurveyApiInput;
    
    const response = await client.graphql({
      query: updateSurveyMutation,
      variables: { input: apiInput }
    });
    
    const data = safelyExtractData<UpdateSurveyResult>(response);
    if (!data?.updateSurvey) {
      throw new Error('Failed to update survey: No data returned');
    }
    
    return mapToFrontendModel(data.updateSurvey);
  } catch (error) {
    console.error('Error updating survey:', error);
    throw new Error(i18n.t('errors.failedToUpdateSurvey', { error: error instanceof Error ? error.message : String(error) }));
  }
};

/**
 * 설문조사 삭제
 * @param instanceId 설문조사 인스턴스 ID
 * @returns 삭제 성공 여부
 */
export const deleteSurvey = async (instanceId: string): Promise<boolean> => {
  try {
    const response = await client.graphql({
      query: deleteSurveyMutation,
      variables: { instanceId }
    });
    
    const data = safelyExtractData<{ deleteSurvey: { instanceId: string } }>(response);
    return !!data?.deleteSurvey?.instanceId;
  } catch (error) {
    console.error('Error deleting survey:', error);
    throw new Error(i18n.t('errors.failedToDeleteSurvey', { error: error instanceof Error ? error.message : String(error) }));
  }
};

/**
 * 설문조사 상태 업데이트
 * @param instanceId 설문조사 인스턴스 ID
 * @param status 새 상태
 * @returns 업데이트된 설문조사 정보
 */
export const updateSurveyStatus = async (instanceId: string, status: InstanceStatus): Promise<Survey> => {
  try {
    const response = await client.graphql({
      query: updateSurveyStatusMutation,
      variables: { instanceId, status }
    });
    
    const data = safelyExtractData<UpdateSurveyResult>(response);
    if (!data?.updateSurveyStatus) {
      throw new Error('Failed to update survey status: No data returned');
    }
    
    return mapToFrontendModel(data.updateSurveyStatus);
  } catch (error) {
    console.error('Error updating survey status:', error);
    throw new Error(i18n.t('errors.failedToUpdateSurveyStatus', { error: error instanceof Error ? error.message : String(error) }));
  }
};

/**
 * 설문조사 알림 전송
 * @param instanceId 설문조사 인스턴스 ID
 * @returns 전송된 알림 수
 */
export const sendSurveyReminders = async (instanceId: string): Promise<number> => {
  try {
    const response = await client.graphql({
      query: sendSurveyRemindersMutation,
      variables: { instanceId }
    });
    
    const data = safelyExtractData<SendRemindersResult>(response);
    if (!data?.sendSurveyReminders) {
      throw new Error('Failed to send reminders: No data returned');
    }
    
    return data.sendSurveyReminders.sentCount;
  } catch (error) {
    console.error('Error sending survey reminders:', error);
    throw new Error(i18n.t('errors.failedToSendReminders', { error: error instanceof Error ? error.message : String(error) }));
  }
};