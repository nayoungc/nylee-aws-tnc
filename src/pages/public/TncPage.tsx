// src/pages/public/TncPage.tsx
import React, { useState } from 'react';
import { 
  Container, 
  Header, 
  Tabs, 
  ContentLayout, 
  SpaceBetween,
  Grid
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import Announcements from './components/Announcements';
import CourseCalendar from './components/CourseCalendar';
import Resources from './components/Resources';

const TncPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTabId, setActiveTabId] = useState('calendar');

  return (
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
        {/* 공지사항 섹션 - 탭 위에 별도 표시 */}
        <Container>
          <Announcements />
        </Container>

        {/* 탭 컨테이너 - 캘린더와 자료실만 포함 */}
        <Container>
          <Tabs
            activeTabId={activeTabId}
            onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
            tabs={[
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
  );
};

export default TncPage;