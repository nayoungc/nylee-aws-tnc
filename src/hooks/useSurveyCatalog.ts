// src/hooks/useSurveyCatalog.ts
/**
 * 설문조사 템플릿 관리 훅
 * @description React Query와 Amplify API를 사용하여 설문조사 템플릿 CRUD 기능을 제공
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, QueryFunctionContext } from '@tanstack/react-query';
import surveyApi from '@/services/api/surveyApi';
import {
  SurveyCatalog,
  SurveyCatalogInput,
  UpdateSurveyCatalogInput,
  QuestionItemInput,
  DeploySurveyInput,
  SurveyCatalogFilter
} from '@/models/surveyCatalog';

/**
 * 설문조사 템플릿 관리를 위한 React Query 훅
 * @returns 설문조사 템플릿 관리를 위한 상태와 함수들
 */
export const useSurveyCatalog = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 설문조사 템플릿 목록 조회
  const { 
    data: surveyCatalogs = [], 
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['surveyCatalogs'],
    queryFn: async () => {
      const response = await surveyApi.getSurveyCatalogs();
      return response;
    },
    staleTime: 5 * 60 * 1000 // 5분
  });

  // 선택된 설문조사 템플릿 조회
  const { data: selectedSurveyCatalog } = useQuery({
    queryKey: ['surveyCatalog', selectedId],
    queryFn: async ({ queryKey }: QueryFunctionContext<[string, string | null]>) => {
      // queryKey[1]에서 ID 추출
      const id = queryKey[1];
      if (!id) return null;
      return surveyApi.getSurveyCatalog(id);
    },
    enabled: !!selectedId,
    staleTime: 5 * 60 * 1000 // 5분
  });

  // 설문조사 템플릿 생성 뮤테이션
  const createMutation = useMutation({
    mutationFn: surveyApi.createSurveyCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveyCatalogs'] });
    }
  });

  // 설문조사 템플릿 업데이트 뮤테이션
  const updateMutation = useMutation({
    mutationFn: surveyApi.updateSurveyCatalog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surveyCatalogs'] });
      if (data?.surveyCatalogId) {
        queryClient.invalidateQueries({ queryKey: ['surveyCatalog', data.surveyCatalogId] });
      }
    }
  });

  // 설문조사 템플릿 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: surveyApi.deleteSurveyCatalog,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['surveyCatalogs'] });
      if (selectedId === id) {
        setSelectedId(null);
      }
    }
  });

  // 문항 추가 뮤테이션
  const addQuestionItemsMutation = useMutation({
    mutationFn: ({ surveyCatalogId, questionItems }: { surveyCatalogId: string; questionItems: QuestionItemInput[] }) => 
      surveyApi.addQuestionItems(surveyCatalogId, questionItems),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surveyCatalogs'] });
      if (data?.surveyCatalogId) {
        queryClient.invalidateQueries({ queryKey: ['surveyCatalog', data.surveyCatalogId] });
      }
    }
  });

  // 문항 제거 뮤테이션
  const removeQuestionItemsMutation = useMutation({
    mutationFn: ({ surveyCatalogId, questionIds }: { surveyCatalogId: string; questionIds: string[] }) => 
      surveyApi.removeQuestionItems(surveyCatalogId, questionIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surveyCatalogs'] });
      if (data?.surveyCatalogId) {
        queryClient.invalidateQueries({ queryKey: ['surveyCatalog', data.surveyCatalogId] });
      }
    }
  });

  // 문항 순서 업데이트 뮤테이션
  const updateQuestionOrderMutation = useMutation({
    mutationFn: ({ surveyCatalogId, questionIds }: { surveyCatalogId: string; questionIds: string[] }) => 
      surveyApi.updateQuestionOrder(surveyCatalogId, questionIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surveyCatalogs'] });
      if (data?.surveyCatalogId) {
        queryClient.invalidateQueries({ queryKey: ['surveyCatalog', data.surveyCatalogId] });
      }
    }
  });

  // 설문조사 템플릿 활성화 뮤테이션
  const activateMutation = useMutation({
    mutationFn: surveyApi.activateSurveyCatalog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surveyCatalogs'] });
      if (data?.surveyCatalogId) {
        queryClient.invalidateQueries({ queryKey: ['surveyCatalog', data.surveyCatalogId] });
      }
    }
  });

  // 설문조사 템플릿 비활성화 뮤테이션
  const deactivateMutation = useMutation({
    mutationFn: surveyApi.deactivateSurveyCatalog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surveyCatalogs'] });
      if (data?.surveyCatalogId) {
        queryClient.invalidateQueries({ queryKey: ['surveyCatalog', data.surveyCatalogId] });
      }
    }
  });

  // 설문조사 배포 뮤테이션
  const deployMutation = useMutation({
    mutationFn: surveyApi.deploySurvey,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surveyCatalogs'] });
      if (data?.surveyCatalogId) {
        queryClient.invalidateQueries({ queryKey: ['surveyCatalog', data.surveyCatalogId] });
      }
    }
  });

  // 설문조사 템플릿 선택
  const selectSurveyCatalog = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  // 설문조사 템플릿 생성
  const createSurveyCatalog = useCallback((input: SurveyCatalogInput) => {
    return createMutation.mutateAsync(input);
  }, [createMutation]);

  // 설문조사 템플릿 업데이트
  const updateSurveyCatalog = useCallback((input: UpdateSurveyCatalogInput) => {
    return updateMutation.mutateAsync(input);
  }, [updateMutation]);

  // 설문조사 템플릿 삭제
  const deleteSurveyCatalog = useCallback((id: string) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  // 문항 추가
  const addQuestionItems = useCallback((surveyCatalogId: string, questionItems: QuestionItemInput[]) => {
    return addQuestionItemsMutation.mutateAsync({ surveyCatalogId, questionItems });
  }, [addQuestionItemsMutation]);

  // 문항 제거
  const removeQuestionItems = useCallback((surveyCatalogId: string, questionIds: string[]) => {
    return removeQuestionItemsMutation.mutateAsync({ surveyCatalogId, questionIds });
  }, [removeQuestionItemsMutation]);

  // 문항 순서 업데이트
  const updateQuestionOrder = useCallback((surveyCatalogId: string, questionIds: string[]) => {
    return updateQuestionOrderMutation.mutateAsync({ surveyCatalogId, questionIds });
  }, [updateQuestionOrderMutation]);

  // 설문조사 템플릿 활성화
  const activateSurveyCatalog = useCallback((id: string) => {
    return activateMutation.mutateAsync(id);
  }, [activateMutation]);

  // 설문조사 템플릿 비활성화
  const deactivateSurveyCatalog = useCallback((id: string) => {
    return deactivateMutation.mutateAsync(id);
  }, [deactivateMutation]);

  // 설문조사 배포
  const deploySurvey = useCallback((input: DeploySurveyInput) => {
    return deployMutation.mutateAsync(input);
  }, [deployMutation]);

  return {
    surveyCatalogs,
    selectedSurveyCatalog,
    loading,
    error: error as Error | null,
    refetch,
    selectSurveyCatalog,
    createSurveyCatalog,
    updateSurveyCatalog,
    deleteSurveyCatalog,
    addQuestionItems,
    removeQuestionItems,
    updateQuestionOrder,
    activateSurveyCatalog,
    deactivateSurveyCatalog,
    deploySurvey,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAddingQuestions: addQuestionItemsMutation.isPending,
    isRemovingQuestions: removeQuestionItemsMutation.isPending,
    isUpdatingQuestionOrder: updateQuestionOrderMutation.isPending,
    isActivating: activateMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
    isDeploying: deployMutation.isPending
  };
};

