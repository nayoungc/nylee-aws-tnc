// src/pages/admin/AdminPage.tsx
import React, { useState, useMemo } from 'react';
import { 
  Container, 
  Header, 
  Tabs,
  SpaceBetween
} from '@cloudscape-design/components';
import CourseCatalogTab from './CourseCatalogTab';
import CustomerTab from './CustomerTab';
import InstructorTab from './InstructorTab';
import { useTypedTranslation } from '../../utils/i18n-utils';

const AdminPage: React.FC = () => {
  const { t } = useTypedTranslation();
  // activeTabId 상태 관리
  const [activeTabId, setActiveTabId] = useState("courses");
  
  // 각 탭 컴포넌트를 메모이제이션하여 렌더링 성능 최적화
  const courseCatalogTabContent = useMemo(() => <CourseCatalogTab />, []);
  const customerTabContent = useMemo(() => <CustomerTab />, []);
  const instructorTabContent = useMemo(() => <InstructorTab />, []);

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description={t('admin.description')}
        >
          {t('admin.title')}
        </Header>
        
        <Tabs
          activeTabId={activeTabId}
          onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
          tabs={[
            {
              id: "courses",
              label: t('admin.tabs.courses'),
              content: courseCatalogTabContent
            },
            {
              id: "customers",
              label: t('admin.tabs.customers'),
              content: customerTabContent
            },
            {
              id: "instructors",
              label: t('admin.tabs.instructors'),
              content: instructorTabContent
            }
          ]}
        />
      </SpaceBetween>
    </Container>
  );
};

export default AdminPage;