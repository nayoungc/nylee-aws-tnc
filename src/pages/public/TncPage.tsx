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
import MainLayout from '@/layouts/MainLayout';
import Announcements from './components/Announcements';
import CourseCalendar from './components/CourseCalendar';
import Resources from './components/Resources';

const TncPage: React.FC = () => {
  const { t } = useTranslation(['common', 'tnc']);
  const [activeTabId, setActiveTabId] = useState('calendar');

  return (
    <MainLayout activeHref="/tnc">
      <ContentLayout
        header={
          <Header 
            variant="h1"
            description={t('tnc:description', 'AWS Training & Certification 교육 정보 사이트')}
          >
            {t('tnc:title', 'AWS T&C 교육 포털')}
          </Header>
        }
      >
        <SpaceBetween size="l">
          {/* 공지사항 섹션 */}
          <Container
            header={
              <Header variant="h2">
                {t('tnc:announcements.title', '공지사항')}
              </Header>
            }
          >
            <Announcements />
          </Container>

          {/* 탭 컨테이너 */}
          <Container>
            <Tabs
              activeTabId={activeTabId}
              onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
              tabs={[
                {
                  id: 'calendar',
                  label: t('tnc:tabs.calendar', '교육 일정'),
                  content: <CourseCalendar />
                },
                {
                  id: 'resources',
                  label: t('tnc:tabs.resources', '자료실'),
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