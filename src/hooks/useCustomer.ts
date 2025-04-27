// src/hooks/useCustomer.tsx
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchAllCustomers, 
  fetchCustomerById, 
  searchCustomersList, 
  createNewCustomer,
  updateCustomerInfo,
  deleteCustomerById
} from '@/services/api/customerApi';
import { Customer, CustomerInput, CustomerFilter } from '@/models/customers';

/**
 * Admin CustomersTab에서 사용할 통합된 고객 관리 훅
 */
export const useCustomer = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 고객 목록 가져오기
  const { 
    data: customers = [], 
    isLoading: loading, 
    error,
    refetch
  } = useQuery<Customer[], Error>({
    queryKey: ['customers'],
    queryFn: fetchAllCustomers,
    staleTime: 1000 * 60 * 5 // 5분
  });

  // 선택된 고객 정보
  const { data: selectedCustomer } = useQuery<Customer | null, Error>({
    queryKey: ['customer', selectedId],
    queryFn: () => selectedId ? fetchCustomerById(selectedId) : Promise.resolve(null),
    enabled: !!selectedId,
    staleTime: 1000 * 60 * 5 // 5분
  });

  // 고객 생성 뮤테이션
  const createMutation = useMutation<Customer, Error, CustomerInput>({
    mutationFn: createNewCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });

  // 고객 업데이트 뮤테이션
  const updateMutation = useMutation<Customer, Error, { customerId: string; input: Partial<CustomerInput> }>({
    mutationFn: ({ customerId, input }) => updateCustomerInfo(customerId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
    }
  });

  // 고객 삭제 뮤테이션
  const deleteMutation = useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteCustomerById,
    onSuccess: (_, customerId) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      if (selectedId === customerId) {
        setSelectedId(null);
      }
    }
  });

  // 고객 선택
  const selectCustomer = useCallback((customerId: string) => {
    setSelectedId(customerId);
  }, []);

  // 새 고객 생성
  const createCustomer = useCallback(async (input: CustomerInput) => {
    return await createMutation.mutateAsync(input);
  }, [createMutation]);

  // 선택된 고객 업데이트
  const updateSelectedCustomer = useCallback(async (input: Partial<CustomerInput>) => {
    if (!selectedId) throw new Error('선택된 고객이 없습니다');
    return await updateMutation.mutateAsync({ customerId: selectedId, input });
  }, [selectedId, updateMutation]);

  // 선택된 고객 삭제
  const deleteSelectedCustomer = useCallback(async () => {
    if (!selectedId) throw new Error('선택된 고객이 없습니다');
    return await deleteMutation.mutateAsync(selectedId);
  }, [selectedId, deleteMutation]);

  return {
    customers,
    selectedCustomer,
    loading,
    error: error as Error | null,
    refetch,
    selectCustomer,
    createCustomer,
    updateSelectedCustomer,
    deleteSelectedCustomer,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};

/**
 * 고객 목록 조회 훅
 */
export const useCustomers = (enabled = true) => {
  return useQuery<Customer[], Error>({
    queryKey: ['customers'],
    queryFn: fetchAllCustomers,
    enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * ID로 특정 고객 조회 훅
 */
export const useCustomerById = (customerId: string | undefined, enabled = true) => {
  return useQuery<Customer | null, Error>({
    queryKey: ['customer', customerId],
    queryFn: () => (customerId ? fetchCustomerById(customerId) : Promise.resolve(null)),
    enabled: !!customerId && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

/**
 * 고객 생성 뮤테이션 훅
 */
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Customer, Error, CustomerInput>({
    mutationFn: (input: CustomerInput) => createNewCustomer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
};

/**
 * 고객 수정 뮤테이션 훅
 */
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  interface UpdateCustomerVars {
    customerId: string;
    input: Partial<CustomerInput>;
  }
  
  return useMutation<Customer, Error, UpdateCustomerVars>({
    mutationFn: ({ customerId, input }: UpdateCustomerVars) => updateCustomerInfo(customerId, input),
    onSuccess: (updatedCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', updatedCustomer.id] });
    }
  });
};

/**
 * 고객 삭제 뮤테이션 훅
 */
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (customerId: string) => deleteCustomerById(customerId),
    onSuccess: (_, customerId) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.setQueryData(['customer', customerId], null);
    }
  });
};

/**
 * 필터를 사용한 고객 검색 훅
 */
export const useSearchCustomers = (filter: CustomerFilter = {}, enabled = true) => {
  return useQuery<Customer[], Error>({
    queryKey: ['customers', 'search', filter],
    queryFn: () => searchCustomersList(filter),
    enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};