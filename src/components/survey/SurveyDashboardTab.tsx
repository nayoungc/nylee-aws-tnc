// src/components/admin/survey/SurveyDashboardTab.tsx
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
interface SurveySummary {
    id: string;
    title: string;
    category: string;
    status: 'active' | 'completed' | 'draft';
    responseRate: number;
    totalResponses: number;
    startDate?: string;
    endDate?: string;
}

interface MetricWidget {
    title: string;
    value: number | string;
    description?: string;
    trend?: 'positive' | 'negative' | 'neutral';
    trendValue?: string;
}

const SurveyDashboardTab: React.FC = () => {
    const { t } = useAppTranslation();
    const [recentSurveys, setRecentSurveys] = useState<SurveySummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [metrics, setMetrics] = useState<MetricWidget[]>([]);

    // 샘플 데이터 로드
    useEffect(() => {
        // API 호출 또는 데이터 로드 로직
        const sampleSurveys: SurveySummary[] = [
            {
                id: '1',
                title: '교육 만족도 조사',
                category: '교육평가',
                status: 'active',
                responseRate: 68,
                totalResponses: 34,
                startDate: '2023-09-01',
                endDate: '2023-09-30'
            },
            {
                id: '2',
                title: '강사 평가',
                category: '강사평가',
                status: 'completed',
                responseRate: 92,
                totalResponses: 46,
                startDate: '2023-08-15',
                endDate: '2023-08-31'
            },
            {
                id: '3',
                title: '교육 환경 개선 설문',
                category: '시설평가',
                status: 'draft',
                responseRate: 0,
                totalResponses: 0
            },
            {
                id: '4',
                title: '교육 프로그램 선호도 조사',
                category: '콘텐츠평가',
                status: 'completed',
                responseRate: 75,
                totalResponses: 150,
                startDate: '2023-07-01',
                endDate: '2023-07-15'
            }
        ];

        const sampleMetrics: MetricWidget[] = [
            {
                title: t('admin:surveyDashboard.metrics.activeSurveys', '진행 중인 설문'),
                value: 2,
                description: t('admin:surveyDashboard.metrics.activeSurveysDesc', '현재 활성화된 설문조사 수'),
                trend: 'neutral',
                trendValue: '0%'
            },
            {
                title: t('admin:surveyDashboard.metrics.totalResponses', '총 응답 수'),
                value: 230,
                description: t('admin:surveyDashboard.metrics.totalResponsesDesc', '모든 설문조사 응답 합계'),
                trend: 'positive',
                trendValue: '+24%'
            },
            {
                title: t('admin:surveyDashboard.metrics.avgResponseRate', '평균 응답률'),
                value: '78%',
                description: t('admin:surveyDashboard.metrics.avgResponseRateDesc', '모든 설문조사 평균 응답률'),
                trend: 'positive',
                trendValue: '+5%'
            },
            {
                title: t('admin:surveyDashboard.metrics.completedSurveys', '완료된 설문'),
                value: 12,
                description: t('admin:surveyDashboard.metrics.completedSurveysDesc', '지난 3개월 간 완료된 설문'),
                trend: 'positive',
                trendValue: '+2'
            }
        ];

        setRecentSurveys(sampleSurveys);
        setMetrics(sampleMetrics);
        setLoading(false);
    }, [t]);

    // 설문조사 상태에 따른 상태 표시기 렌더링
    const renderSurveyStatusIndicator = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <StatusIndicator type="success">
                        {t('admin:surveyDashboard.status.active', '진행 중')}
                    </StatusIndicator>
                );
            case 'completed':
                return (
                    <StatusIndicator type="info">
                        {t('admin:surveyDashboard.status.completed', '완료됨')}
                    </StatusIndicator>
                );
            case 'draft':
                return (
                    <StatusIndicator type="pending">
                        {t('admin:surveyDashboard.status.draft', '임시 저장')}
                    </StatusIndicator>
                );
            default:
                return (
                    <StatusIndicator type="stopped">
                        {t('admin:surveyDashboard.status.unknown', '알 수 없음')}
                    </StatusIndicator>
                );
        }
    };

    // 최근 설문조사 카드 렌더링
    const renderRecentSurveyCards = () => (
        <Cards
            items={recentSurveys}
            loading={loading}
            cardDefinition={{
                header: item => <Link href={`/admin/surveys/\${item.id}`}>{item.title}</Link>,
                sections: [
                    {
                        id: "category",
                        header: t('admin:surveyDashboard.cards.category', '카테고리'),
                        content: item => item.category
                    },
                    {
                        id: "status",
                        header: t('admin:surveyDashboard.cards.status', '상태'),
                        content: item => renderSurveyStatusIndicator(item.status)
                    },
                    {
                        id: "responseRate",
                        header: t('admin:surveyDashboard.cards.responseRate', '응답률'),
                        content: item => `\${item.responseRate}% (\${item.totalResponses} \${t('admin:surveyDashboard.cards.responses', '응답')})`
                    },
                    {
                        id: "dates",
                        header: t('admin:surveyDashboard.cards.period', '기간'),
                        content: item => item.startDate && item.endDate ?
                            `\${item.startDate} ~ \${item.endDate}` :
                            t('admin:surveyDashboard.cards.notStarted', '시작되지 않음')
                    }
                ]
            }}
            empty={
                <Box textAlign="center" color="inherit">
                    <b>{t('admin:surveyDashboard.cards.emptyState.title', '설문조사가 없습니다')}</b>
                    <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                        {t('admin:surveyDashboard.cards.emptyState.subtitle', '새 설문조사를 생성해보세요')}
                    </Box>
                    <Button>{t('admin:surveyDashboard.actions.create', '설문조사 생성')}</Button>
                </Box>
            }
            header={
                <Header
                    counter={`(\${recentSurveys.length})`}
                    actions={
                        <SpaceBetween direction="horizontal" size="xs">
                            <Button>{t('admin:surveyDashboard.actions.viewAll', '모두 보기')}</Button>
                            <Button variant="primary">{t('admin:surveyDashboard.actions.create', '설문조사 생성')}</Button>
                        </SpaceBetween>
                    }
                >
                    {t('admin:surveyDashboard.cards.title', '최근 설문조사')}
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
    const surveysByCategory = {
        series: [
            {
                title: t('admin:surveyDashboard.charts.surveyCount', '설문조사 수'),
                type: 'bar' as const, // 명시적으로 'bar' 타입 지정
                data: [
                    { x: '교육평가', y: 8 },
                    { x: '강사평가', y: 5 },
                    { x: '시설평가', y: 3 },
                    { x: '콘텐츠평가', y: 4 },
                    { x: '기타', y: 2 }
                ]
            }
        ]
    };

    const surveyStatusDistribution = {
        data: [
            {
                title: t('admin:surveyDashboard.status.active', '진행 중'),
                value: 2
            },
            {
                title: t('admin:surveyDashboard.status.completed', '완료됨'),
                value: 12
            },
            {
                title: t('admin:surveyDashboard.status.draft', '임시 저장'),
                value: 4
            }
        ],
        detailPopoverContent: (datum: any) => [
            { key: t('admin:surveyDashboard.charts.count', '개수'), value: datum.value }
        ],
        hideFilter: true
    };

    return (
        <Box padding="l">
            <SpaceBetween size="l">
                <Header
                    variant="h1"
                    description={t('admin:surveyDashboard.description', '설문조사 현황 및 통계를 확인합니다.')}
                >
                    {t('admin:surveyDashboard.title', '설문조사 대시보드')}
                </Header>

                {/* 지표 위젯 */}
                {renderMetricsWidgets()}

                {/* 최근 설문조사 */}
                {renderRecentSurveyCards()}

                {/* 차트 섹션 */}
                <ColumnLayout columns={2}>
                    <Container
                        header={
                            <Header variant="h2">
                                {t('admin:surveyDashboard.charts.categoryTitle', '카테고리별 설문조사')}
                            </Header>
                        }
                    >
                        <BarChart
                            series={surveysByCategory.series}
                            height={300}
                            xTitle={t('admin:surveyDashboard.charts.categoryAxis', '카테고리')}
                            yTitle={t('admin:surveyDashboard.charts.countAxis', '설문조사 수')}
                            hideFilter
                        />
                    </Container>

                    <Container
                        header={
                            <Header variant="h2">
                                {t('admin:surveyDashboard.charts.statusTitle', '상태별 설문조사')}
                            </Header>
                        }
                    >
                        <PieChart
                            data={surveyStatusDistribution.data}
                            detailPopoverContent={surveyStatusDistribution.detailPopoverContent}
                            segmentDescription={(datum, sum) =>
                                `\${((datum.value / sum) * 100).toFixed(0)}%`
                            }
                            hideFilter
                            size="medium"
                        // innerMetric 속성 제거 - Cloudscape PieChart에서 지원하지 않음
                        />

// 대신, innerMetric 기능을 구현하려면 다음과 같이 별도로 구현할 수 있습니다
                        <Box textAlign="center" padding={{ top: 'xs' }}>
                            <Box variant="h1" textAlign="center">
                                {surveyStatusDistribution.data.reduce((sum, item) => sum + item.value, 0)}
                            </Box>
                            <Box variant="h3" color="text-body-secondary">
                                {t('admin:surveyDashboard.charts.totalSurveys', '총 설문조사')}
                            </Box>
                        </Box>
                    </Container>
                </ColumnLayout>
            </SpaceBetween>
        </Box>
    );
};

export default SurveyDashboardTab;