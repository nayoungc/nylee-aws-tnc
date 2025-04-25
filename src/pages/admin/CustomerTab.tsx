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
import { fetchAuthSession } from 'aws-amplify/auth';

const CustomerTab: React.FC = () => {
  const { tString, t } = useTypedTranslation();

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

  // 인증 관련 오류인지 확인하는 함수
  const isAuthError = (err: any): boolean => {
    if (!err) return false;
    
    const message = err.message || '';
    return (
      message.includes('자격 증명') ||
      message.includes('세션') || 
      message.includes('인증') ||
      message.includes('로그인') ||
      err.code === 'CredentialsError' ||
      err.code === 'NotAuthorizedException' ||
      err.code === 'UnrecognizedClientException'
    );
  };

  // 인증 상태 확인 함수
  const checkAuth = async (): Promise<boolean> => {
    try {
      // 자격 증명 강제 새로고침 및 토큰 확인
      const session = await fetchAuthSession({ 
        forceRefresh: true // 중요: 항상 새로운 세션 가져오기
      });
      
      // 토큰이 있으면 인증된 것으로 판단
      const isAuth = !!session.tokens;
      
      // 추가 디버깅 정보
      if (isAuth) {
        console.log('인증 확인 성공: 유효한 토큰 발견');
      } else {
        console.log('인증 확인 실패: 토큰 없음');
      }
      
      return isAuth;
    } catch (err) {
      console.error('인증 체크 실패:', err);
      return false;
    }
  };

  // 고객사 목록 불러오기 - 개선된 버전
  const fetchCustomers = async (retryAttempt = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      // 인증 지연을 위한 짧은 대기
      if (retryAttempt > 0) {
        console.log(`재시도 #\${retryAttempt}: 인증 상태 확인 중...`);
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          throw new Error('인증이 필요합니다');
        }
        
        // 지연 추가 (자격 증명 전파를 위해)
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      const response = await listCustomers({
        limit: 20
      });
      
      if (response.data) {
        setCustomers(response.data as Customer[]);
        
        // 성공 시 재시도 카운트 초기화
        setRetryCount(0);
      }
    } catch (err: any) {
      console.error(t('admin.customers.error_loading'), err);
      
      // 인증 오류이고 최대 재시도 횟수(2)에 도달하지 않았다면 재시도
      if (isAuthError(err) && retryAttempt < 2) {
        console.log(`인증 오류 발생, 잠시 후 재시도합니다... (\${retryAttempt + 1}/2)`);
        setRetryCount(retryAttempt + 1);
        
        // 0.5초 후 재시도
        setTimeout(() => {
          fetchCustomers(retryAttempt + 1);
        }, 800);
        return;
      }
      
      setError(t('admin.customers.error_loading'));
      
      // 인증 오류이고 최대 재시도를 초과했을 경우 로그인 페이지로 리디렉션
      if (isAuthError(err) && retryAttempt >= 2) {
        console.error('인증 오류가 계속됩니다. 로그인 페이지로 이동합니다.');
        setTimeout(() => {
          const returnUrl = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?returnTo=\${returnUrl}`;
        }, 1000);
      }
    } finally {
      // 로딩 상태는 재시도하지 않을 때만 해제
      if (retryCount === 0) {
        setLoading(false);
      }
    }
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    // 페이지 로드 시 잠시 지연 후 데이터 로드 (인증 처리 시간 확보)
    setTimeout(() => {
      fetchCustomers();
    }, 500);
  }, []);
  
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
  
  // 새 고객사 만들기
  const handleCreateCustomer = async () => {
    // 인증 확인 후 진행
    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        setError(t('admin.common.auth_required') || '인증이 필요합니다');
        setTimeout(() => {
          const returnUrl = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?returnTo=\${returnUrl}`;
        }, 1000);
        return;
      }
      
      setCurrentCustomer({
        customerId: uuidv4(),
        customerName: '',
      });
      setIsModalVisible(true);
    } catch (err) {
      setError(t('admin.common.auth_required') || '인증이 필요합니다');
    }
  };
  
  // 고객사 수정
  const handleEditCustomer = async (customer: Customer) => {
    // 인증 확인 후 진행
    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        setError(t('admin.common.auth_required') || '인증이 필요합니다');
        setTimeout(() => {
          const returnUrl = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?returnTo=\${returnUrl}`;
        }, 1000);
        return;
      }
      
      setCurrentCustomer({...customer});
      setIsModalVisible(true);
    } catch (err) {
      setError(t('admin.common.auth_required') || '인증이 필요합니다');
    }
  };
  
  // 고객사 삭제 모달 표시
  const handleDeleteCustomerClick = async (customer: Customer) => {
    // 인증 확인 후 진행
    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        setError(t('admin.common.auth_required') || '인증이 필요합니다');
        setTimeout(() => {
          const returnUrl = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?returnTo=\${returnUrl}`;
        }, 1000);
        return;
      }
      
      setCurrentCustomer(customer);
      setIsDeleteModalVisible(true);
    } catch (err) {
      setError(t('admin.common.auth_required') || '인증이 필요합니다');
    }
  };
  
  // 고객사 저장 (생성/수정)
  const handleSaveCustomer = async () => {
    if (!currentCustomer || !currentCustomer.customerName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 인증 확인
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        throw new Error(t('admin.common.auth_required') || '인증이 필요합니다');
      }
      
      if (currentCustomer.customerId) {
        // 기존 고객사 수정
        const customerInput = {
          customerId: currentCustomer.customerId,
          customerName: currentCustomer.customerName,
        };

        const response = await updateCustomer(customerInput);
        
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

        const response = await createCustomer(customerInput);
        
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
      
      // 인증 오류 처리
      if (isAuthError(err)) {
        setTimeout(() => {
          const returnUrl = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?returnTo=\${returnUrl}`;
        }, 1000);
      }
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
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        throw new Error(t('admin.common.auth_required') || '인증이 필요합니다');
      }
      
      const response = await deleteCustomer(currentCustomer.customerId);
      
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
      
      // 인증 오류 처리
      if (isAuthError(err)) {
        setTimeout(() => {
          const returnUrl = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?returnTo=\${returnUrl}`;
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  // 새로고침 버튼 핸들러
  const handleRefresh = () => {
    // 재시도 카운트 초기화하고 데이터 다시 로드
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
      
      <Pagination
        currentPageIndex={currentPageIndex}
        pagesCount={Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))}
        onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
      />
      
      {/* 고객사 생성/수정 모달 */}
      <Modal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        header={currentCustomer?.customerId ? t('admin.customers.edit') : t('admin.customers.create')}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setIsModalVisible(false)}>
                {t('admin.common.cancel')}
              </Button>
              <Button variant="primary" onClick={handleSaveCustomer} disabled={!currentCustomer?.customerName}>
                {t('admin.common.save')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <FormField label={t('admin.customers.name')}>
          <Input
            value={currentCustomer?.customerName || ''}
            onChange={({ detail }) => 
              setCurrentCustomer(curr => curr ? {...curr, customerName: detail.value} : null)
            }
          />
        </FormField>
      </Modal>
      
      {/* 고객사 삭제 모달 */}
      <Modal
        visible={isDeleteModalVisible}
        onDismiss={() => setIsDeleteModalVisible(false)}
        header={t('admin.customers.delete')}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setIsDeleteModalVisible(false)}>
                {t('admin.common.cancel')}
              </Button>
              <Button 
                variant="normal" 
                iconName="remove"
                formAction="none"
                onClick={handleDeleteCustomer}
              >
                {t('admin.common.delete')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <p>
          {t('admin.customers.delete_confirmation', {
            name: currentCustomer?.customerName
          })}
        </p>
      </Modal>
    </Box>
  );
};

export default CustomerTab;