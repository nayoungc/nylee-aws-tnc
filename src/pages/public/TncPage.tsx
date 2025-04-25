// src/pages/public/TncPage.tsx
import React, { useState } from 'react';
import { 
  Container, 
  Header, 
  Tabs, 
  ContentLayout, 
  SpaceBetween 
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import MainLayout from '@layouts/MainLayout';
// import 경로 수정
import Announcements from './components/Announcements';
import CourseCalendar from './components/CourseCalendar';
import Resources from './components/Resources';

const TncPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTabId, setActiveTabId] = useState('announcements');

  return (
    <MainLayout activeHref="/tnc">
      <ContentLayout
        header={
          <Header 
            variant="h1"
            description={t('tnc.description')}
          >
            {t('tnc.title')}
          </Header>
        }
      >
        <SpaceBetween size="l">
          <Container>
            <Tabs
              activeTabId={activeTabId}
              onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
              tabs={[
                {
                  id: 'announcements',
                  label: t('tnc.tabs.announcements'),
                  content: <Announcements />
                },
                {
                  id: 'calendar',
                  label: t('tnc.tabs.calendar'),
                  content: <CourseCalendar />
                },
                {
                  id: 'resources',
                  label: t('tnc.tabs.resources'),
                  content: <Resources />
                }
              ]}
            />
          </Container>
        </SpaceBetween>
      </ContentLayout>
    </MainLayout>
  );
};

export default TncPage;