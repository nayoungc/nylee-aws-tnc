// src/pages/admin/CustomerTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  SpaceBetween, 
  Box, 
  Pagination, 
  TextFilter, 
  Header, 
  Modal, 
  FormField, 
  Input, 
  Alert
} from '@cloudscape-design/components';
import { useTypedTranslation } from '../../utils/i18n-utils';
import {
  Customer,
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../../graphql/client';

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

  // 고객사 목록 불러오기
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await listCustomers({
        limit: 20
      });
      
      if (response.data) {
        setCustomers(response.data);
      }
    } catch (err) {
      console.error(t('admin.customers.error_loading'), err);
      setError(t('admin.customers.error_loading'));
    } finally {
      setLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  // 필터링된 아이템
  const filteredItems = customers.filter(customer => 
    !filterText || 
    customer.name?.toLowerCase().includes(filterText.toLowerCase())
  );
  
  // 페이지당 아이템 수
  const PAGE_SIZE = 10;
  const paginatedItems = filteredItems.slice(
    (currentPageIndex - 1) * PAGE_SIZE, 
    currentPageIndex * PAGE_SIZE
  );
  
  // 새 고객사 만들기
  const handleCreateCustomer = () => {
    setCurrentCustomer({
      name: '',
    });
    setIsModalVisible(true);
  };
  
  // 고객사 수정
  const handleEditCustomer = (customer: Customer) => {
    setCurrentCustomer({...customer});
    setIsModalVisible(true);
  };
  
  // 고객사 삭제 모달 표시
  const handleDeleteCustomerClick = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsDeleteModalVisible(true);
  };
  
  // 고객사 저장 (생성/수정)
  const handleSaveCustomer = async () => {
    if (!currentCustomer || !currentCustomer.name) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (currentCustomer.id) {
        // 기존 고객사 수정
        const customerInput = {
          id: currentCustomer.id,
          name: currentCustomer.name,
        };

        const response = await updateCustomer(customerInput);
        
        // 수정된 고객사로 상태 업데이트
        if (response.data) {
          setCustomers(prevCustomers => 
            prevCustomers.map(c => c.id === currentCustomer.id ? response.data : c)
          );
        }
      } else {
        // 새 고객사 생성
        const customerInput = {
          name: currentCustomer.name,
        };

        const response = await createCustomer(customerInput);
        
        // 생성된 고객사 추가
        if (response.data) {
          setCustomers(prevCustomers => [...prevCustomers, response.data]);
        }
      }
      
      // 모달 닫기
      setIsModalVisible(false);
      setCurrentCustomer(null);
    } catch (err) {
      console.error(t('admin.customers.error_saving'), err);
      setError(t('admin.customers.error_saving'));
    } finally {
      setLoading(false);
    }
  };
  
  // 고객사 삭제
  const handleDeleteCustomer = async () => {
    if (!currentCustomer?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await deleteCustomer(currentCustomer.id);
      
      if (response.data) {
        // 삭제된 고객사 제거
        setCustomers(prevCustomers => 
          prevCustomers.filter(c => c.id !== currentCustomer.id)
        );
      }
      
      // 모달 닫기
      setIsDeleteModalVisible(false);
      setCurrentCustomer(null);
    } catch (err) {
      console.error(t('admin.customers.error_deleting'), err);
      setError(t('admin.customers.error_deleting'));
    } finally {
      setLoading(false);
    }
  };

  // JSX 부분은 그대로 유지
  return (
    // 기존의 JSX 반환 (변경 없음)
    <Box padding="m">
      {/* 기존 코드와 동일 */}
    </Box>
  );
};

export default CustomerTab;