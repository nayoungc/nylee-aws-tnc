// src/services/api/catalogApi.ts
import { generateClient } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';
import { safelyExtractData } from '@utils/graphql';  // 경로 별칭 대신 상대 경로 사용

// 카탈로그 관련 쿼리와 뮤테이션
import { 
  listCourseCatalogs, 
  getCourseCatalog,
  searchCatalog,
  getCatalogByCategory 
} from '@graphql/catalog';  // 경로 별칭 대신 상대 경로 사용
import { 
  createCourseCatalog, 
  updateCourseCatalog,
  deleteCourseCatalog 
} from '@graphql/catalog';  // 경로 별칭 대신 상대 경로 사용
import {
  ListCourseCatalogsResult,
  GetCourseCatalogResult,
  SearchCatalogResult,
  GetCatalogByCategoryResult,
  CreateCourseCatalogResult,
  UpdateCourseCatalogResult,
  DeleteCourseCatalogResult,
  CatalogFilterInput
} from '@graphql/catalog';  // 경로 별칭 대신 상대 경로 사용

// 모델과 모의 데이터
import { CatalogFilter, CourseCatalog, CourseCatalogInput } from '@models/catalog';  // 경로 별칭 대신 상대 경로 사용
import { mockCatalogs } from '../../mocks/catalogData';
import { CalendarEvent } from '@models/calendar';  // 추가된 타입

// Amplify API 클라이언트 생성
const client = generateClient();

// 개발 모드 여부
const DEV_MODE = true;

/**
 * 모든 코스 카탈로그 가져오기
 */
