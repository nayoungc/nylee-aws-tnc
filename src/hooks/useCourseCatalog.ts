// src/hooks/useCourseCatalog.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchAllCourseCatalogs, 
  fetchCourseCatalogById, 
  searchCourseCatalogs, 
  fetchCourseCatalogsByCategory, 
  createCourseCatalog as createCatalogApi, 
  updateCourseCatalog as updateCatalogApi, 
  deleteCourseCatalog as deleteCatalogApi
} from '@/services/api/courseCatalogApi';
import { CourseCatalog, CourseCatalogInput, CourseCatalogFilter } from '@/models/courseCatalog';

/**
 * 과정 카탈로그 관리를 위한 React Query 훅
 * @returns 과정 카탈로그 관련 데이터, 상태 및 함수
 */
export const useCourseCatalog = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 카탈로그 목록 조회
  const { 
    data: catalogs = [], 
    isLoading: loading, 
    error,
    refetch
  } = useQuery<CourseCatalog[], Error>({
    queryKey: ['catalogs'],
    queryFn: fetchAllCourseCatalogs,
    staleTime: 1000 * 60 * 5 // 5분
  });

  // 선택된 카탈로그 조회
  const { data: selectedCatalog } = useQuery<CourseCatalog | null, Error>({
    queryKey: ['catalog', selectedId],
    queryFn: () => selectedId ? fetchCourseCatalogById(selectedId) : Promise.resolve(null),
    enabled: !!selectedId,
    staleTime: 1000 * 60 * 5 // 5분
  });

  // 카탈로그 생성 뮤테이션
  const createMutation = useMutation<CourseCatalog, Error, CourseCatalogInput>({
    mutationFn: createCatalogApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
    }
  });

  // 카탈로그 업데이트 뮤테이션
  const updateMutation = useMutation<CourseCatalog, Error, { id: string; input: Partial<CourseCatalogInput> }>({
    mutationFn: ({ id, input }) => updateCatalogApi(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', data.id] });
    }
  });

  // 카탈로그 삭제 뮤테이션
  const deleteMutation = useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteCatalogApi,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      if (selectedId === id) {
        setSelectedId(null);
      }
    }
  });

  // 카탈로그 선택
  const selectCourseCatalog = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  // 새 카탈로그 생성
  const createNewCourseCatalog = useCallback(async (input: CourseCatalogInput) => {
    return await createMutation.mutateAsync(input);
  }, [createMutation]);

  // 선택된 카탈로그 업데이트
  const updateSelectedCourseCatalog = useCallback(async (input: Partial<CourseCatalogInput>) => {
    if (!selectedId) throw new Error('선택된 카탈로그가 없습니다');
    return await updateMutation.mutateAsync({ id: selectedId, input });
  }, [selectedId, updateMutation]);

  // 선택된 카탈로그 삭제
  const deleteSelectedCourseCatalog = useCallback(async () => {
    if (!selectedId) throw new Error('선택된 카탈로그가 없습니다');
    return await deleteMutation.mutateAsync(selectedId);
  }, [selectedId, deleteMutation]);

  return {
    catalogs,
    selectedCatalog,
    loading,
    error: error as Error | null,
    refetch,
    selectCourseCatalog,
    createNewCourseCatalog,
    updateSelectedCourseCatalog,
    deleteSelectedCourseCatalog,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};

/**
 * 카탈로그 목록 조회 훅
 * @param enabled 자동 쿼리 활성화 여부
 * @returns 코스 카탈로그 목록 쿼리 결과
 */
export const useCourseCatalogs = (enabled = true) => {
  return useQuery<CourseCatalog[], Error>({
    queryKey: ['catalogs'],
    queryFn: fetchAllCourseCatalogs,
    enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * ID로 특정 카탈로그 조회 훅
 * @param id 조회할 카탈로그 ID
 * @param enabled 자동 쿼리 활성화 여부
 * @returns 코스 카탈로그 쿼리 결과
 */
export const useCourseCatalogById = (id: string | undefined, enabled = true) => {
  return useQuery<CourseCatalog | null, Error>({
    queryKey: ['catalog', id],
    queryFn: () => (id ? fetchCourseCatalogById(id) : Promise.resolve(null)),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * 필터를 사용한 카탈로그 검색 훅
 * @param filter 검색 필터
 * @param enabled 자동 쿼리 활성화 여부
 * @returns 검색 결과 쿼리
 */
export const useSearchCourseCatalogs = (filter: CourseCatalogFilter = {}, enabled = true) => {
  return useQuery<CourseCatalog[], Error>({
    queryKey: ['catalogs', 'search', filter],
    queryFn: () => searchCourseCatalogs(filter),
    enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * 카테고리별 카탈로그 조회 훅
 * @param category 조회할 카테고리
 * @param enabled 자동 쿼리 활성화 여부
 * @returns 카테고리별 코스 카탈로그 목록
 */
export const useCourseCatalogsByCategory = (category: string | undefined, enabled = true) => {
  return useQuery<CourseCatalog[], Error>({
    queryKey: ['catalogs', 'category', category],
    queryFn: () => (category ? fetchCourseCatalogsByCategory(category) : Promise.resolve([])),
    enabled: !!category && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * 카탈로그 생성 뮤테이션 훅
 * @returns 카탈로그 생성 뮤테이션
 */
export const useCreateCourseCatalog = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CourseCatalog, Error, CourseCatalogInput>({
    mutationFn: createCatalogApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
    }
  });
};

/**
 * 카탈로그 수정 뮤테이션 훅
 * @returns 카탈로그 수정 뮤테이션
 */
export const useUpdateCourseCatalog = () => {
  const queryClient = useQueryClient();
  
  interface UpdateCatalogVars {
    id: string;
    input: Partial<CourseCatalogInput>;
  }
  
  return useMutation<CourseCatalog, Error, UpdateCatalogVars>({
    mutationFn: ({ id, input }: UpdateCatalogVars) => updateCatalogApi(id, input),
    onSuccess: (updatedCatalog) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', updatedCatalog.id] });
    }
  });
};

/**
 * 카탈로그 삭제 뮤테이션 훅
 * @returns 카탈로그 삭제 뮤테이션
 */
export const useDeleteCourseCatalog = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteCatalogApi,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      queryClient.setQueryData(['catalog', deletedId], null);
    }
  });
};