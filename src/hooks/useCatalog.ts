// src/hooks/useCatalog.ts
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchAllCourseCatalogs, 
  fetchCourseCatalogById, 
  searchCourseCatalogs, 
  fetchCourseCatalogsByCategory, 
  createCourseCatalog, 
  updateCourseCatalog, 
  deleteCourseCatalog 
} from '@/services/api/courseCatalogApi'; 
import { CourseCatalog, CourseCatalogInput, CourseCatalogFilter } from '@/models/courseCatalog'; 

/**
 * Admin CourseCatalogTab에서 사용할 통합된 카탈로그 훅
 */
export const useCatalog = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 카탈로그 목록 가져오기
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

  // 선택된 카탈로그 정보
  const { data: selectedCatalog } = useQuery<CourseCatalog | null, Error>({
    queryKey: ['catalog', selectedId],
    queryFn: () => selectedId ? fetchCourseCatalogById(selectedId) : Promise.resolve(null), 
    enabled: !!selectedId,
    staleTime: 1000 * 60 * 5 // 5분
  });

  // 카탈로그 생성 뮤테이션
  const createMutation = useMutation<CourseCatalog, Error, CourseCatalogInput>({
    mutationFn: createCourseCatalog, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
    }
  });

  // 카탈로그 업데이트 뮤테이션
  const updateMutation = useMutation<CourseCatalog, Error, { id: string; input: Partial<CourseCatalogInput> }>({
    mutationFn: ({ id, input }) => updateCourseCatalog(id, input), 
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['catalog', data.id] });
    }
  });

  // 카탈로그 삭제 뮤테이션
  const deleteMutation = useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteCourseCatalog, 
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      if (selectedId === id) {
        setSelectedId(null);
      }
    }
  });

  // 카탈로그 선택
  const selectCatalog = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  // 새 카탈로그 생성
  const createNewCatalog = useCallback(async (input: CourseCatalogInput) => {
    return await createMutation.mutateAsync(input);
  }, [createMutation]);

  // 선택된 카탈로그 업데이트
  const updateSelectedCatalog = useCallback(async (input: Partial<CourseCatalogInput>) => {
    if (!selectedId) throw new Error('선택된 카탈로그가 없습니다');
    return await updateMutation.mutateAsync({ id: selectedId, input });
  }, [selectedId, updateMutation]);

  // 선택된 카탈로그 삭제
  const deleteSelectedCatalog = useCallback(async () => {
    if (!selectedId) throw new Error('선택된 카탈로그가 없습니다');
    return await deleteMutation.mutateAsync(selectedId);
  }, [selectedId, deleteMutation]);

  return {
    catalogs,
    selectedCatalog,
    loading,
    error: error as Error | null,
    refetch,
    selectCatalog,
    createNewCatalog,
    updateSelectedCatalog,
    deleteSelectedCatalog,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};

/**
 * 카탈로그 목록 조회 훅
 */
export const useCatalogs = (enabled = true) => {
  return useQuery<CourseCatalog[], Error>({
    queryKey: ['catalogs'],
    queryFn: fetchAllCourseCatalogs, 
    enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * ID로 특정 카탈로그 조회 훅
 */
export const useCatalogById = (id: string | undefined, enabled = true) => {
  return useQuery<CourseCatalog | null, Error>({
    queryKey: ['catalog', id],
    queryFn: () => (id ? fetchCourseCatalogById(id) : Promise.resolve(null)), 
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * 필터를 사용한 카탈로그 검색 훅
 */
export const useSearchCatalogs = (filter: CourseCatalogFilter = {}, enabled = true) => {
  return useQuery<CourseCatalog[], Error>({
    queryKey: ['catalogs', 'search', filter],
    queryFn: () => searchCourseCatalogs(filter), 
    enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * 카테고리별 카탈로그 조회 훅
 */
export const useCatalogsByCategory = (category: string | undefined, enabled = true) => {
  return useQuery<CourseCatalog[], Error>({
    queryKey: ['catalogs', 'category', category],
    queryFn: () => (category ? fetchCourseCatalogsByCategory(category) : Promise.resolve([])), 
    enabled: !!category && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * 카탈로그 생성 뮤테이션 훅
 */
export const useCreateCatalog = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CourseCatalog, Error, CourseCatalogInput>({
    mutationFn: (input: CourseCatalogInput) => createCourseCatalog(input), 
    onSuccess: () => {
      // 카탈로그 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
    }
  });
};

/**
 * 카탈로그 수정 뮤테이션 훅
 */
export const useUpdateCatalog = () => {
  const queryClient = useQueryClient();
  
  interface UpdateCatalogVars {
    id: string;
    input: Partial<CourseCatalogInput>;
  }
  
  return useMutation<CourseCatalog, Error, UpdateCatalogVars>({
    mutationFn: ({ id, input }: UpdateCatalogVars) => updateCourseCatalog(id, input), 
    onSuccess: (updatedCatalog) => {
      // 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      if (updatedCatalog.id) {
        queryClient.invalidateQueries({ queryKey: ['catalog', updatedCatalog.id] });
      }
    }
  });
};

/**
 * 카탈로그 삭제 뮤테이션 훅
 */
export const useDeleteCatalog = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id: string) => deleteCourseCatalog(id), 
    onSuccess: (_, deletedId) => {
      // 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      queryClient.setQueryData(['catalog', deletedId], null);
    }
  });
};