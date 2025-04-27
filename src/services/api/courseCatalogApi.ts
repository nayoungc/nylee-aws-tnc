// src/services/api/courseCatalogApi.ts
import { generateClient } from 'aws-amplify/api';
import { listCourseCatalogs, getCourseCatalog } from '@/graphql/courseCatalog';
import { ListCourseCatalogsResult, GetCourseCatalogResult } from '@/graphql/courseCatalog';
import { CourseCatalog, CourseCatalogFilter } from '@/models/courseCatalog';
import { safelyExtractData as extractData } from '@/utils/graphql';
import i18n from '@/i18n';

const client = generateClient();

/**
 * 모든 코스 카탈로그 가져오기
 */
export const fetchAllCourseCatalogs = async (): Promise<CourseCatalog[]> => {
  console.log("코스 카탈로그 데이터 가져오기 시도");
    
  try {
    const response = await client.graphql({
      query: listCourseCatalogs,
      variables: { limit: 1000 }
    });
    
    const data = extractData<ListCourseCatalogsResult>(response);
    return data?.listCourseCatalog?.items || [];
  } catch (error: unknown) {
    console.error('코스 카탈로그 목록 조회 오류:', error);
    throw new Error(i18n.t('errors.failedToListCourseCatalogs', { error: String(error), ns: 'courseCatalog' }));
  }
};

/**
 * ID로 특정 코스 카탈로그 가져오기
 */
export const fetchCourseCatalogById = async (id: string): Promise<CourseCatalog | null> => {
  try {
    const response = await client.graphql({
      query: getCourseCatalog,
      variables: { id }
    });
    
    const data = extractData<GetCourseCatalogResult>(response);
    return data?.getCourseCatalog || null;
  } catch (error: unknown) {
    console.error(`코스 카탈로그 조회 오류 (ID: \${id}):`, error);
    throw new Error(i18n.t('errors.failedToGetCourseCatalog', { error: String(error), ns: 'courseCatalog' }));
  }
};

/**
 * 필터를 사용한 코스 카탈로그 검색 (클라이언트 측 구현)
 */
export const searchCourseCatalogs = async (filter: CourseCatalogFilter = {}): Promise<CourseCatalog[]> => {
  try {
    // 필터가 없으면 전체 목록 반환
    if (Object.keys(filter).length === 0) {
      return await fetchAllCourseCatalogs();
    }
    
    // 클라이언트 측 필터링 (필요한 경우)
    const catalogs = await fetchAllCourseCatalogs();
    
    return catalogs.filter(catalog => {
      // 텍스트 검색
      if (filter.text) {
        const searchText = filter.text.toLowerCase();
        const searchFields = [
          catalog.course_name,
          catalog.description,
          catalog.course_id,
          catalog.level
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchFields.includes(searchText)) return false;
      }
      
      // 레벨 필터링
      if (filter.level && catalog.level !== filter.level) return false;
      
      // 카테고리/대상 필터링 (변경된 필드 이름 사용)
      if (filter.target_audience && catalog.target_audience !== filter.target_audience) return false;
      
      return true;
    });
  } catch (error) {
    console.error('코스 카탈로그 검색 오류:', error);
    throw error;
  }
};

/**
 * 카테고리별 코스 카탈로그 검색 (클라이언트 측 구현)
 */
export const fetchCourseCatalogsByCategory = async (category: string): Promise<CourseCatalog[]> => {
  try {
    const catalogs = await fetchAllCourseCatalogs();
    return catalogs.filter(catalog => catalog.target_audience === category);
  } catch (error: unknown) {
    console.error(`카테고리별 코스 카탈로그 조회 오류 (\${category}):`, error);
    throw new Error(i18n.t('errors.failedToGetCourseCatalogsByCategory', { category, error: String(error), ns: 'courseCatalog' }));
  }
};