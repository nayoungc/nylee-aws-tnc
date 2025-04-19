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

const AdminPage: React.FC = () => {
  // activeTabId 상태 추가 - 누락되었던 부분
  const [activeTabId, setActiveTabId] = useState("courses");

  return (
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
  );
};

export default AdminPage;