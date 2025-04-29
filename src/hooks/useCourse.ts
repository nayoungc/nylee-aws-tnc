// src/hooks/useCourse.ts
/**
 * 교육 과정 관리 훅
 * @description React Query를 사용해 교육 과정의 CRUD 작업을 제공하는 훅
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, QueryFunctionContext } from '@tanstack/react-query';
import courseApi from '@/services/api/courseApi';
import { Course, CourseInput, CourseFilter } from '@/models/course';
import i18n from '@/i18n';

/**
 * 단일 과정 조회 훅
 * @param courseId 과정 ID
 * @returns 과정 정보, 로딩 상태, 오류 상태
 */
export const useGetCourse = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async ({ queryKey }: QueryFunctionContext<[string, string | undefined]>) => {
      const id = queryKey[1];
      if (!id) return null;
      return courseApi.getCourse(id);
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000 // 5분
  });
};

/**
 * 과정 목록 조회 훅
 * @returns 과정 목록 관리를 위한 상태와 함수들
 */
export const useListCourses = () => {
  const [filter, setFilter] = useState<CourseFilter | undefined>();
  const [nextToken, setNextToken] = useState<string | null | undefined>(null);
  
  const { 
    data: queryResult = { items: [], nextToken: null }, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['courses', filter],
    queryFn: async ({ queryKey }: QueryFunctionContext<[string, CourseFilter | undefined]>) => {
      const currentFilter = queryKey[1];
      return courseApi.listCourses(currentFilter);
    },
    staleTime: 5 * 60 * 1000 // 5분
  });
  
  const loadMore = useCallback(async () => {
    if (!nextToken || isLoading) return;
    
    try {
      const moreResult = await courseApi.listCourses(filter, 50, nextToken);
      
      // 새로운 결과 갱신 로직 (React Query의 queryClient 대신 상태 업데이트 함수 필요)
      setNextToken(moreResult.nextToken);
      
      return moreResult;
    } catch (err) {
      console.error('Failed to load more courses:', err);
      throw err;
    }
  }, [nextToken, isLoading, filter]);
  
  const updateFilter = useCallback((newFilter: CourseFilter | undefined) => {
    setFilter(newFilter);
    setNextToken(null);  // 필터 변경 시 nextToken 리셋
  }, []);
  
  return { 
    courses: queryResult.items, 
    nextToken: queryResult.nextToken,
    loading: isLoading, 
    error, 
    refetch,
    loadMore,
    updateFilter 
  };
};

/**
 * 과정 CRUD 작업을 위한 훅
 * @returns 과정 CRUD 작업을 위한 함수들
 */
export const useCourseActions = () => {
  const queryClient = useQueryClient();
  
  // 과정 생성
  const createMutation = useMutation({
    mutationFn: courseApi.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });

  // 과정 업데이트
  const updateMutation = useMutation({
    mutationFn: ({ courseId, input }: { courseId: string; input: Partial<CourseInput> }) => 
      courseApi.updateCourse(courseId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      if (data?.courseId) {
        queryClient.invalidateQueries({ queryKey: ['course', data.courseId] });
      }
    }
  });

  // 과정 삭제
  const deleteMutation = useMutation({
    mutationFn: courseApi.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });

  // 과정 생성 함수
  const createCourse = useCallback((input: CourseInput) => {
    return createMutation.mutateAsync(input);
  }, [createMutation]);

  // 과정 업데이트 함수
  const updateCourse = useCallback((courseId: string, input: Partial<CourseInput>) => {
    return updateMutation.mutateAsync({ courseId, input });
  }, [updateMutation]);

  // 과정 삭제 함수
  const deleteCourse = useCallback((courseId: string) => {
    return deleteMutation.mutateAsync(courseId);
  }, [deleteMutation]);

  return {
    createCourse,
    updateCourse,
    deleteCourse,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};