// src/services/api/courseCatalogApi.ts
import { generateClient } from 'aws-amplify/api';
import {
  listCourseCatalogs,
  getCourseCatalog,
  createCourseCatalog as createCourseCatalogMutation,
  updateCourseCatalog as updateCourseCatalogMutation,
  deleteCourseCatalog as deleteCourseCatalogMutation
} from '@/graphql/courseCatalog';
import {
  ListCourseCatalogsResult,
  GetCourseCatalogResult,
  CreateCourseCatalogInput,
  UpdateCourseCatalogInput,
  DeleteCourseCatalogInput,
  CreateCourseCatalogResult,
  UpdateCourseCatalogResult,
  DeleteCourseCatalogResult
} from '@/graphql/courseCatalog';
import { CourseCatalog } from '@/models/courseCatalog';
import { safelyExtractData as extractData } from '@/utils/graphql';
import i18n from '@/i18n';

// CourseCatalogFilter 타입 정의
export interface CourseCatalogFilter {
  text?: string;
  level?: string;
  target_audience?: string;
  objectives?: string[];
}

const client = generateClient();

// CourseCatalogStatus enum을 완전히 제거하고 string literal 사용
type StatusType = "PUBLISHED" | "DRAFT" | "ARCHIVED";

/**
 * 모든 코스 카탈로그 가져오기
 */
// src/services/api/courseCatalogApi.ts
export const fetchAllCourseCatalogs = async (): Promise<CourseCatalog[]> => {
  console.log("코스 카탈로그 데이터 가져오기 시도");

  try {
    const response = await client.graphql({
      query: listCourseCatalogs,
      variables: { limit: 1000 }
    });

    console.log("API 응답:", JSON.stringify(response, null, 2));

    const data = extractData<ListCourseCatalogsResult>(response);
    
    // 백엔드 필드명 확인 
    if (!data?.listCourseCatalogs?.items) {
      console.warn("API에서 반환된 데이터가 없습니다:", data);
      return [];
    }

    const catalogs = data.listCourseCatalogs.items || [];
    return catalogs.map((catalog: CourseCatalog) => ({
      ...catalog,
      status: catalog.status || "DRAFT"
    }));
  } catch (error: unknown) {
    console.error('코스 카탈로그 목록 조회 오류:', error);

    if (error instanceof Error) {
      console.error('오류 메시지:', error.message);
      console.error('오류 스택:', error.stack);
    } else {
      console.error('알 수 없는 오류 유형:', typeof error);
    }
    
    // 백틱(``)으로 수정해서 템플릿 리터럴 작동하게 함
    throw new Error(`코스 카탈로그를 불러오는데 실패했습니다: \${String(error)}`);
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
    const catalog = data?.getCourseCatalog || null;

    // 결과가 있을 경우 status 매핑
    if (catalog) {
      let status: StatusType = "DRAFT";

      // status 매핑 (ACTIVE → PUBLISHED)
      if (catalog.status) {
        if (catalog.status === "ACTIVE") {
          status = "PUBLISHED";
        } else if (catalog.status === "DRAFT" || catalog.status === "ARCHIVED") {
          status = catalog.status as StatusType;
        }
      }

      return {
        ...catalog,
        status
      };
    }

    return null;
  } catch (error: unknown) {
    console.error(`코스 카탈로그 조회 오류 (ID: \${id}):`, error);
    throw new Error(i18n.t('errors.failedToGetCourseCatalog', { error: String(error), ns: 'courseCatalog' }));
  }
};

/**
 * 필터를 사용한 코스 카탈로그 검색
 */
export const searchCourseCatalogs = async (filter: CourseCatalogFilter = {}): Promise<CourseCatalog[]> => {
  try {
    // 필터가 없으면 전체 목록 반환
    if (Object.keys(filter).length === 0) {
      return await fetchAllCourseCatalogs();
    }

    // 클라이언트 측 필터링
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

      // 카테고리/대상 필터링
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

/**
 * 새 코스 카탈로그 생성
 * @param input 코스 카탈로그 입력 데이터
 * @returns 생성된 코스 카탈로그 정보
 */
export const createCourseCatalog = async (input: CreateCourseCatalogInput): Promise<CourseCatalog> => {
  try {
    const response = await client.graphql({
      query: createCourseCatalogMutation,
      variables: { input }
    });

    const data = extractData<CreateCourseCatalogResult>(response);
    if (!data?.createCourseCatalog) {
      throw new Error('코스 카탈로그 생성에 실패했습니다.');
    }

    // 타입 단언(type assertion)을 사용하여 타입 에러 해결
    return {
      ...data.createCourseCatalog,
      status: (data.createCourseCatalog.status as any) || "DRAFT"
    } as CourseCatalog;
  } catch (error: unknown) {
    console.error('코스 카탈로그 생성 오류:', error);
    throw new Error(i18n.t('errors.failedToCreateCourseCatalog', { error: String(error), ns: 'courseCatalog' }));
  }
};

/**
 * 기존 코스 카탈로그 업데이트
 * @param input 업데이트 데이터
 * @returns 업데이트된 코스 카탈로그 정보
 */
export const updateCourseCatalog = async (input: UpdateCourseCatalogInput): Promise<CourseCatalog> => {
  try {
    const response = await client.graphql({
      query: updateCourseCatalogMutation,
      variables: { input }
    });

    const data = extractData<UpdateCourseCatalogResult>(response);
    if (!data?.updateCourseCatalog) {
      throw new Error('코스 카탈로그 업데이트에 실패했습니다.');
    }

    // 타입 단언(type assertion)을 사용하여 타입 에러 해결
    return {
      ...data.updateCourseCatalog,
      status: (data.updateCourseCatalog.status as any) || "DRAFT"
    } as CourseCatalog;
  } catch (error: unknown) {
    console.error(`코스 카탈로그 업데이트 오류 (ID: \${input.id}):`, error);
    throw new Error(i18n.t('errors.failedToUpdateCourseCatalog', { error: String(error), ns: 'courseCatalog' }));
  }
};

/**
 * 코스 카탈로그 삭제
 * @param id 삭제할 코스 ID
 * @returns 삭제된 코스 카탈로그 정보
 */
export const deleteCourseCatalog = async (id: string): Promise<{ id: string, course_name?: string }> => {
  try {
    const input: DeleteCourseCatalogInput = { id };

    const response = await client.graphql({
      query: deleteCourseCatalogMutation,
      variables: { input }
    });

    const data = extractData<DeleteCourseCatalogResult>(response);
    if (!data?.deleteCourseCatalog) {
      throw new Error('코스 카탈로그 삭제에 실패했습니다.');
    }

    return data.deleteCourseCatalog;
  } catch (error: unknown) {
    console.error(`코스 카탈로그 삭제 오류 (ID: \${id}):`, error);
    throw new Error(i18n.t('errors.failedToDeleteCourseCatalog', { error: String(error), ns: 'courseCatalog' }));
  }
};