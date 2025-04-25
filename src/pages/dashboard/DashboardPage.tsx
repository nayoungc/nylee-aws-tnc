// src/pages/dashboard/DashboardPage.tsx
import React from 'react';
import { 
  Cards,
  Container, 
  Header,
  SpaceBetween,
  ColumnLayout,
  Box,
  Button,
  Select
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';

const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation(['dashboard', 'common']);
  
  // 언어 변경 핸들러
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  // 샘플 지표 데이터
  const sampleMetrics = [
    { id: '1', metricType: t('dashboard:metrics.totalCourses'), value: '24', change: '+5' },
    { id: '2', metricType: t('dashboard:metrics.activeUsers'), value: '156', change: '+12' },
    { id: '3', metricType: t('dashboard:metrics.completedCourses'), value: '68', change: '+8' },
    { id: '4', metricType: t('dashboard:metrics.averageSatisfaction'), value: '4.7/5', change: '+0.2' }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <SpaceBetween size="xl">
        {/* 언어 선택기 */}
        <div style={{ textAlign: 'right' }}>
          <Button onClick={() => changeLanguage('en')}>English</Button>
          <Button onClick={() => changeLanguage('ko')}>한국어</Button>
        </div>
        
        {/* 페이지 헤더 */}
        <Container
          header={
            <Header
              variant="h1"
              description={t('dashboard:description')}
            >
              {t('dashboard:title')}
            </Header>
          }
        >
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <Box variant="h3">{t('dashboard:welcome', { name: '관리자' })}</Box>
              <Box variant="p">오늘은 {new Date().toLocaleDateString(i18n.language, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long' 
              })} 입니다.</Box>
            </div>
            <div>
              <Box variant="h3">{t('common:nav.settings')}</Box>
              <SpaceBetween size="s">
                <Box variant="p">• {t('common:nav.courses')}</Box>
                <Box variant="p">• {t('common:nav.instructors')}</Box>
                <Box variant="p">• {t('common:nav.customers')}</Box>
              </SpaceBetween>
            </div>
          </ColumnLayout>
        </Container>

        {/* 주요 지표 섹션 */}
        <Container
          header={
            <Header variant="h2">{t('dashboard:metrics', { defaultValue: '주요 지표' })}</Header>
          }
        >
          <Cards
            cardDefinition={{
              header: item => item.metricType,
              sections: [
                {
                  id: "value",
                  header: "값",
                  content: item => (
                    <Box fontSize="display-l" fontWeight="bold">
                      {item.value}
                    </Box>
                  )
                },
                {
                  id: "change",
                  header: "전월 대비",
                  content: item => (
                    <Box color={item.change.startsWith('+') ? 'text-status-success' : 'text-status-error'}>
                      {item.change}%
                    </Box>
                  )
                }
              ]
            }}
            cardsPerRow={[
              { cards: 1 },
              { minWidth: 500, cards: 2 },
              { minWidth: 992, cards: 4 }
            ]}
            items={sampleMetrics}
          />
        </Container>

        {/* 최근 활동 섹션 */}
        <Container
          header={
            <Header variant="h2">{t('dashboard:recentActivities')}</Header>
          }
        >
          <ColumnLayout columns={1}>
            <SpaceBetween size="l">
              <div>
                <Box variant="h4">새 과정 등록</Box>
                <Box variant="p">AWS 클라우드 기초 과정이 추가되었습니다.</Box>
                <Box variant="small" color="text-body-secondary">3일 전</Box>
              </div>
              <div>
                <Box variant="h4">교육 완료</Box>
                <Box variant="p">5명의 사용자가 "보안 모범 사례" 과정을 완료했습니다.</Box>
                <Box variant="small" color="text-body-secondary">1주일 전</Box>
              </div>
            </SpaceBetween>
          </ColumnLayout>
        </Container>

        {/* 예정된 교육 섹션 */}
        <Container
          header={
            <Header variant="h2">{t('dashboard:upcomingCourses')}</Header>
          }
        >
          <Cards
            cardDefinition={{
              header: item => item.title,
              sections: [
                {
                  id: "date",
                  header: "일정",
                  content: item => item.date
                },
                {
                  id: "participants",
                  header: "참가자",
                  content: item => `\${item.participants}명 등록`
                }
              ]
            }}
            cardsPerRow={[
              { cards: 1 },
              { minWidth: 500, cards: 2 }
            ]}
            items={[
              { id: '1', title: 'AWS EC2 심화', date: '2023-05-15', participants: 12 },
              { id: '2', title: '클라우드 데이터베이스', date: '2023-05-22', participants: 8 }
            ]}
          />
        </Container>
      </SpaceBetween>
    </div>
  );
};

export default DashboardPage;