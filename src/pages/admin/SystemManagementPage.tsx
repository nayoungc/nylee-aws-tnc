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
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';
import CalendarTab from '@components/admin/calendar/CalendarTab';
import AnnouncementsTab from '@/components/admin/announcements/AnnouncementsTab';

const SystemManagementPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'navigation', 'common']);
  const [activeTabId, setActiveTabId] = useState('calendar');

  return (
    <MainLayout 
      activeHref="/admin/system-management"
      title={t('admin:systemManagement.title', '시스템 관리')}
    >
      <ContentLayout>
        <SpaceBetween size="l">
          <BreadcrumbGroup
            items={[
              { text: t('common:home'), href: '/' },
              { text: t('navigation:admin.title'), href: '/admin' },
              { text: t('navigation:admin.systemManagement'), href: '/admin/system-management' }
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
                  id: 'announcements',
                  label: t('navigation:admin.tabs.announcements'),
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

export default SystemManagementPage;