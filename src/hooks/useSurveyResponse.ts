// src/hooks/useSurveyResponse.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import surveyResponseApi from '@/services/api/surveyResponseApi';
import { SurveyResponse, SurveyResponseInput } from '@/models/surveyResponse';

/**
 * 설문 응답 관리를 위한 React Query 훅
 * @description 설문 응답의 CRUD 작업을 제공합니다.
 */
export const useSurveyResponse = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 설문 응답 목록 조회
  const { 
    data: surveyResponses = [], 
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['surveyResponses'],
    queryFn: surveyResponseApi.listSurveyResponses,
    staleTime: 1000 * 60 * 5 // 5분
  });

  // 선택된 설문 응답 조회
  const { data: selectedSurveyResponse } = useQuery({
    queryKey: ['surveyResponse', selectedId],
    queryFn: () => selectedId ? surveyResponseApi.getSurveyResponse(selectedId) : Promise.resolve(null),
    enabled: !!selectedId,
    staleTime: 1000 * 60 * 5 // 5분
  });

  // 설문 응답 생성 뮤테이션
  const createMutation = useMutation({
    mutationFn: surveyResponseApi.createSurveyResponse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveyResponses'] });
    }
  });

  // 설문 응답 업데이트 뮤테이션
  const updateMutation = useMutation({
    mutationFn: ({ responseId, input }: { responseId: string; input: Partial<SurveyResponseInput> }) => 
      surveyResponseApi.updateSurveyResponse(responseId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surveyResponses'] });
      if (data?.responseId) {
        queryClient.invalidateQueries({ queryKey: ['surveyResponse', data.responseId] });
      }
    }
  });

  // 설문 응답 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: surveyResponseApi.deleteSurveyResponse,
    onSuccess: (_, responseId) => {
      queryClient.invalidateQueries({ queryKey: ['surveyResponses'] });
      if (selectedId === responseId) {
        setSelectedId(null);
      }
    }
  });

  // 설문 응답 선택
  const selectSurveyResponse = useCallback((responseId: string) => {
    setSelectedId(responseId);
  }, []);

  // 설문 응답 생성
  const createSurveyResponse = useCallback((input: SurveyResponseInput) => {
    return createMutation.mutateAsync(input);
  }, [createMutation]);

  // 설문 응답 업데이트
  const updateSurveyResponse = useCallback((responseId: string, input: Partial<SurveyResponseInput>) => {
    return updateMutation.mutateAsync({ responseId, input });
  }, [updateMutation]);

  // 설문 응답 삭제
  const deleteSurveyResponse = useCallback((responseId: string) => {
    return deleteMutation.mutateAsync(responseId);
  }, [deleteMutation]);

  return {
    surveyResponses,
    selectedSurveyResponse,
    loading,
    error: error as Error | null,
    refetch,
    selectSurveyResponse,
    createSurveyResponse,
    updateSurveyResponse,
    deleteSurveyResponse,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};

/**
 * 특정 과정 설문조사의 응답 조회 훅
 * @param courseSurveyId 과정 설문조사 ID
 * @param enabled 자동 쿼리 활성화 여부
 * @returns 과정 설문조사별 응답 목록
 */
export const useSurveyResponsesByCourseSurveyId = (courseSurveyId: string, enabled = true) => {
  return useQuery({
    queryKey: ['surveyResponses', 'courseSurvey', courseSurveyId],
    queryFn: () => surveyResponseApi.getSurveyResponsesByCourseSurveyId(courseSurveyId),
    enabled: !!courseSurveyId && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * 특정 학생의 응답 조회 훅
 * @param studentId 학생 ID
 * @param enabled 자동 쿼리 활성화 여부
 * @returns 학생별 응답 목록
 */
export const useSurveyResponsesByStudentId = (studentId: string, enabled = true) => {
  return useQuery({
    queryKey: ['surveyResponses', 'student', studentId],
    queryFn: () => surveyResponseApi.getSurveyResponsesByStudentId(studentId),
    enabled: !!studentId && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * 설문조사 응답 통계 조회 훅
 * @param courseSurveyId 과정 설문조사 ID
 * @param enabled 자동 쿼리 활성화 여부
 * @returns 설문조사 응답 통계
 */
export const useSurveyResponseStatistics = (courseSurveyId: string, enabled = true) => {
  return useQuery({
    queryKey: ['surveyResponseStatistics', courseSurveyId],
    queryFn: () => surveyResponseApi.getSurveyResponseStatistics(courseSurveyId),
    enabled: !!courseSurveyId && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};
