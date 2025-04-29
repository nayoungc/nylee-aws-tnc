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

// 실제 사용하는 상태 타입 정의
type StatusType = "ACTIVE" | "EOL" | "DRAFT";

// 레벨 타입
type LevelType = "beginner" | "intermediate" | "advanced";

// GraphQL 오류 타입 정의
interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: Record<string, any>;
}

/**
 * 레벨 값을 유효한 LevelType으로 변환
 */
const mapLevel = (level?: string): LevelType | undefined => {
  if (!level) return undefined;
  
  // 소문자로 변환하여 비교
  const normalizedLevel = level.toLowerCase();
  
  if (normalizedLevel === "beginner" || normalizedLevel === "intermediate" || normalizedLevel === "advanced") {
    return normalizedLevel as LevelType;
  }
  
  // 기본값은 beginner로 설정
  console.warn(`유효하지 않은 레벨 값: "\${level}", 기본값인 "beginner"로 설정합니다.`);
  return "beginner";
};

/**
 * API 응답 데이터를 CourseCatalog 모델로 변환
 */
const transformToCatalog = (catalog: any): CourseCatalog => {
  // 상태 매핑
  const status: StatusType = catalog.status === "EOL" ? "EOL" : 
                             catalog.status === "DRAFT" ? "DRAFT" : "ACTIVE";
  
  // 레벨 매핑
  const level = mapLevel(catalog.level);
  
  // duration이 number로 들어오는 경우 string으로 변환
  const duration = catalog.durations !== undefined ? 
                   String(catalog.durations) : 
                   catalog.duration;

  // 필드 추출 및 변환
  const result = {
    id: catalog.id,
    course_name: catalog.course_name,
    course_id: catalog.course_id,
    description: catalog.description,
    version: catalog.version,
    learning_objectives: catalog.learning_objectives,
    target_audience: catalog.target_audience,
    prerequisites: catalog.prerequisites,
    status,
    level,
    duration,
    createdAt: catalog.createdAt,
    updatedAt: catalog.updatedAt,
    createdBy: catalog.createdBy,
    owner: catalog.owner,
    metadata: catalog.metadata || {}
  };

  return result as CourseCatalog;
};

/**
 * 모든 코스 카탈로그 가져오기
 */
export const fetchAllCourseCatalogs = async (): Promise<CourseCatalog[]> => {
  console.log("코스 카탈로그 데이터 가져오기 시도");

  try {
    // 중앙화된 executeGraphQL 함수 사용
    const response = await executeGraphQL(listCourseCatalogs, { limit: 1000 });
    
    // 개발 환경에서만 구조화된 응답 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log("API 응답 구조:", {
        hasData: !!response.data,
        hasErrors: !!response.errors,
        errorCount: response.errors?.length || 0
      });
    }

    // 오류가 있으면 먼저 처리
    if (response.errors && response.errors.length > 0) {
      const errorMessages = response.errors.map((e: GraphQLError) => e.message).join(', ');
      throw new Error(`GraphQL 오류: \${errorMessages}`);
    }

    const data = extractData<ListCourseCatalogsResult>(response);
    
    if (!data?.listCourseCatalogs?.items) {
      console.warn("API에서 반환된 데이터가 없습니다:", data);
      return [];
    }

    const catalogs = data.listCourseCatalogs.items || [];
    
    // API 응답 데이터를 적절한 타입으로 변환
    return catalogs.map(transformToCatalog);
  } catch (error: unknown) {
    console.error('코스 카탈로그 목록 조회 오류:', error);
    
    if (error instanceof Error) {
      console.error('오류 메시지:', error.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('오류 스택:', error.stack);
      }
    } else {
      console.error('알 수 없는 오류 유형:', typeof error);
    }
    
    throw new Error(`코스 카탈로그를 불러오는데 실패했습니다: \${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * ID로 특정 코스 카탈로그 가져오기
 */
export const fetchCourseCatalogById = async (id: string): Promise<CourseCatalog | null> => {
  try {
    const response = await executeGraphQL(getCourseCatalog, { id });

    // 오류가 있으면 먼저 처리
    if (response.errors && response.errors.length > 0) {
      const errorMessages = response.errors.map((e: GraphQLError) => e.message).join(', ');
      throw new Error(`GraphQL 오류: \${errorMessages}`);
    }

    const data = extractData<GetCourseCatalogResult>(response);
    const catalog = data?.getCourseCatalog || null;

    // 결과가 있을 경우 변환
    if (catalog) {
      return transformToCatalog(catalog);
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
    // 입력 데이터의 깊은 복사본 생성
    const processedInput = { ...input };

    // level이 있으면 유효한지 확인
    if (processedInput.level) {
      // 여기서는 타입 캐스팅을 사용하지 않고 별도 변수에 값을 저장
      const mappedLevel = mapLevel(processedInput.level);
      if (mappedLevel) {
        // TypeScript 오류를 방지하기 위해 타입 단언 사용
        (processedInput as any).level = mappedLevel;
      }
    }

    const response = await executeGraphQL(createCourseCatalogMutation, { input: processedInput });

    // 오류가 있으면 먼저 처리
    if (response.errors && response.errors.length > 0) {
      const errorMessages = response.errors.map((e: GraphQLError) => e.message).join(', ');
      throw new Error(`GraphQL 오류: \${errorMessages}`);
    }

    const data = extractData<CreateCourseCatalogResult>(response);
    if (!data?.createCourseCatalog) {
      throw new Error('코스 카탈로그 생성에 실패했습니다.');
    }

    // 응답 데이터를 CourseCatalog 타입으로 변환
    return transformToCatalog(data.createCourseCatalog);
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
    // 입력 데이터의 깊은 복사본 생성
    const processedInput = { ...input };

    // level이 있으면 유효한지 확인
    if (processedInput.level) {
      // 여기서는 타입 캐스팅을 사용하지 않고 별도 변수에 값을 저장
      const mappedLevel = mapLevel(processedInput.level);
      if (mappedLevel) {
        // TypeScript 오류를 방지하기 위해 타입 단언 사용
        (processedInput as any).level = mappedLevel;
      }
    }

    const updateInput: UpdateCourseCatalogInput = { 
      id,
      ...processedInput
    };

    const response = await executeGraphQL(updateCourseCatalogMutation, { input: updateInput });

    // 오류가 있으면 먼저 처리
    if (response.errors && response.errors.length > 0) {
      const errorMessages = response.errors.map((e: GraphQLError) => e.message).join(', ');
      throw new Error(`GraphQL 오류: \${errorMessages}`);
    }

    const data = extractData<UpdateCourseCatalogResult>(response);
    if (!data?.updateCourseCatalog) {
      throw new Error('코스 카탈로그 업데이트에 실패했습니다.');
    }

    // 응답 데이터를 CourseCatalog 타입으로 변환
    return transformToCatalog(data.updateCourseCatalog);
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

    // 오류가 있으면 먼저 처리
    if (response.errors && response.errors.length > 0) {
      const errorMessages = response.errors.map((e: GraphQLError) => e.message).join(', ');
      throw new Error(`GraphQL 오류: \${errorMessages}`);
    }

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