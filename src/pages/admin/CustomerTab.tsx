import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
  Alert,
  Table,
  Pagination,
  TextFilter,
  StatusIndicator,
} from '@cloudscape-design/components';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomers } from '../../hooks/useCustomers';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';

const CustomerTab: React.FC = () => {
  const { t } = useTypedTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const { customers, loading, error, isMockData, refresh } = useCustomers();
  const [filterText, setFilterText] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const PAGE_SIZE = 10;

  // 고객 상태에 따른 상태 표시기 렌더링
  const renderStatus = (status?: string) => {
    switch (status) {
      case 'active':
        return <StatusIndicator type="success">활성</StatusIndicator>;
      case 'inactive':
        return <StatusIndicator type="stopped">비활성</StatusIndicator>;
      case 'pending':
        return <StatusIndicator type="pending">대기</StatusIndicator>;
      default:
        return <StatusIndicator type="info">{status || '알 수 없음'}</StatusIndicator>;
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.customerName?.toLowerCase().includes(filterText.toLowerCase())
  );

  // 페이지네이션
  const startIndex = (currentPageIndex - 1) * PAGE_SIZE;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + PAGE_SIZE);
  const pagesCount = Math.ceil(filteredCustomers.length / PAGE_SIZE) || 1;

  // 자격 증명 갱신
  const handleRefreshCredentials = async () => {
    try {
      const success = await auth.refreshCredentials();
      if (success) {
        refresh();
      } else {
        alert('자격 증명 갱신에 실패했습니다. 다시 로그인해주세요.');
      }
    } catch (error) {
      console.error('자격 증명 갱신 중 오류:', error);
    }
  };

  return (
    <Container
      header={
        <Header
          variant="h1"
          description="고객 정보 관리 및 조회"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button iconName="refresh" onClick={refresh}>
                새로고침
              </Button>
              <Button variant="primary" onClick={() => navigate('/customers/create')}>
                고객 추가
              </Button>
            </SpaceBetween>
          }
        >
          고객 관리
        </Header>
      }
    >
      {/* 자격 증명 경고 */}
      {auth.isAuthenticated && !auth.hasCredentials && (
        <Box padding="s">
          <Alert
            type="warning"
            header="AWS 자격 증명 필요"
            action={
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={handleRefreshCredentials}>
                  자격 증명 갱신
                </Button>
                <Button
                  variant="primary"
                  onClick={() => auth.loginRedirect()}
                >
                  로그아웃 후 다시 로그인
                </Button>
              </SpaceBetween>
            }
          >
            AWS 자격 증명 부족으로 모의 데이터가 표시되고 있습니다.
          </Alert>
        </Box>
      )}

      {/* 모의 데이터 알림 */}
      {isMockData && (
        <Alert
          type="info"
          header="모의 데이터 표시 중"
        >
          현재 모의 데이터를 표시하고 있습니다.
        </Alert>
      )}

      {/* 오류 메시지 */}
      {error && (
        <Alert type="error" dismissible>
          {error}
        </Alert>
      )}

      {/* 테이블 */}
      <Table
        loading={loading}
        loadingText="로딩 중..."
        header={
          <Header
            counter={`\${filteredCustomers.length}`}
            actions={
              <TextFilter
                filteringText={filterText}
                filteringPlaceholder="고객 검색..."
                filteringAriaLabel="고객 검색"
                onChange={({ detail }) => setFilterText(detail.filteringText)}
              />
            }
          >
            고객 목록
          </Header>
        }
        columnDefinitions={[
          {
            id: 'customerName',
            header: '고객명',
            cell: item => item.customerName,
            sortingField: 'customerName'
          },
          {
            id: 'actions',
            header: '작업',
            cell: item => (
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => navigate(`/customers/\${item.customerId}`)}>
                  보기
                </Button>
                <Button onClick={() => navigate(`/customers/\${item.customerId}/edit`)}>
                  편집
                </Button>
              </SpaceBetween>
            )
          }
        ]}
        items={paginatedCustomers}
        pagination={
          <Pagination
            currentPageIndex={currentPageIndex}
            pagesCount={pagesCount}
            onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
            ariaLabels={{
              nextPageLabel: '다음',
              previousPageLabel: '이전',
              pageLabel: page => `\${page}페이지`
            }}
          />
        }
        empty={
          <Box textAlign="center" padding="l">
            <b>고객이 없습니다</b>
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              표시할 고객이 없습니다.
            </Box>
            <Button onClick={refresh}>
              새로고침
            </Button>
          </Box>
        }
      />
    </Container>
  );
};

export default CustomerTab;