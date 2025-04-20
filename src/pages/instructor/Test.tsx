import React, { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Header,
    SpaceBetween,
    FormField,
    Select,
    DateRangePicker,
    Button,
    Tabs,
    Box,
    Table,
    Cards,
    ColumnLayout,
    Alert,
    Badge,
    Spinner,
    SegmentedControl,
    BarChart,
    PieChart,
    LineChart,
    StatusIndicator,
    Popover,
    Grid,
    ContentLayout,
    Link,
    ProgressBar,
    Toggle
} from '@cloudscape-design/components';
import { SelectProps, BarChartProps, PieChartProps, LineChartProps, TableProps } from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '../../utils/i18n-utils';

// 타입 정의
interface Course {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    numStudents: number;
}

interface QuizResult {
    questionId: string;
    question: string;
    preCorrectPercentage: number;
    postCorrectPercentage: number;
    improvementPercentage: number;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface StudentPerformance {
    studentId: string;
    name: string;
    email: string;
    preQuizScore: number;
    postQuizScore: number;
    improvement: number;
    engagementScore: number;
    completionRate: number;
}

interface SurveyQuestion {
    id: string;
    question: string;
    type: 'rating' | 'multiChoice' | 'text';
    averageRating?: number;
    distribution?: { [key: string]: number };
    responses?: string[];
}

interface AnalyticsData {
    summary: {
        totalStudents: number;
        preQuizAverage: number;
        postQuizAverage: number;
        averageImprovement: number;
        preQuizCompletionRate: number;
        postQuizCompletionRate: number;
        surveyCompletionRate: number;
        satisfactionScore: number;
        recommendationScore: number;
    };
    questionAnalysis: QuizResult[];
    studentPerformance: StudentPerformance[];
    surveyResults: SurveyQuestion[];
    timeSeriesData: {
        labels: string[];
        preQuizSeries: number[];
        postQuizSeries: number[];
    };
    knowledgeGaps: {
        topic: string;
        preScore: number;
        postScore: number;
        priority: 'high' | 'medium' | 'low';
    }[];
}

// 대시보드 기본 구조
export default function Analytics() {
    const navigate = useNavigate();
    const { t, tString } = useTypedTranslation();
    const [client] = useState(() => generateClient());

    // 상태 관리
    const [courses, setCourses] = useState<SelectProps.Option[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<SelectProps.Option | null>(null);
    const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTabId, setActiveTabId] = useState<string>("overview");
    const [comparisonMode, setComparisonMode] = useState<"absolute" | "percentage">("percentage");
    const [groupBy, setGroupBy] = useState<"question" | "student" | "topic">("question");
    const [showRawData, setShowRawData] = useState<boolean>(false);

    // 과정 목록 로딩
    useEffect(() => {
        loadCourses();
    }, []);

    // 선택된 과정이 변경되면 데이터 로딩
    useEffect(() => {
        if (selectedCourse) {
            loadAnalyticsData(selectedCourse.value as string, dateRange.startDate, dateRange.endDate);
        }
    }, [selectedCourse, dateRange]);

    // 과정 목록 가져오기
    const loadCourses = async () => {
        try {
            // 실제 환경에서는 API 호출
            // const response = await client.graphql({...})

            // 개발용 데이터
            setTimeout(() => {
                setCourses([
                    { label: 'AWS Cloud Practitioner', value: 'course-1' },
                    { label: 'AWS Solutions Architect Associate', value: 'course-2' },
                    { label: 'AWS Developer Associate', value: 'course-3' },
                    { label: 'AWS SysOps Administrator', value: 'course-4' }
                ]);
            }, 500);
        } catch (error) {
            console.error('Error loading courses:', error);
            setError(t('analytics.errors.load_courses'));
        }
    };

    // 분석 데이터 로드
    const loadAnalyticsData = async (courseId: string, startDate?: string, endDate?: string) => {
        setLoading(true);
        setError(null);

        try {
            // 실제 환경에서는 API 호출
            // const response = await client.graphql({...})

            // 개발용 샘플 데이터
            setTimeout(() => {
                const mockData: AnalyticsData = {
                    summary: {
                        totalStudents: 42,
                        preQuizAverage: 62.5,
                        postQuizAverage: 87.3,
                        averageImprovement: 24.8,
                        preQuizCompletionRate: 92,
                        postQuizCompletionRate: 88,
                        surveyCompletionRate: 76,
                        satisfactionScore: 4.2,
                        recommendationScore: 8.7
                    },
                    questionAnalysis: [
                        { questionId: 'q1', question: 'EC2 인스턴스란 무엇인가?', preCorrectPercentage: 70, postCorrectPercentage: 95, improvementPercentage: 25, difficulty: 'easy' },
                        { questionId: 'q2', question: '오토 스케일링 그룹의 목적은?', preCorrectPercentage: 45, postCorrectPercentage: 85, improvementPercentage: 40, difficulty: 'medium' },
                        { questionId: 'q3', question: 'S3 스토리지 클래스의 종류와 특징', preCorrectPercentage: 30, postCorrectPercentage: 80, improvementPercentage: 50, difficulty: 'hard' },
                        { questionId: 'q4', question: 'CloudFront의 주요 기능', preCorrectPercentage: 55, postCorrectPercentage: 90, improvementPercentage: 35, difficulty: 'medium' },
                        { questionId: 'q5', question: 'RDS와 DynamoDB의 차이점', preCorrectPercentage: 40, postCorrectPercentage: 85, improvementPercentage: 45, difficulty: 'hard' },
                        { questionId: 'q6', question: '람다 함수의 실행 환경', preCorrectPercentage: 35, postCorrectPercentage: 90, improvementPercentage: 55, difficulty: 'hard' },
                        { questionId: 'q7', question: 'VPC 서브넷 구성 방법', preCorrectPercentage: 25, postCorrectPercentage: 75, improvementPercentage: 50, difficulty: 'hard' },
                        { questionId: 'q8', question: 'IAM 정책의 기본 구조', preCorrectPercentage: 60, postCorrectPercentage: 90, improvementPercentage: 30, difficulty: 'medium' },
                        { questionId: 'q9', question: 'CloudWatch의 모니터링 지표', preCorrectPercentage: 50, postCorrectPercentage: 80, improvementPercentage: 30, difficulty: 'medium' },
                        { questionId: 'q10', question: 'AWS 요금 모델 이해하기', preCorrectPercentage: 65, postCorrectPercentage: 85, improvementPercentage: 20, difficulty: 'easy' }
                    ],
                    studentPerformance: Array.from({ length: 20 }, (_, i) => {
                        const preQuizScore = Math.round(Math.random() * 40 + 30); // 30-70
                        const postQuizScore = Math.round(Math.random() * 30 + 65); // 65-95
                        return {
                            studentId: `student-\${i+1}`,
                            name: `학생 \${i+1}`,
                            email: `student\${i+1}@example.com`,
                            preQuizScore,
                            postQuizScore,
                            improvement: postQuizScore - preQuizScore,
                            engagementScore: Math.round(Math.random() * 40 + 60), // 60-100
                            completionRate: Math.round(Math.random() * 30 + 70) // 70-100
                        };
                    }),
                    surveyResults: [
                        {
                            id: 's1',
                            question: '과정 전반적인 만족도',
                            type: 'rating',
                            averageRating: 4.2,
                            distribution: { '5': 15, '4': 18, '3': 6, '2': 2, '1': 1 }
                        },
                        {
                            id: 's2',
                            question: '강사의 전문성과 설명 능력',
                            type: 'rating',
                            averageRating: 4.5,
                            distribution: { '5': 23, '4': 14, '3': 3, '2': 1, '1': 1 }
                        },
                        {
                            id: 's3',
                            question: '과정 난이도는 적절했나요?',
                            type: 'multiChoice',
                            distribution: { '너무 쉬움': 3, '적절함': 32, '약간 어려움': 5, '매우 어려움': 2 }
                        },
                        {
                            id: 's4',
                            question: '이 과정을 다른 사람에게 추천하시겠습니까?',
                            type: 'rating',
                            averageRating: 8.7,
                            distribution: { '10': 12, '9': 10, '8': 11, '7': 5, '6': 2, '5 이하': 2 }
                        },
                        {
                            id: 's5',
                            question: '과정에서 가장 유용했던 부분은 무엇인가요?',
                            type: 'text',
                            responses: [
                                '실습 세션과 핸즈온 경험',
                                '실제 사례 연구와 사용 사례',
                                '아키텍처 설계 패턴에 대한 설명',
                                '비용 최적화 전략',
                                '보안 모범 사례'
                            ]
                        }
                    ],
                    timeSeriesData: {
                        labels: ['문제 1', '문제 2', '문제 3', '문제 4', '문제 5', '문제 6', '문제 7', '문제 8', '문제 9', '문제 10'],
                        preQuizSeries: [70, 45, 30, 55, 40, 35, 25, 60, 50, 65],
                        postQuizSeries: [95, 85, 80, 90, 85, 90, 75, 90, 80, 85]
                    },
                    knowledgeGaps: [
                        { topic: 'VPC 네트워킹', preScore: 25, postScore: 75, priority: 'high' },
                        { topic: '서버리스 아키텍처', preScore: 35, postScore: 90, priority: 'medium' },
                        { topic: '데이터베이스 선택', preScore: 40, postScore: 85, priority: 'high' },
                        { topic: '보안 모범 사례', preScore: 50, postScore: 80, priority: 'high' },
                        { topic: '클라우드 비용 최적화', preScore: 65, postScore: 85, priority: 'low' }
                    ]
                };

                setAnalyticsData(mockData);
                setLoading(false);
            }, 1000);

        } catch (error) {
            console.error('Error loading analytics data:', error);
            setError(t('analytics.errors.load_data'));
            setLoading(false);
        }
    };

    // 숫자 포맷팅 함수
    const formatNumber = (value: number, decimal: number = 1): string => {
        return value.toFixed(decimal);
    };

    // 차트 데이터를 위한 인터페이스 직접 정의
    interface ChartDatum {
        x: string;
        y: number;
    }

    // 차트 데이터 변환 함수
    //   const getChartData = (): BarChartProps.Datum[][] => {
    //     if (!analyticsData) return [[], []];

    //     return [
    //       analyticsData.questionAnalysis.map(item => ({
    //         x: item.question.length > 20 ? `\${item.question.substring(0, 20)}...` : item.question,
    //         y: item.preCorrectPercentage
    //       })),
    //       analyticsData.questionAnalysis.map(item => ({
    //         x: item.question.length > 20 ? `\${item.question.substring(0, 20)}...` : item.question,
    //         y: item.postCorrectPercentage
    //       }))
    //     ];
    //   };

    const getChartData = (): ChartDatum[][] => {
        if (!analyticsData) return [[], []];

        return [
            analyticsData.questionAnalysis.map(item => ({
                x: item.question.length > 20 ? `\${item.question.substring(0, 20)}...` : item.question,
                y: item.preCorrectPercentage
            })),
            analyticsData.questionAnalysis.map(item => ({
                x: item.question.length > 20 ? `\${item.question.substring(0, 20)}...` : item.question,
                y: item.postCorrectPercentage
            }))
        ];
    };

    // 개선도 정렬 함수
    const sortByImprovement = (a: QuizResult, b: QuizResult) => {
        return b.improvementPercentage - a.improvementPercentage;
    };

    // 탭 콘텐츠 - 개요
    const overviewTabContent = useMemo(() => (
        <ContentLayout>
            {!selectedCourse ? (
                <Alert type="info">
                    {t('analytics.select_course_prompt')}
                </Alert>
            ) : loading ? (
                <Box textAlign="center" padding="l">
                    <Spinner size="large" />
                    <Box padding="s">{t('analytics.loading_data')}</Box>
                </Box>
            ) : !analyticsData ? (
                <Alert type="error">
                    {t('analytics.no_data_available')}
                </Alert>
            ) : (
                <SpaceBetween size="l">
                    {/* 핵심 지표 요약 */}
                    <Container header={<Header variant="h2">{t('analytics.key_metrics')}</Header>}>
                        <ColumnLayout columns={2} variant="text-grid">
                            <SpaceBetween size="l">
                                <div>
                                    <Box variant="awsui-key-label">{t('analytics.total_students')}</Box>
                                    <Box fontSize="heading-xl">{analyticsData.summary.totalStudents}</Box>
                                </div>

                                <div>
                                    <Box variant="awsui-key-label">{t('analytics.average_improvement')}</Box>
                                    <Box fontSize="heading-xl" color="text-status-success">
                                        +{formatNumber(analyticsData.summary.averageImprovement)}%
                                    </Box>
                                </div>

                                <div>
                                    <Box variant="awsui-key-label">{t('analytics.satisfaction_score')}</Box>
                                    <Box fontSize="heading-xl">
                                        {formatNumber(analyticsData.summary.satisfactionScore)}/5
                                        <Box variant="small" color="text-body-secondary">
                                            {getRatingText(analyticsData.summary.satisfactionScore)}
                                        </Box>
                                    </Box>
                                </div>
                            </SpaceBetween>

                            <SpaceBetween size="l">
                                <div>
                                    <Box variant="awsui-key-label">{t('analytics.quiz_completion')}</Box>
                                    <ColumnLayout columns={2} variant="text-grid">
                                        <div>
                                            <Box variant="small">{t('analytics.pre_quiz')}: {analyticsData.summary.preQuizCompletionRate}%</Box>
                                            <ProgressBar
                                                value={analyticsData.summary.preQuizCompletionRate}
                                                label=""
                                                description=""
                                            />
                                        </div>
                                        <div>
                                            <Box variant="small">{t('analytics.post_quiz')}: {analyticsData.summary.postQuizCompletionRate}%</Box>
                                            <ProgressBar
                                                value={analyticsData.summary.postQuizCompletionRate}
                                                label=""
                                                description=""
                                            />
                                        </div>
                                    </ColumnLayout>
                                </div>

                                <div>
                                    <Box variant="awsui-key-label">{t('analytics.avg_scores')}</Box>
                                    <ColumnLayout columns={2} variant="text-grid">
                                        <div>
                                            <Box variant="small">{t('analytics.pre_quiz')}: {analyticsData.summary.preQuizAverage}%</Box>
                                        </div>
                                        <div>
                                            <Box variant="small">{t('analytics.post_quiz')}: {analyticsData.summary.postQuizAverage}%</Box>
                                        </div>
                                    </ColumnLayout>
                                    <Box padding={{ top: "s" }}>
                                        <BarChart
                                            series={[
                                                {
                                                    title: t('analytics.pre_quiz'),
                                                    type: "bar",
                                                    data: [{ x: tString('analytics.average_score'), y: analyticsData.summary.preQuizAverage }]
                                                },
                                                {
                                                    title: t('analytics.post_quiz'),
                                                    type: "bar",
                                                    data: [{ x: tString('analytics.average_score'), y: analyticsData.summary.postQuizAverage }]
                                                }
                                            ]}
                                            yDomain={[0, 100]}
                                            hideFilter
                                            height={100}
                                            empty={t('analytics.no_data')}
                                            loadingText={tString('analytics.loading')}
                                            statusType="finished"
                                            xTitle={tString('analytics.quiz_type')}
                                            yTitle={tString('analytics.score_pct')}
                                        />
                                    </Box>
                                </div>

                                <div>
                                    <Box variant="awsui-key-label">{t('analytics.survey_completion')}</Box>
                                    <ProgressBar
                                        value={analyticsData.summary.surveyCompletionRate}
                                        label={`\${analyticsData.summary.surveyCompletionRate}%`}
                                        description=""
                                    />
                                </div>
                            </SpaceBetween>
                        </ColumnLayout>
                    </Container>

                    {/* 퀴즈 성과 요약 */}
                    <Container header={<Header variant="h2">{t('analytics.quiz_performance')}</Header>}>
                        <SpaceBetween size="l">
                            <Grid gridDefinition={[{ colspan: 7 }, { colspan: 5 }]}>
                                <BarChart
                                    series={[
                                        {
                                            title: t('analytics.pre_quiz'),
                                            type: "bar",
                                            data: getChartData()[0]
                                        },
                                        {
                                            title: t('analytics.post_quiz'),
                                            type: "bar",
                                            data: getChartData()[1]
                                        }
                                    ]}
                                    yDomain={[0, 100]}
                                    height={300}
                                    hideFilter
                                    empty={t('analytics.no_data')}
                                    loadingText={tString('analytics.loading')}
                                    statusType="finished"
                                    xTitle={tString('analytics.questions')}
                                    yTitle={tString('analytics.correct_pct')}
                                />

                                <SpaceBetween size="m">
                                    <Header variant="h3">{t('analytics.top_improvements')}</Header>
                                    <Table
                                        columnDefinitions={[
                                            {
                                                id: "question",
                                                header: t('analytics.question'),
                                                cell: item => item.question.length > 25 ? `\${item.question.substring(0, 25)}...` : item.question
                                            },
                                            {
                                                id: "improvement",
                                                header: t('analytics.improvement'),
                                                cell: item => (
                                                    <Box color="text-status-success">+{item.improvementPercentage}%</Box>
                                                )
                                            }
                                        ]}
                                        items={[...analyticsData.questionAnalysis].sort(sortByImprovement).slice(0, 5)}
                                        trackBy="questionId"
                                        loadingText={tString('analytics.loading')}
                                        empty={t('analytics.no_improvement_data')}
                                        variant="embedded"
                                        header={<Header counter={`(\${analyticsData.questionAnalysis.length})`} />}
                                    />

                                    <Link href="#" onFollow={() => setActiveTabId("quiz")}>
                                        {t('analytics.view_all_quiz_data')}
                                    </Link>
                                </SpaceBetween>
                            </Grid>

                            <Header variant="h3">{t('analytics.knowledge_gaps')}</Header>
                            <Table
                                columnDefinitions={[
                                    {
                                        id: "topic",
                                        header: t('analytics.topic'),
                                        cell: item => item.topic
                                    },
                                    {
                                        id: "preScore",
                                        header: t('analytics.pre_score'),
                                        cell: item => `\${item.preScore}%`
                                    },
                                    {
                                        id: "postScore",
                                        header: t('analytics.post_score'),
                                        cell: item => `\${item.postScore}%`
                                    },
                                    {
                                        id: "improvement",
                                        header: t('analytics.improvement'),
                                        cell: item => <Box color="text-status-success">+{item.postScore - item.preScore}%</Box>
                                    },
                                    {
                                        id: "priority",
                                        header: t('analytics.priority'),
                                        cell: item => (
                                            <Badge color={
                                                item.priority === 'high' ? 'red' :
                                                    item.priority === 'medium' ? 'blue' : 'green'
                                            }>
                                                {item.priority === 'high' ? t('analytics.priority_high') :
                                                    item.priority === 'medium' ? t('analytics.priority_medium') :
                                                        t('analytics.priority_low')}
                                            </Badge>
                                        )
                                    }
                                ]}
                                items={analyticsData.knowledgeGaps}
                                loading={loading}
                                loadingText={tString('analytics.loading')}
                                variant="embedded"
                            />
                        </SpaceBetween>
                    </Container>

                    {/* 설문 요약 */}
                    <Container header={<Header variant="h2">{t('analytics.survey_summary')}</Header>}>
                        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
                            <SpaceBetween size="l">
                                <Header variant="h3">{t('analytics.satisfaction_distribution')}</Header>
                                <div style={{ height: "300px" }}>
                                    <PieChart
                                        data={analyticsData.surveyResults[0].distribution ?
                                            Object.entries(analyticsData.surveyResults[0].distribution).map(([key, value]) => ({
                                                title: `\${key} \${t('analytics.stars')}`,
                                                value
                                            })) : []
                                        }
                                        hideFilter
                                        innerMetricDescription={tString('analytics.avg_rating')}
                                        innerMetricValue={formatNumber(analyticsData.summary.satisfactionScore)}
                                        statusType="finished"
                                        size="medium"
                                    />
                                </div>
                            </SpaceBetween>

                            <SpaceBetween size="l">
                                <Header variant="h3">{t('analytics.recommendation_score')}</Header>
                                <Box textAlign="center">
                                    <Box fontSize="display-l" color="text-status-success" padding="xs">
                                        {formatNumber(analyticsData.summary.recommendationScore, 1)}
                                    </Box>
                                    <Box variant="h3">{t('analytics.nps_score')}</Box>
                                    <Box padding={{ top: "s", bottom: "s" }}>
                                        <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
                                            <Box textAlign="center" color="text-status-error" fontSize="heading-xs">
                                                {t('analytics.nps_detractors')}
                                                <br />0-6
                                            </Box>
                                            <Box textAlign="center" color="text-status-warning" fontSize="heading-xs">
                                                {t('analytics.nps_passives')}
                                                <br />7-8
                                            </Box>
                                            <Box textAlign="center" color="text-status-success" fontSize="heading-xs">
                                                {t('analytics.nps_promoters')}
                                                <br />9-10
                                            </Box>
                                        </Grid>
                                    </Box>
                                    <ProgressBar
                                        value={analyticsData.summary.recommendationScore * 10}
                                        label=""
                                        description=""
                                        status={analyticsData.summary.recommendationScore >= 9 ? 'success' :
                                            analyticsData.summary.recommendationScore >= 7 ? 'in-progress' : 'error'}
                                    />
                                </Box>
                            </SpaceBetween>
                        </Grid>
                    </Container>
                </SpaceBetween>
            )}
        </ContentLayout>
    ), [selectedCourse, analyticsData, loading]);

    // 탭 콘텐츠 - 퀴즈 분석
    const quizTabContent = useMemo(() => (
        <ContentLayout>
            {!selectedCourse ? (
                <Alert type="info">
                    {t('analytics.select_course_prompt')}
                </Alert>
            ) : loading ? (
                <Box textAlign="center" padding="l">
                    <Spinner size="large" />
                    <Box padding="s">{t('analytics.loading_data')}</Box>
                </Box>
            ) : !analyticsData ? (
                <Alert type="error">
                    {t('analytics.no_data_available')}
                </Alert>
            ) : (
                <SpaceBetween size="l">
                    <Container header={<Header variant="h2">{t('analytics.quiz_performance_analysis')}</Header>}>
                        <SpaceBetween size="l">
                            <SegmentedControl
                                selectedId={groupBy}
                                onChange={({ detail }) => setGroupBy(detail.selectedId as any)}
                                options={[
                                    { id: "question", text: tString('analytics.group_by_question') },
                                    { id: "student", text: tString('analytics.group_by_student') },
                                    { id: "topic", text: tString('analytics.group_by_topic') }
                                ]}
                            />

                            <SegmentedControl
                                selectedId={comparisonMode}
                                onChange={({ detail }) => setComparisonMode(detail.selectedId as any)}
                                options={[
                                    { id: "percentage", text: tString('analytics.show_percentages') },
                                    { id: "absolute", text: tString('analytics.show_absolute') }
                                ]}
                            />

              //퀴즈 질문별 성과
                            {groupBy === 'question' && (
                                <>
                                    <Header variant="h3">{t('analytics.question_performance')}</Header>
                                    <Table
                                        columnDefinitions={[
                                            {
                                                id: "question",
                                                header: t('analytics.question'),
                                                cell: item => (
                                                    <Popover
                                                        dismissButton={false}
                                                        position="right"
                                                        size="medium"
                                                        triggerType="text"
                                                        content={<Box padding="s">{item.question}</Box>}
                                                    >
                                                        {item.question.length > 50 ? `\${item.question.substring(0, 50)}...` : item.question}
                                                    </Popover>
                                                ),
                                                sortingField: "question"
                                            },
                                            {
                                                id: "difficulty",
                                                header: t('analytics.difficulty'),
                                                cell: item => (
                                                    <Badge color={
                                                        item.difficulty === 'hard' ? 'red' :
                                                            item.difficulty === 'medium' ? 'blue' : 'green'
                                                    }>
                                                        {item.difficulty === 'hard' ? t('analytics.difficulty_hard') :
                                                            item.difficulty === 'medium' ? t('analytics.difficulty_medium') :
                                                                t('analytics.difficulty_easy')}
                                                    </Badge>
                                                ),
                                                sortingField: "difficulty"
                                            },
                                            {
                                                id: "preCorrectPercentage",
                                                header: t('analytics.pre_quiz_score'),
                                                cell: item => `\${item.preCorrectPercentage}%`,
                                                sortingField: "preCorrectPercentage"
                                            },
                                            {
                                                id: "postCorrectPercentage",
                                                header: t('analytics.post_quiz_score'),
                                                cell: item => `\${item.postCorrectPercentage}%`,
                                                sortingField: "postCorrectPercentage"
                                            },
                                            {
                                                id: "improvementPercentage",
                                                header: t('analytics.improvement'),
                                                cell: item => (
                                                    <Box color="text-status-success">
                                                        +{item.improvementPercentage}%
                                                    </Box>
                                                ),
                                                sortingField: "improvementPercentage"
                                            }
                                        ]}
                                        items={analyticsData.questionAnalysis}
                                        // sortingColumn={columnDefinitions.find(col => col.id === "improvementPercentage")}
                                        sortingDescending={true}
                                        trackBy="questionId"
                                        variant="stacked"
                                        header={
                                            <Header
                                                counter={`(\${analyticsData.questionAnalysis.length})`}
                                                actions={
                                                    <Button iconName="download">
                                                        {t('analytics.export_data')}
                                                    </Button>
                                                }
                                            />
                                        }
                                    />

                                    {/* 차트 시각화 */}
                                    <Grid gridDefinition={[{ colspan: 12 }]}>
                                        <Box>
                                            <Header variant="h3">{t('analytics.score_comparison')}</Header>
                                            <BarChart
                                                series={[
                                                    {
                                                        title: t('analytics.pre_quiz'),
                                                        type: "bar",
                                                        data: analyticsData.questionAnalysis.map((q, i) => ({
                                                            x: `Q\${i+1}`,
                                                            y: q.preCorrectPercentage
                                                        }))
                                                    },
                                                    {
                                                        title: t('analytics.post_quiz'),
                                                        type: "bar",
                                                        data: analyticsData.questionAnalysis.map((q, i) => ({
                                                            x: `Q\${i+1}`,
                                                            y: q.postCorrectPercentage
                                                        }))
                                                    }
                                                ]}
                                                yDomain={[0, 100]}
                                                empty={t('analytics.no_data')}
                                                loadingText={tString('analytics.loading')}
                                                xTitle={tString('analytics.questions')}
                                                yTitle={tString('analytics.correct_pct')}
                                                hideFilter
                                                height={300}
                                            />
                                        </Box>
                                    </Grid>
                                </>
                            )}

                            {/* 학생별 성과 */}
                            {groupBy === 'student' && (
                                <>
                                    <Header variant="h3">{t('analytics.student_performance')}</Header>
                                    <Table
                                        columnDefinitions={[
                                            {
                                                id: "name",
                                                header: t('analytics.student_name'),
                                                cell: item => item.name,
                                                sortingField: "name"
                                            },
                                            {
                                                id: "email",
                                                header: t('analytics.email'),
                                                cell: item => item.email,
                                                sortingField: "email"
                                            },
                                            {
                                                id: "preQuizScore",
                                                header: t('analytics.pre_quiz_score'),
                                                cell: item => `\${item.preQuizScore}%`,
                                                sortingField: "preQuizScore"
                                            },
                                            {
                                                id: "postQuizScore",
                                                header: t('analytics.post_quiz_score'),
                                                cell: item => `\${item.postQuizScore}%`,
                                                sortingField: "postQuizScore"
                                            },
                                            {
                                                id: "improvement",
                                                header: t('analytics.improvement'),
                                                cell: item => (
                                                    <Box color="text-status-success">
                                                        +{item.improvement}%
                                                    </Box>
                                                ),
                                                sortingField: "improvement"
                                            },
                                            {
                                                id: "engagementScore",
                                                header: t('analytics.engagement_score'),
                                                cell: item => (
                                                    <ProgressBar
                                                        value={item.engagementScore}
                                                        label={`\${item.engagementScore}%`}
                                                        description=""
                                                        status={item.engagementScore >= 80 ? 'success' :
                                                            item.engagementScore >= 60 ? 'in-progress' : 'error'}
                                                    />
                                                ),
                                                sortingField: "engagementScore"
                                            }
                                        ]}
                                        items={analyticsData.studentPerformance}
                                        // sortingColumn="improvement"
                                        sortingDescending={true}
                                        trackBy="studentId"
                                        variant="stacked"
                                        stickyHeader
                                        header={
                                            <Header
                                                counter={`(\${analyticsData.studentPerformance.length})`}
                                                actions={
                                                    <Button iconName="download">
                                                        {t('analytics.export_data')}
                                                    </Button>
                                                }
                                            />
                                        }
                                    />

                                    <SpaceBetween size="l">
                                        <Header variant="h3">{t('analytics.improvement_distribution')}</Header>
                                        <BarChart
                                            series={[
                                                {
                                                    title: t('analytics.students'),
                                                    type: "bar",
                                                    data: [
                                                        { x: '0-10%', y: analyticsData.studentPerformance.filter(s => s.improvement >= 0 && s.improvement < 10).length },
                                                        { x: '10-20%', y: analyticsData.studentPerformance.filter(s => s.improvement >= 10 && s.improvement < 20).length },
                                                        { x: '20-30%', y: analyticsData.studentPerformance.filter(s => s.improvement >= 20 && s.improvement < 30).length },
                                                        { x: '30-40%', y: analyticsData.studentPerformance.filter(s => s.improvement >= 30 && s.improvement < 40).length },
                                                        { x: '40%+', y: analyticsData.studentPerformance.filter(s => s.improvement >= 40).length }
                                                    ]
                                                }
                                            ]}
                                            hideFilter
                                            height={300}
                                            xTitle={tString('analytics.improvement_range')}
                                            yTitle={tString('analytics.number_of_students')}
                                        />
                                    </SpaceBetween>
                                </>
                            )}

                            {/* 주제별 분석 */}
                            {groupBy === 'topic' && (
                                <SpaceBetween size="l">
                                    <Header variant="h3">{t('analytics.topic_analysis')}</Header>
                                    <Table
                                        columnDefinitions={[
                                            {
                                                id: "topic",
                                                header: t('analytics.topic'),
                                                cell: item => item.topic,
                                                sortingField: "topic"
                                            },
                                            {
                                                id: "preScore",
                                                header: t('analytics.pre_score'),
                                                cell: item => `\${item.preScore}%`,
                                                sortingField: "preScore"
                                            },
                                            {
                                                id: "postScore",
                                                header: t('analytics.post_score'),
                                                cell: item => `\${item.postScore}%`,
                                                sortingField: "postScore"
                                            },
                                            {
                                                id: "improvement",
                                                header: t('analytics.improvement'),
                                                cell: item => <Box color="text-status-success">+{item.postScore - item.preScore}%</Box>,
                                                sortingField: "improvement"
                                            },
                                            {
                                                id: "priority",
                                                header: t('analytics.priority'),
                                                cell: item => (
                                                    <Badge color={
                                                        item.priority === 'high' ? 'red' :
                                                            item.priority === 'medium' ? 'blue' : 'green'
                                                    }>
                                                        {item.priority === 'high' ? t('analytics.priority_high') :
                                                            item.priority === 'medium' ? t('analytics.priority_medium') :
                                                                t('analytics.priority_low')}
                                                    </Badge>
                                                ),
                                                sortingField: "priority"
                                            }
                                        ]}
                                        items={analyticsData.knowledgeGaps}
                                        // sortingColumn="improvement"
                                        sortingDescending={true}
                                        trackBy="topic"
                                        header={
                                            <Header
                                                counter={`(\${analyticsData.knowledgeGaps.length})`}
                                            />
                                        }
                                    />

                                    <Box>
                                        <Header variant="h3">{t('analytics.learning_impact_by_topic')}</Header>
                                        <BarChart
                                            series={[
                                                {
                                                    title: t('analytics.pre_quiz'),
                                                    type: "bar",
                                                    data: analyticsData.knowledgeGaps.map(item => ({
                                                        x: item.topic,
                                                        y: item.preScore
                                                    }))
                                                },
                                                {
                                                    title: t('analytics.post_quiz'),
                                                    type: "bar",
                                                    data: analyticsData.knowledgeGaps.map(item => ({
                                                        x: item.topic,
                                                        y: item.postScore
                                                    }))
                                                }
                                            ]}
                                            yDomain={[0, 100]}
                                            hideFilter
                                            height={300}
                                            xTitle={tString('analytics.topics')}
                                            yTitle={tString('analytics.correct_pct')}
                                        />
                                    </Box>
                                </SpaceBetween>
                            )}
                        </SpaceBetween>
                    </Container>
                </SpaceBetween>
            )}
        </ContentLayout>
    ), [selectedCourse, analyticsData, loading, groupBy, comparisonMode]);

    // 탭 콘텐츠 - 설문조사 분석
    const surveyTabContent = useMemo(() => (
        <ContentLayout>
            {!selectedCourse ? (
                <Alert type="info">
                    {t('analytics.select_course_prompt')}
                </Alert>
            ) : loading ? (
                <Box textAlign="center" padding="l">
                    <Spinner size="large" />
                    <Box padding="s">{t('analytics.loading_data')}</Box>
                </Box>
            ) : !analyticsData ? (
                <Alert type="error">
                    {t('analytics.no_data_available')}
                </Alert>
            ) : (
                <SpaceBetween size="l">
                    <Container header={<Header variant="h2">{t('analytics.survey_analysis')}</Header>}>
                        <SpaceBetween size="l">
                            <Toggle
                                onChange={({ detail }) => setShowRawData(detail.checked)}
                                checked={showRawData}
                            >
                                {t('analytics.show_raw_responses')}
                            </Toggle>

                            {analyticsData.surveyResults.map((question, index) => (
                                <Container
                                    key={question.id}
                                    header={<Header variant="h3">{question.question}</Header>}
                                >
                                    {question.type === 'rating' && question.distribution && (
                                        <Grid gridDefinition={[{ colspan: showRawData ? 6 : 12 }, { colspan: showRawData ? 6 : 0 }]}>
                                            <SpaceBetween size="l">
                                                <div style={{ height: "280px" }}>
                                                    <PieChart
                                                        data={Object.entries(question.distribution).map(([key, value]) => ({
                                                            title: question.id === 's4' ?
                                                                `\${key}` :
                                                                `\${key} \${t('analytics.stars')}`,
                                                            value
                                                        }))}
                                                        detailPopoverContent={(datum, sum) => [
                                                            { key: t('analytics.responses'), value: datum.value },
                                                            { key: t('analytics.percentage'), value: `\${((datum.value / sum) * 100).toFixed(1)}%` }
                                                        ]}
                                                        hideFilter
                                                        innerMetricDescription={tString('analytics.avg_rating')}
                                                        innerMetricValue={question.averageRating?.toFixed(1)}
                                                        segmentDescription={(datum, sum) =>
                                                            `\${datum.title}: \${((datum.value / sum) * 100).toFixed(0)}%`
                                                        }
                                                        size="medium"
                                                        variant="donut"
                                                    />
                                                </div>

                                                <Box textAlign="center">
                                                    <Box variant="awsui-key-label">{t('analytics.average_rating')}</Box>
                                                    <Box fontSize="heading-xl">
                                                        {question.averageRating?.toFixed(1)}
                                                        {question.id !== 's4' && '/5'}
                                                    </Box>
                                                    {question.id === 's4' && (
                                                        <Box variant="h3">{t('analytics.nps_score')}</Box>
                                                    )}
                                                </Box>
                                            </SpaceBetween>

                                            {showRawData && (
                                                <Table
                                                    columnDefinitions={[
                                                        {
                                                            id: "rating",
                                                            header: t('analytics.rating'),
                                                            cell: item => item.rating
                                                        },
                                                        {
                                                            id: "count",
                                                            header: t('analytics.count'),
                                                            cell: item => item.count
                                                        },
                                                        {
                                                            id: "percentage",
                                                            header: t('analytics.percentage'),
                                                            cell: item => item.percentage
                                                        }
                                                    ]}
                                                    items={Object.entries(question.distribution).map(([key, value]) => {
                                                        const total = Object.values(question.distribution || {}).reduce((sum, val) => sum + val, 0);
                                                        return {
                                                            rating: key,
                                                            count: value,
                                                            percentage: `\${((value / total) * 100).toFixed(1)}%`
                                                        };
                                                    })}
                                                    variant="embedded"
                                                />
                                            )}
                                        </Grid>
                                    )}

                                    {question.type === 'multiChoice' && question.distribution && (
                                        <Grid gridDefinition={[{ colspan: showRawData ? 6 : 12 }, { colspan: showRawData ? 6 : 0 }]}>
                                            <BarChart
                                                series={[
                                                    {
                                                        title: t('analytics.responses'),
                                                        type: "bar",
                                                        data: Object.entries(question.distribution).map(([key, value]) => ({
                                                            x: key,
                                                            y: value
                                                        }))
                                                    }
                                                ]}
                                                hideFilter
                                                height={300}
                                                xTitle={tString('analytics.options')}
                                                yTitle={tString('analytics.responses_count')}
                                            />

                                            {showRawData && (
                                                <Table
                                                    columnDefinitions={[
                                                        {
                                                            id: "option",
                                                            header: t('analytics.option'),
                                                            cell: item => item.option
                                                        },
                                                        {
                                                            id: "count",
                                                            header: t('analytics.count'),
                                                            cell: item => item.count
                                                        },
                                                        {
                                                            id: "percentage",
                                                            header: t('analytics.percentage'),
                                                            cell: item => item.percentage
                                                        }
                                                    ]}
                                                    items={Object.entries(question.distribution).map(([key, value]) => {
                                                        const total = Object.values(question.distribution || {}).reduce((sum, val) => sum + val, 0);
                                                        return {
                                                            option: key,
                                                            count: value,
                                                            percentage: `\${((value / total) * 100).toFixed(1)}%`
                                                        };
                                                    })}
                                                    variant="embedded"
                                                />
                                            )}
                                        </Grid>
                                    )}

                                    {question.type === 'text' && question.responses && (
                                        <SpaceBetween size="m">
                                            <Box variant="awsui-key-label">{t('analytics.top_responses')}</Box>
                                            <Box>
                                                {question.responses.map((response, i) => (
                                                    <div key={i} style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#f2f8fd', borderRadius: '4px' }}>
                                                        "{response}"
                                                    </div>
                                                ))}
                                            </Box>
                                        </SpaceBetween>
                                    )}
                                </Container>
                            ))}
                        </SpaceBetween>
                    </Container>
                </SpaceBetween>
            )}
        </ContentLayout>
    ), [selectedCourse, analyticsData, loading, showRawData]);

    // 탭 콘텐츠 - 트렌드 분석
    const trendsTabContent = useMemo(() => (
        <ContentLayout>
            {!selectedCourse ? (
                <Alert type="info">
                    {t('analytics.select_course_prompt')}
                </Alert>
            ) : loading ? (
                <Box textAlign="center" padding="l">
                    <Spinner size="large" />
                    <Box padding="s">{t('analytics.loading_data')}</Box>
                </Box>
            ) : !analyticsData ? (
                <Alert type="error">
                    {t('analytics.no_data_available')}
                </Alert>
            ) : (
                <Container header={<Header variant="h2">{t('analytics.trends_analysis')}</Header>}>
                    <SpaceBetween size="l">
                        <Box>
                            <Header variant="h3">{t('analytics.performance_over_time')}</Header>
                            <LineChart
                                series={[
                                    {
                                        title: t('analytics.pre_quiz'),
                                        type: "line",
                                        data: analyticsData.timeSeriesData.labels.map((label, i) => ({
                                            x: new Date(2023, 0, i + 1).toISOString(),  // 임의의 날짜
                                            y: analyticsData.timeSeriesData.preQuizSeries[i]
                                        }))
                                    },
                                    {
                                        title: t('analytics.post_quiz'),
                                        type: "line",
                                        data: analyticsData.timeSeriesData.labels.map((label, i) => ({
                                            x: new Date(2023, 0, i + 1).toISOString(),  // 임의의 날짜
                                            y: analyticsData.timeSeriesData.postQuizSeries[i]
                                        }))
                                    }
                                ]}
                                xDomain={[new Date(2023, 0, 1).toISOString(), new Date(2023, 0, analyticsData.timeSeriesData.labels.length).toISOString()]}
                                yDomain={[0, 100]}
                                hideFilter
                                height={300}
                                xTitle={tString('analytics.questions')}
                                yTitle={tString('analytics.correct_pct')}
                                i18nStrings={{
                                    filterLabel: tString('analytics.filter'),
                                    filterPlaceholder: tString('analytics.filter_placeholder'),
                                    xTickFormatter: (value) => {
                                        const index = Math.round((new Date(value).getTime() - new Date(2023, 0, 1).getTime()) / (24 * 60 * 60 * 1000));
                                        return `Q\${index + 1}`;
                                    }
                                }}
                            />
                        </Box>

                        <Box>
                            <Header variant="h3">{t('analytics.comparative_analysis')}</Header>
                            <BarChart
                                series={[
                                    {
                                        title: t('analytics.improvement'),
                                        type: "bar",
                                        data: analyticsData.questionAnalysis.map((item) => ({
                                            x: `Q\${analyticsData.questionAnalysis.indexOf(item) + 1}`,
                                            y: item.improvementPercentage
                                        }))
                                    }
                                ]}
                                hideFilter
                                height={300}
                                xTitle={tString('analytics.questions')}
                                yTitle={tString('analytics.improvement_pct')}
                            />
                        </Box>

                        <Box>
                            <Header variant="h3">{t('analytics.student_engagement_analysis')}</Header>
                            <Table
                                columnDefinitions={[
                                    {
                                        id: "metric",
                                        header: t('analytics.metric'),
                                        cell: item => item.metric
                                    },
                                    {
                                        id: "value",
                                        header: t('analytics.value'),
                                        cell: item => item.value
                                    },
                                    {
                                        id: "trend",
                                        header: t('analytics.trend'),
                                        cell: item => item.trend
                                    }
                                ]}
                                items={[
                                    {
                                        metric: t('analytics.avg_quiz_completion_time'),
                                        value: '8.5 ' + t('analytics.minutes'),
                                        trend: <Box color="text-status-success">↓ 12%</Box>
                                    },
                                    {
                                        metric: t('analytics.quiz_attempts'),
                                        value: '1.2 ' + t('analytics.per_student'),
                                        trend: <Box color="text-status-success">↑ 5%</Box>
                                    },
                                    {
                                        metric: t('analytics.completion_rate'),
                                        value: '92%',
                                        trend: <Box color="text-status-success">↑ 3%</Box>
                                    },
                                    {
                                        metric: t('analytics.avg_study_time'),
                                        value: '45 ' + t('analytics.minutes'),
                                        trend: <Box color="text-status-success">↑ 18%</Box>
                                    }
                                ]}
                                variant="embedded"
                            />
                        </Box>
                    </SpaceBetween>
                </Container>
            )}
        </ContentLayout>
    ), [selectedCourse, analyticsData, loading]);

    // 메인 렌더링
    return (
        <Container>
            <SpaceBetween size="l">
                <Header
                    variant="h1"
                    description={t('analytics.description')}
                    actions={
                        <Button iconName="download" onClick={() => alert(t('analytics.report_generated'))}>
                            {t('analytics.generate_report')}
                        </Button>
                    }
                >
                    {t('analytics.title')}
                </Header>

                {error && (
                    <Alert type="error" dismissible onDismiss={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
                    <FormField label={t('analytics.select_course')}>
                        <Select
                            selectedOption={selectedCourse}
                            onChange={({ detail }) => setSelectedCourse(detail.selectedOption)}
                            options={courses}
                            placeholder={String('analytics.course_placeholder')}
                            filteringType="auto"
                            statusType="finished"
                        />
                    </FormField>

                    <FormField label={t('analytics.date_range')}>
                        {/* <DateRangePicker
            //   value={dateRange}
            //   onChange={({ detail }) => setDateRange(detail.value)}
              relativeOptions={[
                {
                  key: "previous-30-days",
                  amount: 30,
                  unit: "day",
                  type: "relative"
                },
                {
                  key: "previous-90-days",
                  amount: 90,
                  unit: "day",
                  type: "relative"
                }
              ]}
              i18nStrings={{
                todayAriaLabel: tString('analytics.today'),
                nextMonthAriaLabel: tString('analytics.next_month'),
                previousMonthAriaLabel: tString('analytics.previous_month'),
                customRelativeRangeDurationLabel: tString('analytics.custom_range_duration'),
                customRelativeRangeDurationPlaceholder: tString('analytics.custom_range_duration_placeholder'),
                customRelativeRangeOptionLabel: tString('analytics.custom_range_option'),
                customRelativeRangeOptionDescription: tString('analytics.custom_range_option_description'),
                customRelativeRangeUnitLabel: tString('analytics.custom_range_unit'),
                formatUnit: (unit, value) => value === 1 ? t(`analytics.\${unit}`) : t(`analytics.\${unit}s`),
                relativeModeTitle: tString('analytics.relative_range_mode'),
                absoluteModeTitle: tString('analytics.absolute_range_mode'),
                // relativeRangeSelected: (relativeRange) => `\${t('analytics.last')} \${relativeRange.amount} \${tString(`analytics.\${relativeRange.unit}s`)}`,
                clearButtonLabel: tString('analytics.clear'),
                applyButtonLabel: tString('analytics.apply')
              }}
              placeholder={tString('analytics.select_date_range')}
            /> */}
                    </FormField>
                </Grid>

                <Tabs
                    activeTabId={activeTabId}
                    onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
                    tabs={[
                        {
                            id: "overview",
                            label: t('analytics.tabs.overview'),
                            content: overviewTabContent
                        },
                        {
                            id: "quiz",
                            label: t('analytics.tabs.quiz_analysis'),
                            content: quizTabContent
                        },
                        {
                            id: "survey",
                            label: t('analytics.tabs.survey_analysis'),
                            content: surveyTabContent
                        },
                        {
                            id: "trends",
                            label: t('analytics.tabs.trends'),
                            content: trendsTabContent
                        }
                    ]}
                />
            </SpaceBetween>
        </Container>
    );
}

// 평점 텍스트 반환 함수
function getRatingText(rating: number): string {
    if (rating >= 4.5) return '최우수';
    if (rating >= 4.0) return '우수';
    if (rating >= 3.5) return '양호';
    if (rating >= 3.0) return '보통';
    return '개선 필요';
}
