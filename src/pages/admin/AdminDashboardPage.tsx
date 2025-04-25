// app/pages/admin/AdminDashboardPage.tsx
import React, { useState } from 'react';
import {
  AppLayout,
  ContentLayout,
  SpaceBetween,
  Container,
  Header,
  Tabs,
  Box,
  BreadcrumbGroup
} from '@cloudscape-design/components';
import AdminProtectedRoute from '@components/common/AdminProtectedRoute';
import CourseCatalogTab from '@pages/admin/catalog/CourseCatalogTab';
import CustomersTab from '@pages/admin/customers/CustomersTab';
import InstructorsTab from '@pages/admin/instructors/InstructorsTab';

const AdminDashboardPage: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState('courses');

  // 활성 탭 전환 처리
  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
  };

  return (
    <AdminProtectedRoute>
      <AppLayout
        content={
          <ContentLayout>
            <SpaceBetween size="l">
              <Box padding={{ top: 's' }}>
                <BreadcrumbGroup
                  items={[
                    { text: '홈', href: '/' },
                    { text: '관리자 대시보드', href: '/admin' }
                  ]}
                  ariaLabel="탐색"
                />
              </Box>

              <Container
                header={
                  <Header
                    variant="h1"
                    description="과정, 고객사, 강사를 관리하는 관리자 페이지입니다."
                  >
                    관리자 대시보드
                  </Header>
                }
              >
                <Tabs
                  activeTabId={activeTabId}
                  onChange={({ detail }) => handleTabChange(detail.activeTabId)}
                  tabs={[
                    {
                      id: 'courses',
                      label: '과정 카탈로그',
                      content: <CourseCatalogTab />
                    },
                    {
                      id: 'customers',
                      label: '고객사',
                      content: <CustomersTab />
                    },
                    {
                      id: 'instructors',
                      label: '강사',
                      content: <InstructorsTab />
                    }
                  ]}
                />
              </Container>
            </SpaceBetween>
          </ContentLayout>
        }
        headerSelector="#top-navigation"
        navigationHide
        toolsHide
      />
    </AdminProtectedRoute>
  );
};

export default AdminDashboardPage;