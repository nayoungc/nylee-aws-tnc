// src/hooks/useInstructor.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchAllInstructors, 
  fetchInstructorById, 
  searchInstructorsList, 
  createNewInstructor,
  updateInstructorInfo,
  changeInstructorStatusById
} from '@services/api/instructorApi';
import { Instructor, InstructorInput, InstructorFilter, InstructorStatus } from '@/models/instructor';

/**
 * InstructorsTab에서 사용할 통합된 강사 관리 훅
 */
export const useInstructor = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 강사 목록 가져오기
  const { 
    data: instructors = [], 
    isLoading: loading, 
    error,
    refetch
  } = useQuery<Instructor[], Error>({
    queryKey: ['instructors'],
    queryFn: fetchAllInstructors,
    staleTime: 1000 * 60 * 5 // 5분
  });

  // 선택된 강사 정보
  const { data: selectedInstructor } = useQuery<Instructor | null, Error>({
    queryKey: ['instructor', selectedId],
    queryFn: () => selectedId ? fetchInstructorById(selectedId) : Promise.resolve(null),
    enabled: !!selectedId,
    staleTime: 1000 * 60 * 5 // 5분
  });

  // 강사 생성 뮤테이션
  const createMutation = useMutation<Instructor, Error, InstructorInput>({
    mutationFn: createNewInstructor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    }
  });

  // 강사 업데이트 뮤테이션
  const updateMutation = useMutation<Instructor, Error, { id: string; input: Partial<InstructorInput> }>({
    mutationFn: ({ id, input }) => updateInstructorInfo(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', data.id] });
    }
  });

  // 강사 상태 변경 뮤테이션
  const statusChangeMutation = useMutation<
    { id: string; status: string; updatedAt: string }, 
    Error, 
    { id: string; status: InstructorStatus }
  >({
    mutationFn: ({ id, status }) => changeInstructorStatusById(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', data.id] });
    }
  });

  // 강사 선택
  const selectInstructor = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  // 새 강사 생성
  const createInstructor = useCallback(async (input: InstructorInput) => {
    return await createMutation.mutateAsync(input);
  }, [createMutation]);

  // 선택된 강사 업데이트
  const updateSelectedInstructor = useCallback(async (input: Partial<InstructorInput>) => {
    if (!selectedId) throw new Error('선택된 강사가 없습니다');
    return await updateMutation.mutateAsync({ id: selectedId, input });
  }, [selectedId, updateMutation]);

  // 선택된 강사 상태 변경
  const changeSelectedInstructorStatus = useCallback(async (status: InstructorStatus) => {
    if (!selectedId) throw new Error('선택된 강사가 없습니다');
    return await statusChangeMutation.mutateAsync({ id: selectedId, status });
  }, [selectedId, statusChangeMutation]);

  return {
    instructors,
    selectedInstructor,
    loading,
    error: error as Error | null,
    refetch,
    selectInstructor,
    createInstructor,
    updateSelectedInstructor,
    changeSelectedInstructorStatus,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isChangingStatus: statusChangeMutation.isPending
  };
};

/**
 * 강사 목록 조회 훅
 */
export const useInstructors = (enabled = true) => {
  return useQuery<Instructor[], Error>({
    queryKey: ['instructors'],
    queryFn: fetchAllInstructors,
    enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * ID로 특정 강사 조회 훅
 */
export const useInstructorById = (id: string | undefined, enabled = true) => {
  return useQuery<Instructor | null, Error>({
    queryKey: ['instructor', id],
    queryFn: () => (id ? fetchInstructorById(id) : Promise.resolve(null)),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * 필터를 사용한 강사 검색 훅
 */
export const useSearchInstructors = (filter: InstructorFilter = {}, enabled = true) => {
  return useQuery<Instructor[], Error>({
    queryKey: ['instructors', 'search', filter],
    queryFn: () => searchInstructorsList(filter),
    enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * 강사 생성 뮤테이션 훅
 */
export const useCreateInstructor = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Instructor, Error, InstructorInput>({
    mutationFn: (input: InstructorInput) => createNewInstructor(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    }
  });
};

/**
 * 강사 수정 뮤테이션 훅
 */
export const useUpdateInstructor = () => {
  const queryClient = useQueryClient();
  
  interface UpdateInstructorVars {
    id: string;
    input: Partial<InstructorInput>;
  }
  
  return useMutation<Instructor, Error, UpdateInstructorVars>({
    mutationFn: ({ id, input }: UpdateInstructorVars) => updateInstructorInfo(id, input),
    onSuccess: (updatedInstructor) => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', updatedInstructor.id] });
    }
  });
};

/**
 * 강사 상태 변경 뮤테이션 훅
 */
export const useChangeInstructorStatus = () => {
  const queryClient = useQueryClient();
  
  interface ChangeStatusVars {
    id: string;
    status: InstructorStatus;
  }
  
  return useMutation<{ id: string; status: string; updatedAt: string }, Error, ChangeStatusVars>({
    mutationFn: ({ id, status }: ChangeStatusVars) => changeInstructorStatusById(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      queryClient.invalidateQueries({ queryKey: ['instructor', data.id] });
    }
  });
};
