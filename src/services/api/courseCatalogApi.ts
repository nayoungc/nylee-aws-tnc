// src/services/api/courseCatalogApi.ts
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
import { CourseCatalog, CourseCatalogInput } from '@/models/courseCatalog';
import { safelyExtractData as extractData } from '@/utils/graphql';
import i18n from '@/i18n';
import { executeGraphQL } from '@/utils/apiClient';

// CourseCatalogFilter 타입 정의
export interface CourseCatalogFilter {
  text?: string;
  level?: string;
  target_audience?: string;
  objectives?: string[];
}

// 기존 클라이언트는 인증된 클라이언트로 교체
// const client = generateClient();

// 실제 사용하는 상태 타입 정의
type StatusType = "ACTIVE" | "EOL";

/**
 * 모든 코스 카탈로그 가져오기
 */
export const fetchAllCourseCatalogs = async (): Promise<CourseCatalog[]> => {
  console.log("코스 카탈로그 데이터 가져오기 시도");

  try {
    // 중앙화된 executeGraphQL 함수 사용
    const response = await executeGraphQL(listCourseCatalogs, { limit: 1000 });
    
    console.log("API 응답:", JSON.stringify(response, null, 2));

    const data = extractData<ListCourseCatalogsResult>(response);
    
    if (!data?.listCourseCatalogs?.items) {
      console.warn("API에서 반환된 데이터가 없습니다:", data);
      return [];
    }

    const catalogs = data.listCourseCatalogs.items || [];
    
    // 상태 타입 매핑 - "ACTIVE" 또는 "EOL"만 허용
    return catalogs.map((catalog) => {
      // 기본값은 "ACTIVE"
      const status: StatusType = catalog.status === "EOL" ? "EOL" : "ACTIVE";
      
      return {
        ...catalog,
        status
      };
    });
  } catch (error: unknown) {
    console.error('코스 카탈로그 목록 조회 오류:', error);
    
    if (error instanceof Error) {
      console.error('오류 메시지:', error.message);
      console.error('오류 스택:', error.stack);
    } else {
      console.error('알 수 없는 오류 유형:', typeof error);
    }
    
    // 템플릿 리터럴 수정 (백슬래시 제거)
    throw new Error(`코스 카탈로그를 불러오는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * ID로 특정 코스 카탈로그 가져오기
 */
export const fetchCourseCatalogById = async (id: string): Promise<CourseCatalog | null> => {
  try {
    const response = await executeGraphQL(getCourseCatalog, { id });

    const data = extractData<GetCourseCatalogResult>(response);
    const catalog = data?.getCourseCatalog || null;

    // 결과가 있을 경우 status 매핑
    if (catalog) {
      // "EOL"이 아닌 모든 값은 "ACTIVE"로 처리
      const status: StatusType = catalog.status === "EOL" ? "EOL" : "ACTIVE";

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
    const response = await executeGraphQL(createCourseCatalogMutation, { input });

    const data = extractData<CreateCourseCatalogResult>(response);
    if (!data?.createCourseCatalog) {
      throw new Error('코스 카탈로그 생성에 실패했습니다.');
    }

    // status 속성이 "EOL"이 아니면 "ACTIVE"로 설정
    const status: StatusType = data.createCourseCatalog.status === "EOL" ? "EOL" : "ACTIVE";

    return {
      ...data.createCourseCatalog,
      status
    } as CourseCatalog;
  } catch (error: unknown) {
    console.error('코스 카탈로그 생성 오류:', error);
    throw new Error(i18n.t('errors.failedToCreateCourseCatalog', { error: String(error), ns: 'courseCatalog' }));
  }
};

/**
 * 기존 코스 카탈로그 업데이트
 * @param id 업데이트할 코스 ID
 * @param input 업데이트 데이터
 * @returns 업데이트된 코스 카탈로그 정보
 */
export const updateCourseCatalog = async (id: string, input: Partial<CourseCatalogInput>): Promise<CourseCatalog> => {
  try {
    const updateInput: UpdateCourseCatalogInput = { 
      id,
      ...input
    };

    const response = await executeGraphQL(updateCourseCatalogMutation, { input: updateInput });

    const data = extractData<UpdateCourseCatalogResult>(response);
    if (!data?.updateCourseCatalog) {
      throw new Error('코스 카탈로그 업데이트에 실패했습니다.');
    }

    // status 속성이 "EOL"이 아니면 "ACTIVE"로 설정
    const status: StatusType = data.updateCourseCatalog.status === "EOL" ? "EOL" : "ACTIVE";

    return {
      ...data.updateCourseCatalog,
      status
    } as CourseCatalog;
  } catch (error: unknown) {
    console.error(`코스 카탈로그 업데이트 오류 (ID: \${id}):`, error);
    throw new Error(i18n.t('errors.failedToUpdateCourseCatalog', { error: String(error), ns: 'courseCatalog' }));
  }
};

/**
 * 코스 카탈로그 삭제
 * @param id 삭제할 코스 ID
 * @returns 삭제 성공 여부를 포함한 객체
 */
export const deleteCourseCatalog = async (id: string): Promise<{ success: boolean }> => {
  try {
    const input: DeleteCourseCatalogInput = { id };

    const response = await executeGraphQL(deleteCourseCatalogMutation, { input });

    const data = extractData<DeleteCourseCatalogResult>(response);
    if (!data?.deleteCourseCatalog) {
      throw new Error('코스 카탈로그 삭제에 실패했습니다.');
    }

    // id가 존재하면 삭제 성공으로 간주하고 success: true 반환
    return { success: true };
  } catch (error: unknown) {
    console.error(`코스 카탈로그 삭제 오류 (ID: \${id}):`, error);
    
    // 오류가 발생해도 명시적으로 success: false를 반환하지 않고 예외를 발생시킵니다.
    // useMutation은 이 예외를 적절히 처리합니다.
    throw new Error(i18n.t('errors.failedToDeleteCourseCatalog', { error: String(error), ns: 'courseCatalog' }));
  }
};