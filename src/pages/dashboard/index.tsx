// src/pages/dashboard/DashboardPage.tsx
import React from 'react';
import { 
  Cards,
  Container, 
  Header,
  SpaceBetween,
  ColumnLayout,
  Box
} from '@cloudscape-design/components';

/**
 * 간단한 대시보드 페이지
 * 실제 기능 로직 없이 UI 레이아웃만 표시합니다.
 */
const DashboardPage: React.FC = () => {
  // 샘플 지표 데이터
  const sampleMetrics = [
    { id: '1', metricType: '총 교육 과정', value: '24', change: '+5' },
    { id: '2', metricType: '활성 사용자', value: '156', change: '+12' },
    { id: '3', metricType: '완료된 교육', value: '68', change: '+8' },
    { id: '4', metricType: '평균 만족도', value: '4.7/5', change: '+0.2' }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <SpaceBetween size="xl">
        {/* 페이지 헤더 */}
        <Container
          header={
            <Header
              variant="h1"
              description="주요 교육 지표와 최근 활동을 확인하세요."
            >
              대시보드
            </Header>
          }
        >
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <Box variant="h3">환영합니다, 관리자님!</Box>
              <Box variant="p">오늘은 {new Date().toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long' 
              })} 입니다.</Box>
              <Box variant="p">교육 관리 시스템에서 진행 상황을 확인하세요.</Box>
            </div>
            <div>
              <Box variant="h3">빠른 액세스</Box>
              <SpaceBetween size="s">
                <Box variant="p">• 교육 과정 관리</Box>
                <Box variant="p">• 사용자 등록 승인</Box>
                <Box variant="p">• 성과 보고서 보기</Box>
              </SpaceBetween>
            </div>
          </ColumnLayout>
        </Container>

        {/* 주요 지표 섹션 */}
        <Container
          header={
            <Header variant="h2">주요 지표</Header>
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
            <Header variant="h2">최근 활동</Header>
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
              <div>
                <Box variant="h4">새 설문 결과</Box>
                <Box variant="p">"AWS Lambda 실습" 과정에 대한 새로운 설문 응답이 있습니다.</Box>
                <Box variant="small" color="text-body-secondary">2주일 전</Box>
              </div>
            </SpaceBetween>
          </ColumnLayout>
        </Container>

        {/* 예정된 교육 섹션 */}
        <Container
          header={
            <Header variant="h2">예정된 교육</Header>
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
                },
                {
                  id: "status",
                  header: "상태",
                  content: item => item.status
                }
              ]
            }}
            cardsPerRow={[
              { cards: 1 },
              { minWidth: 500, cards: 2 }
            ]}
            items={[
              { id: '1', title: 'AWS EC2 심화', date: '2023-05-15', participants: 12, status: '등록 중' },
              { id: '2', title: '클라우드 데이터베이스', date: '2023-05-22', participants: 8, status: '등록 중' },
              { id: '3', title: '서버리스 아키텍처', date: '2023-06-03', participants: 15, status: '준비 중' }
            ]}
          />
        </Container>
      </SpaceBetween>
    </div>
  );
};

export default DashboardPage;