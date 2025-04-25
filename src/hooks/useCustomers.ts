import { useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { listCustomers, getCustomer } from '@api/customers';
import { Customer } from '@api/types/customers';

interface UseCustomersOptions {
  customerId?: string;
  initialLoad?: boolean;
}

export const useCustomers = (options: UseCustomersOptions = {}) => {
  const { customerId, initialLoad = true } = options;
  const auth = useAuth();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);

  const loadCustomers = async () => {
    if (!auth.isAuthenticated) {
      setError('인증이 필요합니다');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (customerId) {
        // 특정 고객 정보 가져오기 - auth 객체 전달
        const result = await getCustomer(customerId, auth);
        setCustomer(result);
        setIsMockData(auth.useMockData || !auth.hasCredentials);
      } else {
        // 모든 고객 정보 가져오기 - auth 객체 전달
        const result = await listCustomers(auth);
        setCustomers(result);
        setIsMockData(auth.useMockData || !auth.hasCredentials);
      }
    } catch (err: any) {
      setError(err.message || '고객 데이터를 불러오는 중 오류가 발생했습니다');
      console.error('고객 데이터 로드 중 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    if (initialLoad && auth.isAuthenticated) {
      loadCustomers();
    }
  }, [auth.isAuthenticated, customerId, initialLoad]);

  return {
    customers,
    customer,
    loading,
    error,
    isMockData,
    refresh: loadCustomers
  };
};
