// src/pages/admin/CustomerTab.tsx
import {
  Alert,
  Box,
  Button,
  FormField,
  Header,
  Input,
  Modal,
  Pagination,
  SpaceBetween,
  Table,
  TextFilter
} from '@cloudscape-design/components';
import { useAuth, withAuthErrorHandling, createAuthErrorHandler } from '@contexts/AuthContext';

import { useTypedTranslation } from '@utils/i18n-utils';
import React, { useEffect, useState } from 'react';

import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer
} from '@api/customers';
import {
  Customer
} from '@api/types';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const CustomerTab: React.FC = () => {
  const { tString, t } = useTypedTranslation();
  const navigate = useNavigate();
  const { checkAuthStatus, isAuthenticated } = useAuth(); // AuthContext 활용

  // 상태 관리
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>('');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const auth = useAuth();

  // 고객사 목록 불러오기 - withAuthErrorHandling 사용
  const fetchCustomers = async (retryAttempt = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      // 인증 상태 확인 (retryAttempt가 있을 경우 강제 갱신)
      if (retryAttempt > 0) {
        console.log(`재시도 #\${retryAttempt}: 인증 상태 확인 중...`);
        //navigate(`/login?returnTo=\${returnUrl}`);
        //`\${t('admin.common.retrying')} (\${retryCount}/2)...`
        const isAuth = await checkAuthStatus(true);
        if (!isAuth) {
          throw new Error('인증이 필요합니다');
        }
        
        // 지연 추가 (자격 증명 전파를 위해)
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // withAuthErrorHandling 래퍼 적용
      const wrappedListCustomers = withAuthErrorHandling(listCustomers, auth);
      
      const response = await wrappedListCustomers({
        limit: 20
      });
      
      if (response.data) {
        setCustomers(response.data as Customer[]);
        setRetryCount(0);
      }
    } catch (err: any) {
      console.error(t('admin.customers.error_loading'), err);
      
      // 최대 재시도 횟수에 도달하지 않았다면 재시도
      if (retryAttempt < 2) {
        console.log(`오류 발생, 잠시 후 재시도합니다... (\${retryAttempt + 1}/2)`);
        setRetryCount(retryAttempt + 1);
        
        // 0.8초 후 재시도
        setTimeout(() => {
          fetchCustomers(retryAttempt + 1);
        }, 800);
        return;
      }
      
      setError(t('admin.customers.error_loading'));
      
      // 사용자에게 알림 후 로그인 페이지로 이동
      if (retryAttempt >= 2) {
        console.error('인증 오류가 계속됩니다. 로그인 페이지로 이동합니다.');
        setTimeout(() => {
          const returnUrl = encodeURIComponent(window.location.pathname);
          navigate(`/signin?returnTo=\${returnUrl}`);

        }, 1500);
      }
    } finally {
      if (retryCount === 0) {
        setLoading(false);
      }
    }
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      // 페이지 로드 시 잠시 지연 후 데이터 로드 (인증 처리 시간 확보)
      setTimeout(() => {
        fetchCustomers();
      }, 500);
    } else {
      // 인증 상태 확인
      checkAuthStatus(true).then(isAuth => {
        if (isAuth) {
          fetchCustomers();
        } else {
          setError(t('admin.common.auth_required'));
          setLoading(false);
        }
      });
    }
  }, [isAuthenticated, checkAuthStatus, t]);
  
  // 필터링된 아이템
  const filteredItems = customers.filter(customer => 
    !filterText || 
    customer.customerName?.toLowerCase().includes(filterText.toLowerCase())
  );
  
  // 페이지당 아이템 수
  const PAGE_SIZE = 10;
  const paginatedItems = filteredItems.slice(
    (currentPageIndex - 1) * PAGE_SIZE, 
    currentPageIndex * PAGE_SIZE
  );
  
  // 인증 확인 후 작업 수행 헬퍼 함수
  const withAuth = async (callback: () => void) => {
    try {
      const isAuth = await checkAuthStatus(true);
      if (!isAuth) {
        setError(t('admin.common.auth_required'));
        setTimeout(() => {
          const returnUrl = encodeURIComponent(window.location.pathname);
          navigate(`/login?returnTo=\${returnUrl}`);
        }, 1500);
        return;
      }
      callback();
    } catch (err) {
      setError(t('admin.common.auth_required'));
    }
  };
  
  // 새 고객사 만들기
  const handleCreateCustomer = () => {
    withAuth(() => {
      setCurrentCustomer({
        customerId: uuidv4(),
        customerName: '',
      });
      setIsModalVisible(true);
    });
  };
  
  // 고객사 수정
  const handleEditCustomer = (customer: Customer) => {
    withAuth(() => {
      setCurrentCustomer({...customer});
      setIsModalVisible(true);
    });
  };
  
  // 고객사 삭제 모달 표시
  const handleDeleteCustomerClick = (customer: Customer) => {
    withAuth(() => {
      setCurrentCustomer(customer);
      setIsDeleteModalVisible(true);
    });
  };
  
  // 고객사 저장 (생성/수정)
  const handleSaveCustomer = async () => {
    if (!currentCustomer || !currentCustomer.customerName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 인증 확인
      const isAuth = await checkAuthStatus(true);
      if (!isAuth) {
        throw new Error(tString('admin.common.auth_required'));
      }
      
      // 인증 오류 핸들러 생성 - 여기서 문제 발생
      // navigate 함수 직접 전달 대신 구조 변경
      const authContext = {
        handleAuthError: (error: any) => {
          console.error('인증 오류:', error);
          setError(t('admin.customers.error_saving'));
          navigate('/signin'); // navigate 함수는 컴포넌트 스코프 내에서 사용 가능
        }
      };
      
      // withAuthErrorHandling 래퍼 적용
      const wrappedUpdateCustomer = withAuthErrorHandling(updateCustomer, authContext);
      const wrappedCreateCustomer = withAuthErrorHandling(createCustomer, authContext);
      
      if (currentCustomer.customerId) {
        // 기존 고객사 수정
        const customerInput = {
          customerId: currentCustomer.customerId,
          customerName: currentCustomer.customerName,
        };
  
        const response = await wrappedUpdateCustomer(customerInput);
        
        // 수정된 고객사로 상태 업데이트
        if (response.data) {
          setCustomers(prevCustomers => 
            prevCustomers.map(c => c.customerId === currentCustomer.customerId ? response.data as Customer : c)
          );
        }
      } else {
        // 새 고객사 생성
        const customerInput = {
          customerId: uuidv4(),
          customerName: currentCustomer.customerName,
        };
  
        const response = await wrappedCreateCustomer(customerInput);
        
        // 생성된 고객사 추가
        if (response.data) {
          setCustomers(prevCustomers => [...prevCustomers, response.data as Customer]);
        }
      }
      
      // 모달 닫기
      setIsModalVisible(false);
      setCurrentCustomer(null);
    } catch (err: any) {
      console.error(t('admin.customers.error_saving'), err);
      setError(t('admin.customers.error_saving'));
    } finally {
      setLoading(false);
    }
  };
  
  
  // 고객사 삭제
  const handleDeleteCustomer = async () => {
    if (!currentCustomer?.customerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 인증 확인
      const isAuth = await checkAuthStatus(true);
      if (!isAuth) {
        throw new Error(tString('admin.common.auth_required'));
      }
      
      // withAuthErrorHandling 래퍼 적용
      const wrappedDeleteCustomer = withAuthErrorHandling(deleteCustomer, auth);
      
      const response = await wrappedDeleteCustomer(currentCustomer.customerId);
      
      if (response.data) {
        // 삭제된 고객사 제거
        setCustomers(prevCustomers => 
          prevCustomers.filter(c => c.customerId !== currentCustomer.customerId)
        );
      }
      
      // 모달 닫기
      setIsDeleteModalVisible(false);
      setCurrentCustomer(null);
    } catch (err: any) {
      console.error(t('admin.customers.error_deleting'), err);
      setError(t('admin.customers.error_deleting'));
    } finally {
      setLoading(false);
    }
  };

  // 새로고침 버튼 핸들러
  const handleRefresh = () => {
    setRetryCount(0);
    fetchCustomers(0);
  };

  return (
    <Box padding="m">
      {error && <Alert type="error" dismissible>{error}</Alert>}
      
      <Header
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button iconName="refresh" onClick={handleRefresh}>
              {t('admin.common.refresh')}
            </Button>
            <Button variant="primary" onClick={handleCreateCustomer}>
              {t('admin.customers.add_new')}
            </Button>
          </SpaceBetween>
        }
      >
        {t('admin.customers.title')}
      </Header>
      
      <TextFilter
        filteringText={filterText}
        filteringPlaceholder={tString('admin.customers.search_placeholder')}
        filteringAriaLabel={tString('admin.customers.search_aria_label')}
        onChange={({ detail }) => setFilterText(detail.filteringText)}
      />
      
      <Table
        items={paginatedItems}
        loading={loading}
        loadingText={retryCount > 0 
          ? `\${t('admin.common.retrying') || '재시도 중'} (\${retryCount}/2)...` 
          : (t('admin.common.loading') || '로딩 중')}
        columnDefinitions={[
          {
            id: 'customerName',
            header: t('admin.customers.name'),
            cell: item => item.customerName || '-',
            sortingField: 'customerName',
          },
          {
            id: 'actions',
            header: t('admin.common.actions'),
            cell: item => (
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => handleEditCustomer(item)}>
                  {t('admin.common.edit')}
                </Button>
                <Button 
                  variant="normal" 
                  iconName="remove"
                  formAction="none"
                  onClick={() => handleDeleteCustomerClick(item) }
                >
                  {t('admin.common.delete')}
                </Button>
              </SpaceBetween>
            ),
          },
        ]}
        empty={
          <Box textAlign="center" color="inherit">
            <b>{t('admin.customers.no_resources')}</b>
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              {t('admin.customers.no_resources_to_display')}
            </Box>
            <Button onClick={handleRefresh}>{t('admin.common.refresh')}</Button>
          </Box>
        }
      />
      
      {/* 나머지 코드 동일 */}
      <Pagination
        currentPageIndex={currentPageIndex}
        pagesCount={Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))}
        onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
      />
      
      {/* 모달 부분 동일 - 템플릿 리터럴 수정만 필요 */}
      {/* ... */}
    </Box>
  );
};

export default CustomerTab;