/**
 * 카테고리별 설문조사 템플릿 조회 훅
 * @param category 카테고리
 * @param enabled 자동 쿼리 활성화 여부
 * @returns 카테고리별 설문조사 템플릿 목록 및 쿼리 상태
 */
export const useSurveyCatalogsByCategory = (category: string, enabled = true) => {
  return useQuery({
    queryKey: ['surveyCatalogs', 'category', category],
    queryFn: async ({ queryKey }: QueryFunctionContext<[string, string, string]>) => {
      // queryKey[2]에서 카테고리 추출
      const categoryValue = queryKey[2];
      return surveyApi.getSurveyCatalogsByCategory(categoryValue);
    },
    enabled: !!category && enabled,
    staleTime: 5 * 60 * 1000 // 5분
  });
};

/**
 * 과정별 설문조사 템플릿 조회 훅
 * @param courseId 과정 ID
 * @param enabled 자동 쿼리 활성화 여부
 * @returns 과정별 설문조사 템플릿 목록 및 쿼리 상태
 */
export const useSurveyCatalogsByCourse = (courseId: string, enabled = true) => {
  return useQuery({
    queryKey: ['surveyCatalogs', 'course', courseId],
    queryFn: async ({ queryKey }: QueryFunctionContext<[string, string, string]>) => {
      // queryKey[2]에서 과정 ID 추출
      const courseIdValue = queryKey[2];
      return surveyApi.getSurveyCatalogsByCourse(courseIdValue);
    },
    enabled: !!courseId && enabled,
    staleTime: 5 * 60 * 1000 // 5분
  });
};

/**
 * 태그로 설문조사 템플릿 검색 훅
 * @param tags 태그 목록
 * @param enabled 자동 쿼리 활성화 여부
 * @returns 태그로 검색한 설문조사 템플릿 목록 및 쿼리 상태
 */
export const useSearchSurveyCatalogsByTags = (tags: string[], enabled = true) => {
  return useQuery({
    queryKey: ['surveyCatalogs', 'tags', tags],
    queryFn: async ({ queryKey }: QueryFunctionContext<[string, string, string[]]>) => {
      // queryKey[2]에서 태그 목록 추출
      const tagValues = queryKey[2];
      return surveyApi.searchSurveyCatalogsByTags(tagValues);
    },
    enabled: tags.length > 0 && enabled,
    staleTime: 5 * 60 * 1000 // 5분
  });
};