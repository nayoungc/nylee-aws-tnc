// src/pages/admin/CustomerTab.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Header,
  Pagination,
  SpaceBetween,
  Table,
  TextFilter,
  Modal,
  FormField,
  Input
} from '@cloudscape-design/components';
import { useAuth, withAuthErrorHandling, createAuthErrorHandler } from '@contexts/AuthContext';
import { useTypedTranslation } from '@utils/i18n-utils';
import { v4 as uuidv4 } from 'uuid';
import { 
  listCustomers, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} from '@api/customers';
import { Customer } from '@api/types';

// 모의 고객사 데이터
const mockCustomers: Customer[] = [
  { customerId: 'mock-1', customerName: '샘플 고객사 1' },
  { customerId: 'mock-2', customerName: '샘플 고객사 2' },
  { customerId: 'mock-3', customerName: '샘플 고객사 3' },
  { customerId: 'mock-4', customerName: '샘플 고객사 4' },
  { customerId: 'mock-5', customerName: '샘플 고객사 5' }
];

const CustomerTab: React.FC = () => {
  const { tString, t } = useTypedTranslation();
  const navigate = useNavigate();
  const { checkAuthStatus, isAuthenticated, hasCredentials, refreshCredentials } = useAuth();

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
  const [useMockData, setUseMockData] = useState<boolean>(false);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [credentialLoading, setCredentialLoading] = useState<boolean>(false);

  // 고객사 목록 불러오기
  const fetchCustomers = async (retryAttempt = 0) => {
    // 이미 데이터가 로드되었다면 중복 로드 방지
    if (dataLoaded && !retryAttempt) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 인증은 되었지만 AWS 자격 증명이 없는 경우 모의 데이터 사용
      if (!hasCredentials) {
        console.log('자격 증명 없음, 모의 데이터 사용');
        setUseMockData(true);
        setCustomers(mockCustomers);
        setDataLoaded(true);
        setLoading(false);
        return;
      }
      
      // 인증 상태 확인 (retryAttempt가 있을 경우 강제 갱신)
      if (retryAttempt > 0) {
        console.log(`재시도 #\${retryAttempt}: 인증 상태 확인 중...`);
        const isAuth = await checkAuthStatus(true);
        if (!isAuth) {
          throw new Error('인증이 필요합니다');
        }
        
        // 지연 추가 (자격 증명 전파를 위해)
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      console.log('실제 데이터 로드 시도');
      
      // withAuthErrorHandling 래퍼 적용
      const result = await withAuthErrorHandling(
        async () => {
          try {
            const response = await listCustomers();
            return response.data;
          } catch (error) {
            console.error('고객사 목록 로드 중 오류:', error);
            throw error;
          }
        },
        createAuthErrorHandler(
          (error) => {
            console.error('인증 오류:', error);
            setUseMockData(true);
            setCustomers(mockCustomers);
          },
          navigate
        )
      )();

      if (result && result.length > 0) {
        setUseMockData(false);
        setCustomers(result);
        console.log('실제 고객사 데이터 로드 성공');
      } else {
        console.log('고객사 데이터가 없거나 비어있습니다. 모의 데이터 사용');
        setUseMockData(true);
        setCustomers(mockCustomers);
      }
      
      setRetryCount(0);
      setDataLoaded(true);
      
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
      
      console.log('최대 재시도 횟수 초과, 모의 데이터 사용');
      setError(t('admin.customers.error_loading'));
      setUseMockData(true);
      setCustomers(mockCustomers);
      setDataLoaded(true);
      
    } finally {
      setLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 데이터 로드 (한 번만)
  useEffect(() => {
    if (dataLoaded) return;
    
    if (isAuthenticated) {
      fetchCustomers();
    } else {
      // 인증 상태 확인
      checkAuthStatus(false).then(isAuth => {
        if (isAuth) {
          fetchCustomers();
        } else {
          setError(t('admin.common.auth_required'));
          setLoading(false);
          
          setTimeout(() => {
            const returnUrl = encodeURIComponent(window.location.pathname);
            navigate(`/signin?returnTo=\${returnUrl}`);
          }, 1500);
        }
      });
    }
  }, [isAuthenticated]);
  
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
  
  // 자격 증명 갱신 시도
  const handleRefreshCredentials = async () => {
    setCredentialLoading(true);
    try {
      const success = await refreshCredentials();
      if (success) {
        // 성공 시 실제 데이터 로드
        setUseMockData(false);
        setDataLoaded(false);  // 데이터 재로드 플래그
        fetchCustomers(0);
      } else {
        alert(t('auth.credentials_refresh_failed') || '자격 증명 갱신에 실패했습니다. 다시 로그인해주세요.');
      }
    } catch (error) {
      console.error('자격 증명 갱신 중 오류:', error);
    } finally {
      setCredentialLoading(false);
    }
  };
  
  // 로그아웃 후 로그인으로 이동
  const handleLogoutAndLogin = async () => {
    setCredentialLoading(true);
    try {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/signout');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      setCredentialLoading(false);
    }
  };
  
  // 인증 확인 후 작업 수행 헬퍼 함수
  const withAuth = async (callback: () => void) => {
    try {
      const isAuth = await checkAuthStatus(false);
      if (!isAuth) {
        setError(t('admin.common.auth_required'));
        setTimeout(() => {
          const returnUrl = encodeURIComponent(window.location.pathname);
          navigate(`/signin?returnTo=\${returnUrl}`);
        }, 1500);
        return;
      }
      callback();
    } catch (err) {
      setError(t('admin.common.auth_required'));
    }
  };
  
  // CRUD 작업은 모의 데이터 모드에서는 메모리 상태만 변경합니다
  
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
      const isAuth = await checkAuthStatus(false);
      if (!isAuth) {
        throw new Error(tString('admin.common.auth_required'));
      }
      
      // 모의 데이터 모드이거나 자격 증명이 없는 경우 메모리에서만 처리
      if (useMockData || !hasCredentials) {
        if (customers.find(c => c.customerId === currentCustomer.customerId)) {
          // 기존 고객사 수정 (메모리)
          setCustomers(prevCustomers => 
            prevCustomers.map(c => c.customerId === currentCustomer.customerId ? currentCustomer : c)
          );
        } else {
          // 새 고객사 추가 (메모리)
          setCustomers(prevCustomers => [...prevCustomers, currentCustomer]);
        }
        
        // 모달 닫기
        setIsModalVisible(false);
        setCurrentCustomer(null);
        setLoading(false);
        return;
      }
      
      const authErrorHandler = createAuthErrorHandler(
        (error) => {
          console.error('인증 오류:', error);
          setError(t('admin.customers.error_saving'));
        },
        navigate
      );
      
      if (customers.find(c => c.customerId === currentCustomer.customerId)) {
        // 기존 고객사 수정
        const result = await withAuthErrorHandling(
          async () => {
            const response = await updateCustomer(currentCustomer);
            return response.data;
          },
          authErrorHandler
        )();
        
        // 수정된 고객사로 상태 업데이트
        if (result) {
          setCustomers(prevCustomers => 
            prevCustomers.map(c => c.customerId === currentCustomer.customerId ? result : c)
          );
        }
      } else {
        // 새 고객사 생성
        const result = await withAuthErrorHandling(
          async () => {
            const response = await createCustomer(currentCustomer);
            return response.data;
          },
          authErrorHandler
        )();
        
        // 생성된 고객사 추가
        if (result) {
          setCustomers(prevCustomers => [...prevCustomers, result]);
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
      const isAuth = await checkAuthStatus(false);
      if (!isAuth) {
        throw new Error(tString('admin.common.auth_required'));
      }
      
      // 모의 데이터 모드이거나 자격 증명이 없는 경우 메모리에서만 처리
      if (useMockData || !hasCredentials) {
        // 로컬에서 삭제
        setCustomers(prevCustomers => 
          prevCustomers.filter(c => c.customerId !== currentCustomer.customerId)
        );
        
        // 모달 닫기
        setIsDeleteModalVisible(false);
        setCurrentCustomer(null);
        setLoading(false);
        return;
      }
      
      const result = await withAuthErrorHandling(
        async () => {
          const response = await deleteCustomer(currentCustomer.customerId);
          return response.data;
        },
        createAuthErrorHandler(
          (error) => {
            console.error('인증 오류:', error);
            setError(t('admin.customers.error_deleting'));
          },
          navigate
        )
      )();
      
      if (result) {
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
    setDataLoaded(false);
    fetchCustomers(0);
  };

  // 자격 증명 경고 표시
  const renderCredentialsWarning = () => (
    isAuthenticated && !hasCredentials && (
      <Box padding="s">
        <Alert
          type="warning"
          header={t('auth.credentials_required') || "AWS 자격 증명 필요"}
          action={
            <Button
              onClick={handleRefreshCredentials}
              loading={credentialLoading}
            >
              {t('auth.refresh_credentials') || "자격 증명 갱신"}
            </Button>
          }
        >
          {t('auth.mock_data_warning') || "AWS 자격 증명 부족으로 모의 데이터가 표시되고 있습니다. 실제 데이터를 보려면 자격 증명을 갱신하세요."}
        </Alert>
      </Box>
    )
  );

  // 고객사 수정/생성 모달
  const renderEditModal = () => (
    <Modal
      visible={isModalVisible}
      onDismiss={() => setIsModalVisible(false)}
      header={currentCustomer?.customerId && customers.find(c => c.customerId === currentCustomer.customerId) 
        ? t('admin.customers.edit_customer') || "고객사 수정" 
        : t('admin.customers.create_customer') || "고객사 추가"
      }
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={() => setIsModalVisible(false)}>
              {t('admin.common.cancel') || "취소"}
            </Button>
            <Button variant="primary" onClick={handleSaveCustomer}>
              {t('admin.common.save') || "저장"}
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <FormField 
        label={t('admin.customers.name') || "고객사명"}
        description={t('admin.customers.name_description') || "고객사의 이름을 입력하세요."}
      >
        <Input
          value={currentCustomer?.customerName || ''}
          onChange={({ detail }) => 
            setCurrentCustomer(prev => prev ? { ...prev, customerName: detail.value } : null)
          }
        />
      </FormField>
    </Modal>
  );

  // 고객사 삭제 확인 모달
  const renderDeleteModal = () => (
    <Modal
      visible={isDeleteModalVisible}
      onDismiss={() => setIsDeleteModalVisible(false)}
      header={t('admin.customers.delete_customer') || "고객사 삭제"}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={() => setIsDeleteModalVisible(false)}>
              {t('admin.common.cancel') || "취소"}
            </Button>
            <Button variant="primary" onClick={handleDeleteCustomer}>
              {t('admin.common.delete') || "삭제"}
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <Box>
        {t('admin.customers.delete_confirmation', { customerName: currentCustomer?.customerName }) || 
          `정말로 '\${currentCustomer?.customerName}' 고객사를 삭제하시겠습니까?`}
      </Box>
    </Modal>
  );

  return (
    <Box padding="m">
      {error && <Alert type="error" dismissible>{error}</Alert>}
      
      {renderCredentialsWarning()}
      
      {useMockData && (
        <Alert
          type="info"
          header={t('courses.mock_data_header') || "모의 데이터 표시 중"}
        >
          {t('courses.mock_data_description') || "현재 AWS 자격 증명 부족으로 실제 데이터를 불러올 수 없어 모의 데이터를 표시합니다."}
        </Alert>
      )}
      
      <Header
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button iconName="refresh" onClick={handleRefresh}>
              {t('admin.common.refresh') || "새로고침"}
            </Button>
            <Button variant="primary" onClick={handleCreateCustomer}>
              {t('admin.customers.add_new') || "고객사 추가"}
            </Button>
          </SpaceBetween>
        }
      >
        {t('admin.customers.title') || "고객사 관리"}
      </Header>
      
      <TextFilter
        filteringText={filterText}
        filteringPlaceholder={tString('admin.customers.search_placeholder') || "고객사 검색"}
        filteringAriaLabel={tString('admin.customers.search_aria_label') || "고객사 검색"}
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
            header: t('admin.customers.name') || "고객사명",
            cell: item => item.customerName || '-',
            sortingField: 'customerName',
          },
          {
            id: 'actions',
            header: t('admin.common.actions') || "작업",
            cell: item => (
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => handleEditCustomer(item)}>
                  {t('admin.common.edit') || "편집"}
                </Button>
                <Button 
                  variant="normal" 
                  iconName="remove"
                  onClick={() => handleDeleteCustomerClick(item)}
                >
                  {t('admin.common.delete') || "삭제"}
                </Button>
              </SpaceBetween>
            ),
          },
        ]}
        empty={
          <Box textAlign="center" color="inherit">
            <b>{t('admin.customers.no_resources') || "고객사가 없습니다"}</b>
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              {t('admin.customers.no_resources_to_display') || "표시할 고객사가 없습니다"}
            </Box>
            <Button onClick={handleRefresh}>{t('admin.common.refresh') || "새로고침"}</Button>
          </Box>
        }
      />
      
      <Pagination
        currentPageIndex={currentPageIndex}
        pagesCount={Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))}
        onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
      />
      
      {renderEditModal()}
      {renderDeleteModal()}
    </Box>
  );
};

export default CustomerTab;