export const fetchAllCatalogs = async (): Promise<CourseCatalog[]> => {
  // 개발 모드인 경우 모의 데이터 사용
  if (DEV_MODE) {
    console.log('[DEV_MODE] 모의 카탈로그 데이터 사용 중');
    return Promise.resolve([...mockCatalogs]);
  }

  try {
    const response = await client.graphql({
      query: listCourseCatalogs
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<ListCourseCatalogsResult>(response);
    return data?.listCourseCatalogs?.items || [];
  } catch (error: unknown) {
    console.error('카탈로그 목록 조회 오류:', error);
    throw error;
  }
};

/**
 * ID로 특정 카탈로그 가져오기
 */
export const fetchCatalogById = async (id: string): Promise<CourseCatalog | null> => {
  // 개발 모드인 경우 모의 데이터 사용
  if (DEV_MODE) {
    console.log(`[DEV_MODE] ID \${id}로 모의 카탈로그 조회`);
    const catalog = mockCatalogs.find(c => c.id === id);
    return Promise.resolve(catalog || null);
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
    console.error(`카탈로그 조회 오류 (ID: \${id}):`, error);
    throw error;
  }
};

/**
 * 필터를 사용하여 카탈로그 검색
 */
export const searchCatalogs = async (filter: CatalogFilter = {}): Promise<CourseCatalog[]> => {
  // 개발 모드인 경우 모의 데이터 필터링
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 필터로 모의 카탈로그 검색: \${JSON.stringify(filter)}`);
    let filteredCatalogs = [...mockCatalogs];
    
    // 레벨 필터링
    if (filter.level) {
      filteredCatalogs = filteredCatalogs.filter(c => c.level === filter.level);
    }
    
    // 카테고리 필터링
    if (filter.category) {
      filteredCatalogs = filteredCatalogs.filter(c => c.category === filter.category);
    }
    
    // 텍스트 검색
    if (filter.text) {
      const searchText = filter.text.toLowerCase();
      filteredCatalogs = filteredCatalogs.filter(c => 
        c.title.toLowerCase().includes(searchText) ||
        (c.description && c.description.toLowerCase().includes(searchText)) ||
        (c.awsCode && c.awsCode.toLowerCase().includes(searchText)) ||
        (c.tags && c.tags.some(tag => tag.toLowerCase().includes(searchText)))
      );
    }
    
    // 태그 필터링
    if (filter.tags && filter.tags.length > 0) {
      filteredCatalogs = filteredCatalogs.filter(c => 
        c.tags && c.tags.some(tag => 
          filter.tags!.includes(tag)
        )
      );
    }
    
    return Promise.resolve(filteredCatalogs);
  }

  try {
    const variables = { filter: filter as CatalogFilterInput };
    const response = await client.graphql({
      query: searchCatalog,
      variables
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<SearchCatalogResult>(response);
    return data?.searchCatalog || [];
  } catch (error: unknown) {
    console.error('카탈로그 검색 오류:', error);
    throw error;
  }
};

/**
 * 카테고리별 카탈로그 조회
 */
export const fetchCatalogsByCategory = async (category: string): Promise<CourseCatalog[]> => {
  // 개발 모드인 경우 모의 데이터 필터링
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 카테고리 "\${category}"로 모의 카탈로그 조회`);
    const filteredCatalogs = mockCatalogs.filter(c => c.category === category);
    return Promise.resolve(filteredCatalogs);
  }

  try {
    const response = await client.graphql({
      query: getCatalogByCategory,
      variables: { category }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<GetCatalogByCategoryResult>(response);
    return data?.getCatalogByCategory || [];
  } catch (error: unknown) {
    console.error(`카테고리별 카탈로그 조회 오류 (\${category}):`, error);
    throw error;
  }
};

/**
 * 새 카탈로그 생성
 */
export const createCatalog = async (input: CourseCatalogInput): Promise<CourseCatalog> => {
  // 개발 모드인 경우 모의 데이터에 추가
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 새 카탈로그 생성: \${input.title}`);
    const newCatalog: CourseCatalog = {
      id: uuidv4(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockCatalogs.push(newCatalog);
    return Promise.resolve({...newCatalog});
  }

  try {
    const response = await client.graphql({
      query: createCourseCatalog,
      variables: { input }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<CreateCourseCatalogResult>(response);
    if (!data?.createCourseCatalog) {
      throw new Error('카탈로그 생성 응답이 유효하지 않습니다');
    }
    
    return data.createCourseCatalog;
  } catch (error: unknown) {
    console.error('카탈로그 생성 오류:', error);
    throw error;
  }
};

/**
 * 카탈로그 수정
 */
export const updateCatalog = async (id: string, input: Partial<CourseCatalogInput>): Promise<CourseCatalog> => {
  // 개발 모드인 경우 모의 데이터 수정
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 카탈로그 수정 ID: \${id}`);
    const index = mockCatalogs.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(`ID가 \${id}인 카탈로그를 찾을 수 없습니다`);
    }
    
    const updatedCatalog = {
      ...mockCatalogs[index],
      ...input,
      updatedAt: new Date().toISOString()
    };
    
    mockCatalogs[index] = updatedCatalog;
    return Promise.resolve({...updatedCatalog});
  }

  try {
    const response = await client.graphql({
      query: updateCourseCatalog,
      variables: { input: { id, ...input } }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<UpdateCourseCatalogResult>(response);
    if (!data?.updateCourseCatalog) {
      throw new Error(`ID가 \${id}인 카탈로그 수정 응답이 유효하지 않습니다`);
    }
    
    return data.updateCourseCatalog;
  } catch (error: unknown) {
    console.error(`카탈로그 수정 오류 (ID: \${id}):`, error);
    throw error;
  }
};

/**
 * 카탈로그 삭제
 */
export const deleteCatalog = async (id: string): Promise<{ success: boolean }> => {
  // 개발 모드인 경우 모의 데이터에서 삭제
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 카탈로그 삭제 ID: \${id}`);
    const index = mockCatalogs.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(`ID가 \${id}인 카탈로그를 찾을 수 없습니다`);
    }
    
    mockCatalogs.splice(index, 1);
    return Promise.resolve({ success: true });
  }

  try {
    const response = await client.graphql({
      query: deleteCourseCatalog,
      variables: { input: { id } }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<DeleteCourseCatalogResult>(response);
    return { success: !!data?.deleteCourseCatalog?.id };
  } catch (error: unknown) {
    console.error(`카탈로그 삭제 오류 (ID: \${id}):`, error);
    throw error;
  }
};
