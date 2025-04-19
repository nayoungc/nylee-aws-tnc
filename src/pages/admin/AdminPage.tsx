// src/pages/admin/AdminPage.tsx
import React, { useState } from 'react';
import { 
  Container, 
  Header, 
  Tabs,
  SpaceBetween
} from '@cloudscape-design/components';
import CourseCatalogTab from './CourseCatalogTab';
import CustomerTab from './CustomerTab';
import InstructorTab from './InstructorTab';
import MainLayout from '../../components/MainLayout';  // 경로 확인 필요

const AdminPage: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState<string>('courses');

  return (
    <MainLayout title="관리자 페이지">
      <SpaceBetween size="l">
        <Container>
          <Header variant="h1">시스템 관리</Header>
          
          <Tabs
            activeTabId={activeTabId}
            onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
            tabs={[
              {
                id: "courses",
                label: "과정 관리",
                content: <CourseCatalogTab />
              },
              {
                id: "customers",
                label: "고객사 관리",
                content: <CustomerTab />
              },
              {
                id: "instructors",
                label: "강사 관리",
                content: <InstructorTab />
              }
            ]}
          />
        </Container>
      </SpaceBetween>
    </MainLayout>
  );
};

export default AdminPage;