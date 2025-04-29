// src/api/courseCatalogApi.ts
import { generateClient } from 'aws-amplify/api';
import { safelyExtractData } from '@/utils/graphql';
import { 
  listCourseCatalogs, 
  getCourseCatalog, 
  createCourseCatalog as createCourseCatalogMutation,
  updateCourseCatalog as updateCourseCatalogMutation,
  deleteCourseCatalog as deleteCourseCatalogMutation
} from '@/graphql/courseCatalog';
import {
  ApiCourseCatalog,
  ListCourseCatalogsResult,
  GetCourseCatalogResult,
  CreateCourseCatalogInput,
  UpdateCourseCatalogInput,
  DeleteCourseCatalogInput,
  CreateCourseCatalogResult,
  UpdateCourseCatalogResult,
  DeleteCourseCatalogResult,
  ModelCourseCatalogFilterInput
} from '@/graphql/courseCatalog/types';
import { CourseCatalog, CourseCatalogInput, CourseCatalogFilter, CourseCatalogStatus } from '@/models/courseCatalog';

// Amplify API 클라이언트 생성
const client = generateClient();

/**
 * API 응답을 프론트엔드 모델로 변환
 * @param apiCatalog API에서 반환된 카탈로그 데이터
 * @returns 프론트엔드 모델 형식의 카탈로그
 */
const mapToFrontendModel = (apiCatalog: ApiCourseCatalog): CourseCatalog => {
  // 상태 매핑
  const status = apiCatalog.status === "EOL" ? CourseCatalogStatus.EOL : CourseCatalogStatus.ACTIVE;
  
  return {
    id: apiCatalog.id,
    course_name: apiCatalog.course_name,
    course_id: apiCatalog.course_id,
    description: apiCatalog.description,
    level: apiCatalog.level as any,  // 타입 변환 필요
    duration: apiCatalog.duration,
    delivery_method: apiCatalog.delivery_method as any,  // 타입 변환 필요
    objectives: apiCatalog.objectives,
    target_audience: apiCatalog.target_audience,
    status,
    createdAt: apiCatalog.createdAt,
    updatedAt: apiCatalog.updatedAt,
    createdBy: apiCatalog.createdBy
  };
};

/**
 * 필터를 API 필터 형식으로 변환
 * @param filter 프론트엔드 필터
 * @returns API 필터 형식
 */
const mapToApiFilter = (filter: CourseCatalogFilter): ModelCourseCatalogFilterInput => {
  const apiFilter: ModelCourseCatalogFilterInput = {};
  
  if (filter.text) {
    const searchFilters: ModelCourseCatalogFilterInput[] = [
      { course_name: { contains: filter.text } },
      { course_id: { contains: filter.text } }
    ];
    
    // 백엔드에서 description 필드가 검색 필터로 지원되지 않는 경우,
    // 이 부분을 제거하거나 백엔드 스키마에 맞는 필드만 사용해야 합니다.
    // { description: { contains: filter.text } } 대신 다른 필드를 사용하세요.
    
    apiFilter.or = searchFilters;
  }
  
  if (filter.level) {
    apiFilter.level = { eq: filter.level };
  }
  
  if (filter.target_audience) {
    apiFilter.target_audience = { eq: filter.target_audience };
  }
  
  if (filter.status) {
    apiFilter.status = { eq: filter.status };
  }
  
  return apiFilter;
};

/**
 * 모든 코스 카탈로그 가져오기
 * @returns 코스 카탈로그 목록
 */
