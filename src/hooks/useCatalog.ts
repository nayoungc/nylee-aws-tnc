// src/hooks/useCatalog.ts
import { useState, useEffect, useCallback } from 'react';
import { CourseCatalog, CourseCatalogInput } from '@/models/catalog';
import {
  listCatalogs,
  getCatalog,
  createCatalog,
  updateCatalog,
  deleteCatalog
} from '@/services/catalogService';

interface UseCatalogResult {
  catalogs: CourseCatalog[];
  selectedCatalog: CourseCatalog | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  selectCatalog: (id: string) => Promise<void>;
  createNewCatalog: (input: CourseCatalogInput) => Promise<CourseCatalog>;
  updateSelectedCatalog: (input: Partial<CourseCatalogInput>) => Promise<CourseCatalog | null>;
  deleteSelectedCatalog: () => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useCatalog(): UseCatalogResult {
  const [catalogs, setCatalogs] = useState<CourseCatalog[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<CourseCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 카탈로그 목록 조회
  const fetchCatalogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await listCatalogs();
      setCatalogs(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 초기 로딩
  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);
  
  // 특정 카탈로그 선택 - id 사용
  const selectCatalog = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const catalog = await getCatalog(id);
      setSelectedCatalog(catalog);
    } catch (err: any) {
      setError(err);
      setSelectedCatalog(null);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 새 카탈로그 생성
  const createNewCatalog = useCallback(async (input: CourseCatalogInput) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const newCatalog = await createCatalog(input);
      setCatalogs(prev => [...prev, newCatalog]);
      setSelectedCatalog(newCatalog);
      return newCatalog;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);
  
  // 선택된 카탈로그 업데이트 - id 사용
  const updateSelectedCatalog = useCallback(async (input: Partial<CourseCatalogInput>) => {
    if (!selectedCatalog) return null;
    
    setIsUpdating(true);
    setError(null);
    
    try {
      // id 사용
      const updated = await updateCatalog(selectedCatalog.id, input);
      setCatalogs(prev => 
        prev.map(c => c.id === updated.id ? updated : c)
      );
      setSelectedCatalog(updated);
      return updated;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [selectedCatalog]);
  
  // 선택된 카탈로그 삭제 - id 사용
  const deleteSelectedCatalog = useCallback(async () => {
    if (!selectedCatalog) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      // id 사용
      await deleteCatalog(selectedCatalog.id);
      setCatalogs(prev => 
        prev.filter(c => c.id !== selectedCatalog.id)
      );
      setSelectedCatalog(null);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [selectedCatalog]);

  return {
    catalogs,
    selectedCatalog,
    loading,
    error,
    refetch: fetchCatalogs,
    selectCatalog,
    createNewCatalog,
    updateSelectedCatalog,
    deleteSelectedCatalog,
    isCreating,
    isUpdating,
    isDeleting
  };
}