// src/components/admin/quiz/QuizDashboardTab.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  ColumnLayout,
  Container,
  Header,
  SpaceBetween,
  StatusIndicator,
  Link,
  Cards,
  Button,
  BarChart,
  PieChart
} from '@cloudscape-design/components';
import { useAppTranslation } from '@/hooks/useAppTranslation';

// 임시 타입 및 샘플 데이터
interface QuizSummary {
  id: string;
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
  totalPoints: number;
  completions: number;
  averageScore: number;
  passRate: number;
}

interface MetricWidget {
  title: string;
  value: number | string;
  description?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  trendValue?: string;
}

const QuizDashboardTab: React.FC = () => {
  const { t } = useAppTranslation();
  const [recentQuizzes, setRecentQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<MetricWidget[]>([]);

  // 샘플 데이터 로드
  useEffect(() => {
    // API 호출 또는 데이터 로드 로직
    const sampleQuizzes: QuizSummary[] = [
      {
        id: '1',
        title: 'AWS 기초 지식 평가',
        category: 'AWS',
        difficulty: 'beginner',
        questionCount: 10,
        totalPoints: 100,
        completions: 45,
        averageScore: 78,
        passRate: 85
      },
      {
        id: '2',
        title: 'AWS 보안 심화 문제',
        category: 'AWS 보안',
        difficulty: 'advanced',
        questionCount: 15,
        totalPoints: 150,
        completions: 28,
        averageScore: 68,
        passRate: 64
      },
      {
        id: '3',
        title: 'S3 및 스토리지 서비스',
        category: 'AWS 스토리지',
        difficulty: 'intermediate',
        questionCount: 8,
        totalPoints: 80,
        completions: 52,
        averageScore: 83,
        passRate: 92
      },
      {
        id: '4',
        title: 'EC2 및 컴퓨팅 서비스',
        category: 'AWS 컴퓨팅',
        difficulty: 'intermediate',
        questionCount: 12,
        totalPoints: 120,
        completions: 37,
        averageScore: 72,
        passRate: 78
      }
    ];

    const sampleMetrics: MetricWidget[] = [
      {
        title: t('admin:quizDashboard.metrics.totalQuizzes', '총 퀴즈 수'),
        value: 12,
        description: t('admin:quizDashboard.metrics.totalQuizzesDesc', '시스템에 등록된 퀴즈 수'),
        trend: 'positive',
        trendValue: '+2'
      },
      {
        title: t('admin:quizDashboard.metrics.totalCompletions', '총 응시 횟수'),
        value: 284,
        description: t('admin:quizDashboard.metrics.totalCompletionsDesc', '모든 퀴즈 응시 횟수'),
        trend: 'positive',
        trendValue: '+24%'
      },
      {
        title: t('admin:quizDashboard.metrics.avgScore', '평균 점수'),
        value: '76%',
        description: t('admin:quizDashboard.metrics.avgScoreDesc', '모든 퀴즈 평균 점수'),
        trend: 'positive',
        trendValue: '+3%'
      },
      {
        title: t('admin:quizDashboard.metrics.avgPassRate', '평균 합격률'),
        value: '82%',
        description: t('admin:quizDashboard.metrics.avgPassRateDesc', '모든 퀴즈 평균 합격률'),
        trend: 'neutral',
        trendValue: '0%'
      }
    ];

    setRecentQuizzes(sampleQuizzes);
    setMetrics(sampleMetrics);
    setLoading(false);
  }, [t]);

  // 난이도에 따른 상태 표시기 렌더링
  const renderDifficultyIndicator = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return (
          <StatusIndicator type="success">
            {t('admin:quizDashboard.difficulty.beginner', '초급')}
          </StatusIndicator>
        );
      case 'intermediate':
        return (
          <StatusIndicator type="info">
            {t('admin:quizDashboard.difficulty.intermediate', '중급')}
          </StatusIndicator>
        );
      case 'advanced':
        return (
          <StatusIndicator type="warning">
            {t('admin:quizDashboard.difficulty.advanced', '고급')}
          </StatusIndicator>
        );
      default:
        return (
          <StatusIndicator type="stopped">
            {t('admin:quizDashboard.difficulty.unknown', '알 수 없음')}
          </StatusIndicator>
        );
    }
  };

  // 최근 퀴즈 카드 렌더링
  const renderRecentQuizCards = () => (
    <Cards
      items={recentQuizzes}
      loading={loading}
      cardDefinition={{
        header: item => <Link href={`/admin/quizzes/\${item.id}`}>{item.title}</Link>,
        sections: [
          {
            id: "category",
            header: t('admin:quizDashboard.cards.category', '카테고리'),
            content: item => item.category
          },
          {
            id: "difficulty",
            header: t('admin:quizDashboard.cards.difficulty', '난이도'),
            content: item => renderDifficultyIndicator(item.difficulty)
          },
          {
            id: "stats",
            header: t('admin:quizDashboard.cards.stats', '통계'),
            content: item => (
              <SpaceBetween size="xs">
                <div>{t('admin:quizDashboard.cards.completions', '응시 횟수')}: {item.completions}</div>
                <div>{t('admin:quizDashboard.cards.avgScore', '평균 점수')}: {item.averageScore}%</div>
                <div>{t('admin:quizDashboard.cards.passRate', '합격률')}: {item.passRate}%</div>
              </SpaceBetween>
            )
          },
          {
            id: "questions",
            header: t('admin:quizDashboard.cards.questions', '문항 정보'),
            content: item => `\${item.questionCount} \${t('admin:quizDashboard.cards.questionsCount', '문항')} / \${item.totalPoints} \${t('admin:quizDashboard.cards.points', '점')}`
          }
        ]
      }}
      empty={
        <Box textAlign="center" color="inherit">
          <b>{t('admin:quizDashboard.cards.emptyState.title', '퀴즈가 없습니다')}</b>
          <Box padding={{ bottom: "s" }} variant="p" color="inherit">
            {t('admin:quizDashboard.cards.emptyState.subtitle', '새 퀴즈를 생성해보세요')}
          </Box>
          <Button>{t('admin:quizDashboard.actions.create', '퀴즈 생성')}</Button>
        </Box>
      }
      header={
        <Header
          counter={`(\${recentQuizzes.length})`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button>{t('admin:quizDashboard.actions.viewAll', '모두 보기')}</Button>
              <Button variant="primary">{t('admin:quizDashboard.actions.create', '퀴즈 생성')}</Button>
            </SpaceBetween>
          }
        >
          {t('admin:quizDashboard.cards.title', '퀴즈 목록')}
        </Header>
      }
    />
  );

  // 지표 위젯 렌더링
  const renderMetricsWidgets = () => (
    <ColumnLayout columns={4} variant="text-grid">
      {metrics.map((metric, index) => (
        <Container
          key={index}
          header={<Header variant="h3">{metric.title}</Header>}
        >
          <SpaceBetween size="s">
            <Box variant="h1" textAlign="center" color="text-status-info">
              {metric.value}
            </Box>
            <Box variant="small" color="text-body-secondary">
              {metric.description}
            </Box>
            {metric.trend && (
              <StatusIndicator
                type={
                  metric.trend === 'positive' ? 'success' :
                  metric.trend === 'negative' ? 'error' : 'info'
                }
              >
                {metric.trendValue}
              </StatusIndicator>
            )}
          </SpaceBetween>
        </Container>
      ))}
    </ColumnLayout>
  );

  // 차트 데이터
  const quizzesByCategory = {
    series: [
      {
        title: t('admin:quizDashboard.charts.quizCount', '퀴즈 수'),
        type: 'bar' as const,
        data: [
          { x: 'AWS', y: 5 },
          { x: 'AWS 보안', y: 3 },
          { x: 'AWS 스토리지', y: 2 },
          { x: 'AWS 컴퓨팅', y: 4 },
          { x: 'AWS 네트워크', y: 2 }
        ]
      }
    ]
  };

  const quizDifficultyDistribution = {
    data: [
      {
        title: t('admin:quizDashboard.difficulty.beginner', '초급'),
        value: 5
      },
      {
        title: t('admin:quizDashboard.difficulty.intermediate', '중급'),
        value: 9
      },
      {
        title: t('admin:quizDashboard.difficulty.advanced', '고급'),
        value: 4
      }
    ],
    detailPopoverContent: (datum: any) => [
      { key: t('admin:quizDashboard.charts.count', '개수'), value: datum.value }
    ],
    hideFilter: true
  };

  return (
    <Box padding="l">
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description={t('admin:quizDashboard.description', '퀴즈 현황 및 통계를 확인합니다.')}
        >
          {t('admin:quizDashboard.title', '퀴즈 대시보드')}
        </Header>

        {/* 지표 위젯 */}
        {renderMetricsWidgets()}

        {/* 최근 퀴즈 */}
        {renderRecentQuizCards()}

        {/* 차트 섹션 */}
        <ColumnLayout columns={2}>
          <Container
            header={
              <Header variant="h2">
                {t('admin:quizDashboard.charts.categoryTitle', '카테고리별 퀴즈')}
              </Header>
            }
          >
            <BarChart
              series={quizzesByCategory.series}
              height={300}
              xTitle={t('admin:quizDashboard.charts.categoryAxis', '카테고리')}
              yTitle={t('admin:quizDashboard.charts.countAxis', '퀴즈 수')}
              hideFilter
            />
          </Container>

          <Container
            header={
              <Header variant="h2">
                {t('admin:quizDashboard.charts.difficultyTitle', '난이도별 퀴즈')}
              </Header>
            }
          >
            <PieChart
              data={quizDifficultyDistribution.data}
              detailPopoverContent={quizDifficultyDistribution.detailPopoverContent}
              segmentDescription={(datum, sum) => 
                `\${((datum.value / sum) * 100).toFixed(0)}%`
              }
              hideFilter
              size="medium"
            />
            {/* 내부 메트릭을 Box로 구현 */}
            <Box textAlign="center" padding={{ top: 'xs' }}>
              <Box variant="h1" color="text-status-info">
                {quizDifficultyDistribution.data.reduce((sum, item) => sum + item.value, 0)}
              </Box>
              <Box variant="h3" color="text-body-secondary">
                {t('admin:quizDashboard.charts.totalQuizzes', '총 퀴즈')}
              </Box>
            </Box>
          </Container>
        </ColumnLayout>
      </SpaceBetween>
    </Box>
  );
};

export default QuizDashboardTab;