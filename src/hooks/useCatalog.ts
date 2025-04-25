// hooks/useCatalog.ts (새로 만들어 사용)
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { listCourseCatalogs, getCourseCatalog } from '../api/catalog';
import { CourseCatalog } from '../api/types/catalog';

interface UseCatalogOptions {
  catalogId?: string;
  initialLoad?: boolean;
}

export const useCatalog = (options: UseCatalogOptions = {}) => {
  const { catalogId, initialLoad = true } = options;
  const auth = useAuth();
  
  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [course, setCourse] = useState<CourseCatalog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);

  const loadCatalog = async () => {
    if (!auth.isAuthenticated) {
      setError('인증이 필요합니다');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (catalogId) {
        // 특정 카탈로그 항목 가져오기
        const result = await getCourseCatalog(catalogId, auth);
        setCourse(result);
        setIsMockData(auth.useMockData || !auth.hasCredentials);
      } else {
        // 모든 카탈로그 가져오기
        const result = await listCourseCatalogs(auth);
        setCourses(result);
        setIsMockData(auth.useMockData || !auth.hasCredentials);
      }
    } catch (err: any) {
      setError(err.message || '카탈로그 데이터를 불러오는 중 오류가 발생했습니다');
      console.error('카탈로그 로드 중 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    if (initialLoad && auth.isAuthenticated) {
      loadCatalog();
    }
  }, [auth.isAuthenticated, catalogId]);

  return {
    courses,
    course,
    loading,
    error,
    isMockData,
    refresh: loadCatalog
  };
};
