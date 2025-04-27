// src/services/api/courseCatalogApi.ts
import { generateClient } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';
import { safelyExtractData } from '@/utils/graphql'; 
import i18n from '@/i18n'; 

// 코스 카탈로그 관련 쿼리와 뮤테이션
import { 
  listCourseCatalogs,
  getCourseCatalog,
  searchCourseCatalogs as searchCourseCatalogsQuery,
  getCourseCatalogsByCategory as getCourseCatalogsByCategoryQuery,
  createCourseCatalog as createCourseCatalogMutation, 
  updateCourseCatalog as updateCourseCatalogMutation,
  deleteCourseCatalog as deleteCourseCatalogMutation
} from '@/graphql/courseCatalog';

import {
  ListCourseCatalogsResult,
  GetCourseCatalogResult,
  SearchCourseCatalogResult,
  GetCourseCatalogByCategoryResult,
  CreateCourseCatalogResult,
  UpdateCourseCatalogResult,
  DeleteCourseCatalogResult,
  SearchableCourseCatalogFilterInput
} from '@/graphql/courseCatalog';

import { CourseCatalogFilter, CourseCatalog, CourseCatalogInput } from '@/models/courseCatalog'; 
import { mockCourseCatalogs } from '../../mocks/catalogData'; 

const client = generateClient();

// 개발 모드 여부
const DEV_MODE = false; // 개발 시에는 true로, 프로덕션에서는 false로 설정

/**
 * 모든 코스 카탈로그 가져오기
 */
export const fetchAllCourseCatalogs = async (): Promise<CourseCatalog[]> => {
  console.log("코스 카탈로그 데이터 가져오기 시도");
    
  try {
    // GraphQL 쿼리 로깅
    console.log("GraphQL 쿼리:", listCourseCatalogs);
    
    const response = await client.graphql({
      query: listCourseCatalogs
    });
    
    // 전체 응답 로깅
    console.log("GraphQL 원본 응답:", JSON.stringify(response, null, 2));
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<ListCourseCatalogsResult>(response);
    console.log("추출된 데이터:", JSON.stringify(data, null, 2));
    
    const items = data?.listCourseCatalogs?.items || [];
    console.log("최종 반환 항목 수:", items.length);
    if (items.length > 0) {
      console.log("첫 번째 항목 샘플:", items[0]);
    } else {
      console.log("반환된 항목 없음");
    }
    
    return items;
  } catch (error: unknown) {
    console.error('코스 카탈로그 목록 조회 오류:', error);
    throw new Error(i18n.t('errors.failedToListCourseCatalogs', { error: String(error), ns: 'courseCatalog' }));
  }
};

/**
 * ID로 특정 코스 카탈로그 가져오기
 */