export const fetchAllCourseCatalogs = async (): Promise<CourseCatalog[]> => {
  try {
    const response = await client.graphql({
      query: listCourseCatalogs,
      variables: { limit: 1000 }
    });
    
    const data = safelyExtractData<ListCourseCatalogsResult>(response);
    if (!data?.listCourseCatalogs?.items) {
      return [];
    }
    
    return data.listCourseCatalogs.items.map(mapToFrontendModel);
  } catch (error) {
    console.error('코스 카탈로그 목록 조회 오류:', error);
    throw new Error(`코스 카탈로그를 불러오는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * ID로 특정 코스 카탈로그 가져오기
 * @param id 코스 ID
 * @returns 코스 카탈로그 또는 null
 */
export const fetchCourseCatalogById = async (id: string): Promise<CourseCatalog | null> => {
  try {
    const response = await client.graphql({
      query: getCourseCatalog,
      variables: { id }
    });
    
    const data = safelyExtractData<GetCourseCatalogResult>(response);
    if (!data?.getCourseCatalog) {
      return null;
    }
    
    return mapToFrontendModel(data.getCourseCatalog);
  } catch (error) {
    console.error(`코스 카탈로그 조회 오류 (ID: \${id}):`, error);
    throw new Error(`코스 카탈로그를 불러오는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 필터를 사용하여 코스 카탈로그 검색
 * @param filter 검색 필터
 * @returns 필터링된 코스 카탈로그 목록
 */
export const searchCourseCatalogs = async (filter: CourseCatalogFilter = {}): Promise<CourseCatalog[]> => {
  try {
    const apiFilter = mapToApiFilter(filter);
    
    const response = await client.graphql({
      query: listCourseCatalogs,
      variables: { filter: apiFilter, limit: 1000 }
    });
    
    const data = safelyExtractData<ListCourseCatalogsResult>(response);
    if (!data?.listCourseCatalogs?.items) {
      return [];
    }
    
    return data.listCourseCatalogs.items.map(mapToFrontendModel);
  } catch (error) {
    console.error('코스 카탈로그 검색 오류:', error);
    throw new Error(`코스 카탈로그 검색에 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 카테고리별 코스 카탈로그 검색
 * @param category 카테고리
 * @returns 해당 카테고리의 코스 카탈로그 목록
 */
export const fetchCourseCatalogsByCategory = async (category: string): Promise<CourseCatalog[]> => {
  try {
    const filter: ModelCourseCatalogFilterInput = {
      target_audience: { eq: category }
    };
    
    const response = await client.graphql({
      query: listCourseCatalogs,
      variables: { filter, limit: 1000 }
    });
    
    const data = safelyExtractData<ListCourseCatalogsResult>(response);
    if (!data?.listCourseCatalogs?.items) {
      return [];
    }
    
    return data.listCourseCatalogs.items.map(mapToFrontendModel);
  } catch (error) {
    console.error(`카테고리별 코스 카탈로그 조회 오류 (\${category}):`, error);
    throw new Error(`카테고리별 코스 카탈로그를 불러오는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 새 코스 카탈로그 생성
 * @param input 코스 카탈로그 입력 데이터
 * @returns 생성된 코스 카탈로그
 */
export const createCourseCatalog = async (input: CourseCatalogInput): Promise<CourseCatalog> => {
  try {
    const apiInput: CreateCourseCatalogInput = {
      ...input,
      // 열거형 값은 문자열로 변환
      status: input.status
    };
    
    const response = await client.graphql({
      query: createCourseCatalogMutation,
      variables: { input: apiInput }
    });
    
    const data = safelyExtractData<CreateCourseCatalogResult>(response);
    if (!data?.createCourseCatalog) {
      throw new Error('코스 카탈로그 생성에 실패했습니다.');
    }
    
    return mapToFrontendModel(data.createCourseCatalog);
  } catch (error) {
    console.error('코스 카탈로그 생성 오류:', error);
    throw new Error(`코스 카탈로그 생성에 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 코스 카탈로그 수정
 * @param id 코스 ID
 * @param input 수정할 데이터
 * @returns 수정된 코스 카탈로그
 */
export const updateCourseCatalog = async (id: string, input: Partial<CourseCatalogInput>): Promise<CourseCatalog> => {
  try {
    const apiInput: UpdateCourseCatalogInput = {
      id,
      ...input,
      // 열거형 값은 문자열로 변환
      status: input.status
    };
    
    const response = await client.graphql({
      query: updateCourseCatalogMutation,
      variables: { input: apiInput }
    });
    
    const data = safelyExtractData<UpdateCourseCatalogResult>(response);
    if (!data?.updateCourseCatalog) {
      throw new Error('코스 카탈로그 업데이트에 실패했습니다.');
    }
    
    return mapToFrontendModel(data.updateCourseCatalog);
  } catch (error) {
    console.error(`코스 카탈로그 업데이트 오류 (ID: \${id}):`, error);
    throw new Error(`코스 카탈로그 업데이트에 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * 코스 카탈로그 삭제
 * @param id 삭제할 코스 ID
 * @returns 삭제 성공 여부
 */
export const deleteCourseCatalog = async (id: string): Promise<{ success: boolean }> => {
  try {
    const input: DeleteCourseCatalogInput = { id };
    
    const response = await client.graphql({
      query: deleteCourseCatalogMutation,
      variables: { input }
    });
    
    const data = safelyExtractData<DeleteCourseCatalogResult>(response);
    if (!data?.deleteCourseCatalog?.id) {
      throw new Error('코스 카탈로그 삭제에 실패했습니다.');
    }
    
    return { success: true };
  } catch (error) {
    console.error(`코스 카탈로그 삭제 오류 (ID: \${id}):`, error);
    throw new Error(`코스 카탈로그 삭제에 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};