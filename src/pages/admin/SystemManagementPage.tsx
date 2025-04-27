// src/pages/admin/SystemManagementPage.tsx
import React, { useState } from 'react';
import {
  ContentLayout,
  SpaceBetween,
  Tabs,
  Container,
  Header,
  BreadcrumbGroup
} from '@cloudscape-design/components';
import MainLayout from '@/components/layout/MainLayout';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import CalendarTab from '@components/admin/calendar/CalendarTab';
import AnnouncementsTab from '@components/admin/announcements/AnnouncementsTab';

const CourseManagementPage: React.FC = () => {
  const { t } = useAppTranslation()
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
                  id: 'calendar',
                  label: t('navigation:admin.tabs.calendar'),
                  content: <CalendarTab />
                },
                {
                  id: 'announcements', // ID도 명확하게 수정
                  label: t('navigation:admin.tabs.announcements'), // 라벨도 적절히 수정
                  content: <AnnouncementsTab />
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


