// src/hooks/useCatalog.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchAllCatalogs, 
  fetchCatalogById, 
  searchCatalogs, 
  fetchCatalogsByCategory,
  createCatalog,
  updateCatalog,
  deleteCatalog
} from '@services/catalogService';
import { CourseCatalog, CourseCatalogInput, CatalogFilter } from '@models/catalog';

// 모든 카탈로그 조회 훅
export const useCatalogs = (enabled = true) => {
  return useQuery<CourseCatalog[], Error>({
    queryKey: ['catalogs'],
    queryFn: fetchAllCatalogs,
    enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

// ID로 특정 카탈로그 조회 훅
export const useCatalogById = (id: string | undefined, enabled = true) => {
  return useQuery<CourseCatalog | null, Error>({
    queryKey: ['catalog', id],
    queryFn: () => (id ? fetchCatalogById(id) : Promise.resolve(null)),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

// 필터를 사용한 카탈로그 검색 훅
export const useSearchCatalogs = (filter: CatalogFilter = {}, enabled = true) => {
  return useQuery<CourseCatalog[], Error>({
    queryKey: ['catalogs', 'search', filter],
    queryFn: () => searchCatalogs(filter),
    enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

// 카테고리별 카탈로그 조회 훅
export const useCatalogsByCategory = (category: string | undefined, enabled = true) => {
  return useQuery<CourseCatalog[], Error>({
    queryKey: ['catalogs', 'category', category],
    queryFn: () => (category ? fetchCatalogsByCategory(category) : Promise.resolve([])),
    enabled: !!category && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

// 카탈로그 생성 뮤테이션 훅
export const useCreateCatalog = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CourseCatalog, Error, CourseCatalogInput>({
    mutationFn: (input: CourseCatalogInput) => createCatalog(input),
    onSuccess: () => {
      // 카탈로그 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
    }
  });
};

// 카탈로그 수정 뮤테이션 훅
export const useUpdateCatalog = () => {
  const queryClient = useQueryClient();
  
  interface UpdateCatalogVars {
    id: string;
    input: Partial<CourseCatalogInput>;
  }
  
  return useMutation<CourseCatalog, Error, UpdateCatalogVars>({
    mutationFn: ({ id, input }: UpdateCatalogVars) => updateCatalog(id, input),
    onSuccess: (updatedCatalog) => {
      // 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      if (updatedCatalog.id) {
        queryClient.invalidateQueries({ queryKey: ['catalog', updatedCatalog.id] });
      }
    }
  });
};

// 카탈로그 삭제 뮤테이션 훅
export const useDeleteCatalog = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean }, Error, string>({  // boolean 대신 { success: boolean } 사용
    mutationFn: (id: string) => deleteCatalog(id),
    onSuccess: (_, deletedId) => {
      // 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      queryClient.setQueryData(['catalog', deletedId], null);
    }
  });
};
