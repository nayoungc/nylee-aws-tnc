// src/pages/public/TncPage.tsx
import React, { useState } from 'react';
import { 
  Container, 
  Header, 
  Tabs, 
  ContentLayout, 
  SpaceBetween,
  Cards,
  Box,
  Link,
  Badge,
  Icon,
  ColumnLayout
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';
import CourseCalendar from './components/CourseCalendar';
import Resources from './components/Resources';

const TncPage: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'tnc']);
  const [activeTabId, setActiveTabId] = useState('calendar');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  // 다국어 처리된 공지사항 데이터
  const announcementItems = [
    {
      id: "1",
      title: t('tnc:announcements.items.workshop.title'),
      date: "2025-04-15",
      category: t('tnc:categories.workshop'),
      isImportant: true,
      preview: t('tnc:announcements.items.workshop.preview'),
      content: t('tnc:announcements.items.workshop.content'),
      link: "/events/workshop-2023"
    },
    {
      id: "2",
      title: t('tnc:announcements.items.certification.title'),
      date: "2025-04-10",
      category: t('tnc:categories.certification'),
      isImportant: false,
      preview: t('tnc:announcements.items.certification.preview'),
      content: t('tnc:announcements.items.certification.content'),
      link: "/resources/certification-guide"
    },
    {
      id: "3",
      title: t('tnc:announcements.items.news.title'),
      date: "2025-04-05",
      category: t('tnc:categories.news'),
      isImportant: true,
      preview: t('tnc:announcements.items.news.preview'),
      content: t('tnc:announcements.items.news.content'),
      link: "/news/reinvent-summary"
    },
  ];

  const AnnouncementCards: React.FC = () => {
    return (
      <Cards
        cardDefinition={{
          header: item => (
            <Box margin={{ bottom: 'xs' }}>
              <SpaceBetween direction="horizontal" size="xs">
                {item.isImportant && (
                  <Badge color="red">{t('tnc:announcements.important')}</Badge>
                )}
                <Badge color="blue">{item.category}</Badge>
                <Box color="text-body-secondary" fontSize="body-s">
                  {item.date}
                </Box>
              </SpaceBetween>
            </Box>
          ),
          sections: [
            {
              id: 'title',
              header: t('tnc:announcements.title_header'),
              content: item => (
                <Link href={item.link} fontSize="heading-s">
                  {item.title}
                </Link>
              )
            },
            {
              id: 'content',
              header: t('tnc:announcements.content_header'),
              content: item => (
                <Box color="text-body-secondary">
                  {item.content}
                </Box>
              )
            }
          ]
        }}
        cardsPerRow={[
          { cards: 1 },
          { minWidth: 500, cards: 2 }
        ]}
        items={announcementItems}
        loadingText={t('common:loading')}
        selectionType="single"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        empty={
          <Box textAlign="center" color="text-body-secondary">
            <Box padding={{ bottom: 's' }}>
              <Icon name="notification" size="large" />
            </Box>
            <h3>{t('tnc:announcements.no_announcements')}</h3>
            <Box padding={{ bottom: 's' }}>
              {t('tnc:announcements.check_later')}
            </Box>
          </Box>
        }
        header={
          <Header counter={`(\${announcementItems.length})`}>
            {t('tnc:announcements.all_announcements')}
          </Header>
        }
      />
    );
  };

  return (
    <MainLayout activeHref="/tnc">
      <ContentLayout
        header={
          <Header 
            variant="h1"
            description={t('tnc:description')}
          >
            {t('tnc:title')}
          </Header>
        }
      >
        <SpaceBetween size="l">
          {/* 공지사항 섹션 - 새로운 카드 형태 */}
          <Container
            header={
              <Header
                variant="h2"
                actions={
                  <Link href="/announcements">
                    {t('tnc:announcements.view_all')}
                  </Link>
                }
              >
                {t('tnc:announcements.title')}
              </Header>
            }
          >
            <AnnouncementCards />
          </Container>

          {/* 탭 컨테이너 */}
          <Container>
            <Tabs
              activeTabId={activeTabId}
              onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
              tabs={[
                {
                  id: 'calendar',
                  label: t('tnc:tabs.calendar'),
                  content: <CourseCalendar />
                },
                {
                  id: 'resources',
                  label: t('tnc:tabs.resources'),
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