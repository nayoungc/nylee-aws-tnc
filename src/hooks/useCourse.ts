// src/hooks/useCourseHooks.ts
import { useState, useEffect, useCallback } from 'react';
import { CourseApi, CourseFilter } from '@/services/api/courseApi';
import { Course, CourseInput } from '@models/courses';
import i18n from '@/i18n'; 

// 단일 과정 조회 훅
export const useGetCourse = (courseId: string | undefined) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await CourseApi.getCourse(courseId);
        setCourse(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : i18n.t('errors.unknown'));
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  return { course, loading, error };
};

// 과정 목록 조회 훅
export const useListCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null | undefined>(null);

  const fetchCourses = useCallback(async (filter?: CourseFilter, limit?: number, token?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await CourseApi.listCourses(filter, limit, token);
      setCourses(prevCourses => token ? [...prevCourses, ...result.items] : result.items);
      setNextToken(result.nextToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : i18n.t('errors.unknown'));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (nextToken && !loading) {
      fetchCourses(undefined, undefined, nextToken);
    }
  }, [nextToken, loading, fetchCourses]);

  return { courses, loading, error, nextToken, fetchCourses, loadMore };
};

// 과정 생성 훅
export const useCreateCourse = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createCourse = useCallback(async (input: CourseInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await CourseApi.createCourse(input);
      setCourse(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : i18n.t('errors.unknown'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { course, loading, error, createCourse };
};

// 과정 업데이트 훅
export const useUpdateCourse = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateCourse = useCallback(async (courseId: string, input: Partial<CourseInput>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await CourseApi.updateCourse(courseId, input);
      setCourse(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : i18n.t('errors.unknown'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { course, loading, error, updateCourse };
};

// 과정 삭제 훅
export const useDeleteCourse = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCourse = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await CourseApi.deleteCourse(courseId);
      setCourse(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : i18n.t('errors.unknown'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { course, loading, error, deleteCourse };
};


