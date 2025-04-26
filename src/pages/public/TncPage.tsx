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

// Sample announcement data - replace with your actual data source
const announcementItems = [
  {
    id: "1",
    title: "AWS 클라우드 실습 워크샵 안내",
    date: "2023-11-15",
    category: "워크샵",
    isImportant: true,
    preview: "11월 30일에 진행되는 AWS 클라우드 실습 워크샵에 여러분을 초대합니다.",
    content: "AWS 클라우드 실습 워크샵이 11월 30일에 진행됩니다. 이번 워크샵에서는 EC2, S3, Lambda 등의 핵심 서비스를 직접 실습해볼 수 있는 기회가 제공됩니다. 관심 있는 분들의 많은 참여 바랍니다.",
    link: "/events/workshop-2023"
  },
  {
    id: "2",
    title: "AWS 자격증 시험 준비 가이드 업데이트",
    date: "2023-11-10",
    category: "자격증",
    isImportant: false,
    preview: "AWS Solutions Architect Associate 자격증 시험 준비 가이드가 업데이트 되었습니다.",
    content: "AWS Solutions Architect Associate 자격증 시험 준비 가이드가 최신 시험 경향을 반영하여 업데이트 되었습니다. 자료실에서 다운로드 가능합니다.",
    link: "/resources/certification-guide"
  },
  {
    id: "3",
    title: "AWS re:Invent 2023 주요 발표 요약",
    date: "2023-11-05",
    category: "뉴스",
    isImportant: true,
    preview: "지난 달 진행된 AWS re:Invent 2023 컨퍼런스의 주요 발표 내용을 요약했습니다.",
    content: "AWS re:Invent 2023에서 발표된 주요 신규 서비스와 업데이트 내용을 요약하여 공유드립니다. 특히 새로운 AI/ML 서비스와 서버리스 컴퓨팅 관련 중요한 변화가 있었습니다.",
    link: "/news/reinvent-summary"
  },
];

const AnnouncementCards: React.FC = () => {
  const { t } = useTranslation(['tnc']);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  return (
    <Cards
      cardDefinition={{
        header: item => (
          <Box margin={{ bottom: 'xs' }}>
            <SpaceBetween direction="horizontal" size="xs">
              {item.isImportant && (
                <Badge color="red">{t('tnc:announcements.important', '중요')}</Badge>
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
            header: t('tnc:announcements.title_header', '제목'),
            content: item => (
              <Link href={item.link} fontSize="heading-s">
                {item.title}
              </Link>
            )
          },
          {
            id: 'content',
            header: t('tnc:announcements.content_header', '내용'),
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
      loadingText={t('common:loading', '로딩 중')}
      selectionType="single"
      selectedItems={selectedItems}
      onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      empty={
        <Box textAlign="center" color="text-body-secondary">
          <Box padding={{ bottom: 's' }}>
            <Icon name="notification" size="large" />
          </Box>
          <h3>{t('tnc:announcements.no_announcements', '공지사항이 없습니다')}</h3>
          <Box padding={{ bottom: 's' }}>
            {t('tnc:announcements.check_later', '나중에 다시 확인해 주세요')}
          </Box>
        </Box>
      }
      header={
        <Header counter={`(\${announcementItems.length})`}>
          {t('tnc:announcements.all_announcements', '모든 공지사항')}
        </Header>
      }
    />
  );
};

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
          {/* 공지사항 섹션 - 새로운 카드 형태 */}
          <Container
            header={
              <Header
                variant="h2"
                actions={
                  <Link href="/announcements">
                    {t('tnc:announcements.view_all', '모든 공지사항 보기')}
                  </Link>
                }
              >
                {t('tnc:announcements.title', '공지사항')}
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