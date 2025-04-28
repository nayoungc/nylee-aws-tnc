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
  ColumnLayout,
  ExpandableSection
} from '@cloudscape-design/components';
import MainLayout from '@/components/layout/MainLayout';
import CourseCalendar from './components/CourseCalendar';
import Resources from './components/Resources';
import { useAppTranslation } from '@/hooks/useAppTranslation';

const TncPage: React.FC = () => {
  const { t } = useAppTranslation();
  const [activeTabId, setActiveTabId] = useState('calendar');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  // 다국어 처리된 공지사항 데이터
  const announcementItems = [
    // {
    //   id: "1",
    //   title: t('tnc_announcements_workshop_title'),
    //   date: "2025-04-30",
    //   category: t('tnc_categories_workshop'),
    //   isImportant: true,
    //   preview: t('tnc_announcements_workshop_preview'),
    //   content: t('tnc_announcements_workshop_content'),
    //   link: "/events/workshop-2023"
    // },
    // {
    //   id: "2",
    //   title: t('tnc_announcements_certification_title'),
    //   date: "2025-04-10",
    //   category: t('tnc_categories_certification'),
    //   isImportant: false,
    //   preview: t('tnc_announcements_certification_preview'),
    //   content: t('tnc_announcements_certification_content'),
    //   link: "/resources/certification-guide"
    // },
    // {
    //   id: "3",
    //   title: t('tnc_announcements_news_title'),
    //   date: "2025-04-05",
    //   category: t('tnc_categories_news'),
    //   isImportant: true,
    //   preview: t('tnc_announcements_news_preview'),
    //   content: t('tnc_announcements_news_content'),
    //   link: "/news/reinvent-summary"
    // },
    {
      id: "3",
    }
  ];

  const AnnouncementCards: React.FC = () => {
    return (
      <Cards
        cardDefinition={{
          header: item => (
            <Box margin={{ bottom: 'xs' }}>
              <SpaceBetween direction="horizontal" size="xs">
                {item.isImportant && (
                  <Badge color="red">{t('tnc_announcements_important')}</Badge>
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
              header: t('tnc_announcements_title_header'),
              content: item => (
                <Link href={item.link} fontSize="heading-s">
                  {item.title}
                </Link>
              )
            },
            {
              id: 'content',
              header: t('tnc_announcements_content_header'),
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
        loadingText={t('loading')}
        selectionType="single"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        empty={
          <Box textAlign="center" color="text-body-secondary">
            <Box padding={{ bottom: 's' }}>
              <Icon name="notification" size="large" />
            </Box>
            <h3>{t('tnc_announcements_no_announcements')}</h3>
            <Box padding={{ bottom: 's' }}>
              {t('tnc_announcements_check_later')}
            </Box>
          </Box>
        }
        header={
          <Header>
            {t('tnc_announcements_all_announcements')}
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
            description={t('tnc_description')}
          >
            {t('tnc_title')}
          </Header>
        }
      >
        <SpaceBetween size="l">
          {/* 공지사항 섹션 - 새로운 카드 형태 */}
          <Container
            footer={
              <ExpandableSection
                header="Additional settings"
                variant="footer"
              >
                Place additional form fields here.
              </ExpandableSection>
            }
            header={
              <Header
                variant="h2"
                actions={
                  <Link href="/announcements">
                    {t('tnc_announcements_view_all')}
                  </Link>
                }
              >
                {t('tnc_announcements_title')}
              </Header>
            }
          >
            <ul>
              <li>AWS Workshop</li>
              <li>AWS SkillBuilder : <Link
                external
                href="https://explore.skillbuilder.aws/"
                variant="primary"
              >
                Learn more
              </Link></li>
            </ul>
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
                  label: t('tnc_tabs_calendar'),
                  content: <CourseCalendar />
                },
                {
                  id: 'resources',
                  label: t('tnc_tabs_resources'),
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