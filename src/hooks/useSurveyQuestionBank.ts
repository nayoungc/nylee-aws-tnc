// src/hooks/useSurveyQuestionBank.ts
/**
 * 설문 질문 은행 관리 훅
 * @description React Query를 사용해 설문 질문 은행의 CRUD 작업을 제공하는 훅
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, QueryFunctionContext } from '@tanstack/react-query';
import surveyQuestionBankApi from '@/services/api/surveyQuestionBankApi';
import { 
  SurveyQuestionBank, 
  SurveyQuestionBankInput,
  SurveyQuestionBankUpdate 
} from '@/models/surveyQuestionBank';

/**
 * 설문 질문 은행 관리를 위한 React Query 훅
 * @returns 질문 은행 관리를 위한 상태와 함수들
 */
export const useSurveyQuestionBank = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 질문 은행 항목 목록 조회
  const { 
    data: queryResult = { items: [] }, 
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['questionBankItems'],
    queryFn: async () => {
      return surveyQuestionBankApi.listSurveyQuestionBankItems();
    },
    staleTime: 5 * 60 * 1000 // 5분
  });

  const questionBankItems = queryResult.items;

  // 선택된 질문 은행 항목 조회
  const { data: selectedQuestionBankItem } = useQuery({
    queryKey: ['questionBankItem', selectedId],
    queryFn: async ({ queryKey }: QueryFunctionContext<[string, string | null]>) => {
      const id = queryKey[1];
      if (!id) return null;
      return surveyQuestionBankApi.getSurveyQuestionBankItem(id);
    },
    enabled: !!selectedId,
    staleTime: 5 * 60 * 1000 // 5분
  });

  // 질문 은행 항목 생성 뮤테이션
  const createMutation = useMutation({
    mutationFn: surveyQuestionBankApi.createSurveyQuestionBankItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionBankItems'] });
    }
  });

  // 질문 은행 항목 업데이트 뮤테이션
  const updateMutation = useMutation({
    mutationFn: ({ questionId, input }: { questionId: string; input: SurveyQuestionBankUpdate }) => 
      surveyQuestionBankApi.updateSurveyQuestionBankItem(questionId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questionBankItems'] });
      if (data?.questionId) {
        queryClient.invalidateQueries({ queryKey: ['questionBankItem', data.questionId] });
      }
    }
  });

  // 질문 은행 항목 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: surveyQuestionBankApi.deleteSurveyQuestionBankItem,
    onSuccess: (_, questionId) => {
      queryClient.invalidateQueries({ queryKey: ['questionBankItems'] });
      if (selectedId === questionId) {
        setSelectedId(null);
      }
    }
  });

  // 질문 은행 항목 선택
  const selectQuestionBankItem = useCallback((questionId: string) => {
    setSelectedId(questionId);
  }, []);

  // 질문 은행 항목 생성
  const createQuestionBankItem = useCallback((input: SurveyQuestionBankInput) => {
    return createMutation.mutateAsync(input);
  }, [createMutation]);

  // 질문 은행 항목 업데이트
  const updateQuestionBankItem = useCallback((questionId: string, input: SurveyQuestionBankUpdate) => {
    return updateMutation.mutateAsync({ questionId, input });
  }, [updateMutation]);

  // 질문 은행 항목 삭제
  const deleteQuestionBankItem = useCallback((questionId: string) => {
    return deleteMutation.mutateAsync(questionId);
  }, [deleteMutation]);

  return {
    questionBankItems,
    selectedQuestionBankItem,
    loading,
    error: error as Error | null,
    refetch,
    selectQuestionBankItem,
    createQuestionBankItem,
    updateQuestionBankItem,
    deleteQuestionBankItem,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};

/**
 * 특정 태그의 질문 은행 항목 조회 훅
 * @param tag 태그
 * @param enabled 자동 쿼리 활성화 여부
 * @returns 태그별 질문 은행 항목 목록 및 쿼리 상태
 */
export const useSurveyQuestionBankItemsByTag = (tag: string, enabled = true) => {
  const { 
    data: queryResult = { items: [] }, 
    ...rest 
  } = useQuery({
    queryKey: ['questionBankItems', 'tag', tag],
    queryFn: async ({ queryKey }: QueryFunctionContext<[string, string, string]>) => {
      const tagValue = queryKey[2];
      return surveyQuestionBankApi.getSurveyQuestionBankItemsByTag(tagValue);
    },
    enabled: !!tag && enabled,
    staleTime: 5 * 60 * 1000 // 5분
  });

  return {
    items: queryResult.items,
    ...rest
  };
};

/**
 * 특정 유형의 질문 은행 항목 조회 훅
 * @param type 질문 유형
 * @param enabled 자동 쿼리 활성화 여부
 * @returns 유형별 질문 은행 항목 목록 및 쿼리 상태
 */
export const useSurveyQuestionBankItemsByType = (type: string, enabled = true) => {
  const { 
    data: queryResult = { items: [] }, 
    ...rest 
  } = useQuery({
    queryKey: ['questionBankItems', 'type', type],
    queryFn: async ({ queryKey }: QueryFunctionContext<[string, string, string]>) => {
      const typeValue = queryKey[2];
      return surveyQuestionBankApi.getSurveyQuestionBankItemsByType(typeValue);
    },
    enabled: !!type && enabled,
    staleTime: 5 * 60 * 1000 // 5분
  });

  return {
    items: queryResult.items,
    ...rest
  };
};

/**
 * 텍스트로 질문 은행 항목 검색 훅
 * @param text 검색 텍스트
 * @param enabled 자동 쿼리 활성화 여부
 * @returns 검색된 질문 은행 항목 목록 및 쿼리 상태
 */
export const useSearchSurveyQuestionBankItems = (text: string, enabled = true) => {
  const { 
    data: queryResult = { items: [] }, 
    ...rest 
  } = useQuery({
    queryKey: ['questionBankItems', 'search', text],
    queryFn: async ({ queryKey }: QueryFunctionContext<[string, string, string]>) => {
      const searchText = queryKey[2];
      return surveyQuestionBankApi.searchSurveyQuestionBankItems(searchText);
    },
    enabled: !!text && enabled,
    staleTime: 5 * 60 * 1000 // 5분
  });

  return {
    items: queryResult.items,
    ...rest
  };
};
