// src/pages/admin/CourseManagementPage.tsx
import React, { useState } from 'react';
import {
  ContentLayout,
  SpaceBetween,
  Tabs,
  Container,
  Header,
  BreadcrumbGroup
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';
import CourseCatalogTab from '@/components/admin/courseCatalog/CourseCatalogTab';
import CustomersTab from '@components/admin/customers/CustomersTab';
import InstructorsTab from '@components/admin/instructors/InstructorsTab';

const CourseManagementPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'navigation', 'common']);
  const [activeTabId, setActiveTabId] = useState('catalog');

  return (
    <MainLayout 
      activeHref="/admin/course-management"
      title={t('admin:courseManagement.title', '교육 관리')}
    >
      <ContentLayout>
        <SpaceBetween size="l">
          <BreadcrumbGroup
            items={[
              { text: t('common:home'), href: '/' },
              { text: t('navigation:admin.title'), href: '/admin' },
              { text: t('navigation:admin.courseManagement'), href: '/admin/course-management' }
            ]}
            ariaLabel={t('common:breadcrumbs')}
          />

          <Container>
            <Tabs
              activeTabId={activeTabId}
              onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
              tabs={[
                {
                  id: 'catalog',
                  label: t('navigation:admin.tabs.courseCatalog'),
                  content: <CourseCatalogTab />
                },
                {
                  id: 'clients',
                  label: t('navigation:admin.tabs.clients'),
                  content: <CustomersTab />
                },
                {
                  id: 'instructors',
                  label: t('navigation:admin.tabs.instructors'),
                  content: <InstructorsTab />
                }
              ]}
            />
          </Container>
        </SpaceBetween>
      </ContentLayout>
    </MainLayout>
  );
};

export default CourseManagementPage;