export const fetchCourseCatalogById = async (id: string): Promise<CourseCatalog | null> => {
  // 개발 모드인 경우 모의 데이터 사용
  if (DEV_MODE) {
    console.log(`[DEV_MODE] ID \${id}로 모의 코스 카탈로그 조회`);
    const courseCatalog = mockCourseCatalogs.find(c => c.id === id);
    return Promise.resolve(courseCatalog || null);
  }

  try {
    const response = await client.graphql({
      query: getCourseCatalog,
      variables: { id }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<GetCourseCatalogResult>(response);
    return data?.getCourseCatalog || null;
  } catch (error: unknown) {
    console.error(`코스 카탈로그 조회 오류 (ID: \${id}):`, error);
    throw new Error(i18n.t('errors.failedToGetCourseCatalog', { error: String(error), ns: 'courseCatalog' }));
  }
};

/**
 * 필터를 사용하여 코스 카탈로그 검색
 */
export const searchCourseCatalogs = async (filter: CourseCatalogFilter = {}): Promise<CourseCatalog[]> => {
  // 개발 모드인 경우 모의 데이터 필터링
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 필터로 모의 코스 카탈로그 검색: \${JSON.stringify(filter)}`);
    let filteredCourseCatalogs = [...mockCourseCatalogs];
    
    // 레벨 필터링
    if (filter.level) {
      filteredCourseCatalogs = filteredCourseCatalogs.filter(c => c.level === filter.level);
    }
    
    // 카테고리 필터링
    if (filter.category) {
      filteredCourseCatalogs = filteredCourseCatalogs.filter(c => c.category === filter.category);
    }
    
    // 텍스트 검색
    if (filter.text) {
      const searchText = filter.text.toLowerCase();
      filteredCourseCatalogs = filteredCourseCatalogs.filter(c => 
        c.title.toLowerCase().includes(searchText) ||
        (c.description && c.description.toLowerCase().includes(searchText)) ||
        (c.awsCode && c.awsCode.toLowerCase().includes(searchText)) ||
        (c.tags && c.tags.some((tag: string) => tag.toLowerCase().includes(searchText)))
      );
    }
    
    // 태그 필터링
    if (filter.tags && filter.tags.length > 0) {
      filteredCourseCatalogs = filteredCourseCatalogs.filter(c => 
        c.tags && c.tags.some((tag: string) => filter.tags!.includes(tag))
      );
    }
    
    return Promise.resolve(filteredCourseCatalogs);
  }

  try {
    // 클라이언트 필터를 SearchableCourseCatalogFilterInput으로 변환
    const searchFilter: SearchableCourseCatalogFilterInput = {};
    
    if (filter.text) {
      searchFilter.title = { match: filter.text };
      searchFilter.description = { match: filter.text };
    }
    
    if (filter.level) {
      searchFilter.level = { eq: filter.level };
    }
    
    if (filter.category) {
      searchFilter.category = { eq: filter.category };
    }
    
    if (filter.tags && filter.tags.length) {
      // 태그는 배열이므로 OR 조건으로 구성
      searchFilter.tags = { match: filter.tags.join(' OR ') };
    }
    
    const response = await client.graphql({
      query: searchCourseCatalogsQuery,
      variables: { filter: searchFilter }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<SearchCourseCatalogResult>(response);
    return data?.searchCourseCatalogs?.items || [];
  } catch (error: unknown) {
    console.error('코스 카탈로그 검색 오류:', error);
    throw new Error(i18n.t('errors.failedToSearchCourseCatalogs', { error: String(error), ns: 'courseCatalog' }));
  }
};

/**
 * 카테고리별 코스 카탈로그 조회
 */
export const fetchCourseCatalogsByCategory = async (category: string): Promise<CourseCatalog[]> => {
  // 개발 모드인 경우 모의 데이터 필터링
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 카테고리 "\${category}"로 모의 코스 카탈로그 조회`);
    const filteredCourseCatalogs = mockCourseCatalogs.filter(c => c.category === category);
    return Promise.resolve(filteredCourseCatalogs);
  }

  try {
    const response = await client.graphql({
      query: getCourseCatalogsByCategoryQuery,
      variables: { category }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<GetCourseCatalogByCategoryResult>(response);
    return data?.getCourseCatalogByCategory?.items || [];
  } catch (error: unknown) {
    console.error(`카테고리별 코스 카탈로그 조회 오류 (\${category}):`, error);
    throw new Error(i18n.t('errors.failedToGetCourseCatalogsByCategory', { category, error: String(error), ns: 'courseCatalog' }));
  }
};

/**
 * 새 코스 카탈로그 생성
 */
export const createCourseCatalog = async (input: CourseCatalogInput): Promise<CourseCatalog> => {
  // 개발 모드인 경우 모의 데이터에 추가
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 새 코스 카탈로그 생성: \${input.title}`);
    const newCourseCatalog: CourseCatalog = {
      id: uuidv4(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockCourseCatalogs.push(newCourseCatalog);
    return Promise.resolve({...newCourseCatalog});
  }

  try {
    const response = await client.graphql({
      query: createCourseCatalogMutation,
      variables: { input }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<CreateCourseCatalogResult>(response);
    if (!data?.createCourseCatalog) {
      throw new Error(i18n.t('errors.invalidCreateCourseCatalogResponse', { ns: 'courseCatalog' }));
    }
    
    return data.createCourseCatalog;
  } catch (error: unknown) {
    console.error('코스 카탈로그 생성 오류:', error);
    throw new Error(i18n.t('errors.failedToCreateCourseCatalog', { error: String(error), ns: 'courseCatalog' }));
  }
};

/**
 * 코스 카탈로그 수정
 */
export const updateCourseCatalog = async (id: string, input: Partial<CourseCatalogInput>): Promise<CourseCatalog> => {
  // 개발 모드인 경우 모의 데이터 수정
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 코스 카탈로그 수정 ID: \${id}`);
    const index = mockCourseCatalogs.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(i18n.t('errors.courseCatalogNotFound', { id, ns: 'courseCatalog' }));
    }
    
    const updatedCourseCatalog = {
      ...mockCourseCatalogs[index],
      ...input,
      updatedAt: new Date().toISOString()
    };
    
    mockCourseCatalogs[index] = updatedCourseCatalog;
    return Promise.resolve({...updatedCourseCatalog});
  }

  try {
    const response = await client.graphql({
      query: updateCourseCatalogMutation,
      variables: { input: { id, ...input } }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<UpdateCourseCatalogResult>(response);
    if (!data?.updateCourseCatalog) {
      throw new Error(i18n.t('errors.invalidUpdateCourseCatalogResponse', { id, ns: 'courseCatalog' }));
    }
    
    return data.updateCourseCatalog;
  } catch (error: unknown) {
    console.error(`코스 카탈로그 수정 오류 (ID: \${id}):`, error);
    throw new Error(i18n.t('errors.failedToUpdateCourseCatalog', { error: String(error), ns: 'courseCatalog' }));
  }
};

/**
 * 코스 카탈로그 삭제
 */
export const deleteCourseCatalog = async (id: string): Promise<{ success: boolean }> => {
  // 개발 모드인 경우 모의 데이터에서 삭제
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 코스 카탈로그 삭제 ID: \${id}`);
    const index = mockCourseCatalogs.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(i18n.t('errors.courseCatalogNotFound', { id, ns: 'courseCatalog' }));
    }
    
    mockCourseCatalogs.splice(index, 1);
    return Promise.resolve({ success: true });
  }

  try {
    const response = await client.graphql({
      query: deleteCourseCatalogMutation,
      variables: { input: { id } }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<DeleteCourseCatalogResult>(response);
    return { success: !!data?.deleteCourseCatalog?.id };
  } catch (error: unknown) {
    console.error(`코스 카탈로그 삭제 오류 (ID: \${id}):`, error);
    throw new Error(i18n.t('errors.failedToDeleteCourseCatalog', { error: String(error), ns: 'courseCatalog' }));
  }
};