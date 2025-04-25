// pages/instructor/ReportGenerator.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  FormField,
  Select,
  DatePicker,
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
  PieChart
} from '@cloudscape-design/components';
import { SelectProps } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '@utils/i18n-utils';
import {
  listCourseCatalogs
} from '@api/catalog';
import {
  listReports,
  generateReport,
  deleteReport
} from '@api/report';
import { CourseCatalog } from '@api/types';

// 타입 정의
interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface ReportFormat {
  id: string;
  label: string;
  type: 'pdf' | 'excel' | 'csv' | 'html';
}

interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  courseId: string;
  courseName: string;
  format: string;
  createdAt: string;
  url?: string;
  status: 'completed' | 'in-progress' | 'failed';
}

export default function ReportGenerator() {
  const navigate = useNavigate();
  const { t, tString, i18n } = useTypedTranslation();

  // 상태 관리
  const [courses, setCourses] = useState<SelectProps.Option[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<SelectProps.Option | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<string>('quiz-comparison');
  const [startDate, setStartDate] = useState<string>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  const [endDate, setEndDate] = useState<string>(new Date().toISOString());
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat['id']>('pdf');
  const [generating, setGenerating] = useState<boolean>(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
  const [loadingReports, setLoadingReports] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState<string>("generate");
  const [previewData, setPreviewData] = useState<any>(null);

  // 보고서 유형 목록
  const reportTypes: ReportType[] = [
    {
      id: 'quiz-comparison',
      title: t('reports.types.quiz_comparison.title'),
      description: t('reports.types.quiz_comparison.description'),
      icon: 'bar-chart'
    },
    {
      id: 'survey-analysis',
      title: t('reports.types.survey_analysis.title'),
      description: t('reports.types.survey_analysis.description'),
      icon: 'pie-chart'
    },
    {
      id: 'comprehensive',
      title: t('reports.types.comprehensive.title'),
      description: t('reports.types.comprehensive.description'),
      icon: 'dashboard'
    },
    {
      id: 'attendance',
      title: t('reports.types.attendance.title'),
      description: t('reports.types.attendance.description'),
      icon: 'user-profile'
    }
  ];

  // 보고서 형식 목록
  const reportFormats: ReportFormat[] = [
    { id: 'pdf', label: 'PDF', type: 'pdf' },
    { id: 'excel', label: 'Excel', type: 'excel' },
    { id: 'csv', label: 'CSV', type: 'csv' },
    { id: 'html', label: t('reports.formats.html'), type: 'html' }
  ];

  // 과정 목록 로드
  useEffect(() => {
    fetchCourses();
    fetchReports();
  }, []);

  // 과정 목록 가져오기
  const fetchCourses = async () => {
    setLoadingCourses(true);

    // try {
    //   const response = await listCourseCatalogs({
    //     // 옵션 매개변수 (필요시 설정)
    //   });

    //   if (response.data && Array.isArray(response.data)) {
    //     const courseItems = response.data.map(item => ({
    //       catalogId: item.catalogId || '',
    //       title: item.title || '',
    //       status: item.status || '',
    //       version: item.version || 'v1',  
    //     } as CourseCatalog));

    //     const courseOptions: SelectProps.Option[] = courseItems
    //     .filter((course: CourseCatalog) => course.status === 'ACTIVE')
    //     .map((course: CourseCatalog) => ({
    //       label: course.title,
    //       value: course.catalogId
    //     }));

    //     setCourses(courseOptions);
    //   } else if (process.env.NODE_ENV === 'development') {
    //     // 개발 환경 폴백 데이터
    //     setCourses([
    //       { label: 'AWS Cloud Practitioner', value: 'course-1' },
    //       { label: 'AWS Solutions Architect Associate', value: 'course-2' },
    //       { label: 'AWS Developer Associate', value: 'course-3' }
    //     ]);
    //   }
    // } catch (error) {
    //   console.error(t('reports.errors.course_load'), error);
    //   setError(t('reports.errors.course_load_message'));

    //   // 개발 환경 폴백 데이터
    //   if (process.env.NODE_ENV === 'development') {
    //     setCourses([
    //       { label: 'AWS Cloud Practitioner', value: 'course-1' },
    //       { label: 'AWS Solutions Architect Associate', value: 'course-2' },
    //       { label: 'AWS Developer Associate', value: 'course-3' }
    //     ]);
    //   }
    // } finally {
    //   setLoadingCourses(false);
    // }
  };

  // 보고서 목록 가져오기
  const fetchReports = async () => {
    setLoadingReports(true);
  
    try {
      const response = await listReports({
        limit: 50
      });
  
      if (response.data) {
        // 배열인지 확인하는 타입 가드 추가
        if (Array.isArray(response.data)) {
          // 배열인 경우 정렬
          const sortedReports = [...response.data].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          setGeneratedReports(sortedReports);
        } else {
          // 단일 항목인 경우 배열로 변환
          setGeneratedReports([response.data]);
        }
      } else {
        setGeneratedReports([]);
      }
    } catch (error) {
      console.error(t('reports.errors.report_load'), error);
      setError(t('reports.errors.report_load_message'));

      // 개발 환경 폴백 데이터
      if (process.env.NODE_ENV === 'development') {
        setGeneratedReports([
          {
            id: 'report-1',
            title: 'AWS Cloud Practitioner - ' + t('reports.types.quiz_comparison.title'),
            type: 'quiz-comparison',
            courseId: 'course-1',
            courseName: 'AWS Cloud Practitioner',
            format: 'pdf',
            createdAt: new Date().toISOString(),
            status: 'completed',
            url: '#'
          },
          {
            id: 'report-2',
            title: 'AWS Solutions Architect Associate - ' + t('reports.types.survey_analysis.title'),
            type: 'survey-analysis',
            courseId: 'course-2',
            courseName: 'AWS Solutions Architect Associate',
            format: 'excel',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            url: '#'
          }
        ]);
      }
    } finally {
      setLoadingReports(false);
    }
  };

  // 보고서 미리보기 데이터 가져오기
  const fetchPreviewData = async () => {
    if (!selectedCourse) return;

    try {
      // 여기서는 API 호출 대신 샘플 데이터 사용
      const sampleData = {
        quizComparison: {
          labels: [
            t('reports.preview.question', { number: 1 }),
            t('reports.preview.question', { number: 2 }),
            t('reports.preview.question', { number: 3 }),
            t('reports.preview.question', { number: 4 }),
            t('reports.preview.question', { number: 5 }),
            t('reports.preview.question', { number: 6 }),
            t('reports.preview.question', { number: 7 }),
            t('reports.preview.question', { number: 8 }),
            t('reports.preview.question', { number: 9 }),
            t('reports.preview.question', { number: 10 })
          ],
          preSeries: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70],
          postSeries: [80, 75, 90, 88, 76, 82, 69, 80, 85, 95],
          averageImprovement: '23.5%'
        },
        surveyAnalysis: {
          satisfaction: {
            labels: [
              t('reports.preview.satisfaction.very_high'),
              t('reports.preview.satisfaction.high'),
              t('reports.preview.satisfaction.neutral'),
              t('reports.preview.satisfaction.low'),
              t('reports.preview.satisfaction.very_low')
            ],
            data: [42, 35, 15, 5, 3]
          },
          recommendationScore: 8.7,
          topComments: [
            t('reports.preview.comment1'),
            t('reports.preview.comment2'),
            t('reports.preview.comment3')
          ]
        }
      };

      setPreviewData(sampleData);
    } catch (error) {
      console.error(t('reports.errors.preview_load'), error);
      setError(t('reports.errors.preview_load_message'));
    }
  };

  // 보고서 생성
  const handleGenerateReport = async () => {
    if (!selectedCourse) {
      setError(t('reports.errors.select_course'));
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const selectedReportTypeObj = reportTypes.find(type => type.id === selectedReportType);
      const reportTitle = `\${selectedCourse.label} - \${selectedReportTypeObj?.title}`;

      // courseId가 undefined가 아님을 확인
      const courseId = selectedCourse.value as string;
      const courseName = selectedCourse.label as string;

      const reportData = {
        courseId,  // 이제 확실히 string 타입
        courseName,
        reportType: selectedReportType,
        startDate,
        endDate,
        format: selectedFormat,
        title: reportTitle
      };

      await generateReport(reportData);

      // 보고서 생성이 시작되었음을 알림
      alert(t('reports.alerts.generation_started'));

      // 보고서 목록 다시 불러오기
      fetchReports();

      // 보고서 탭으로 전환
      setActiveTabId('reports');

    } catch (error) {
      console.error(t('reports.errors.generation'), error);
      setError(t('reports.errors.generation_message'));

      // 개발 환경에서는 mock 응답
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          const newReport = {
            id: `report-\${Date.now()}`,
            title: `\${selectedCourse.label} - \${reportTypes.find(type => type.id === selectedReportType)?.title}`,
            type: selectedReportType,
            courseId: selectedCourse.value as string,
            courseName: selectedCourse.label as string,
            format: selectedFormat,
            createdAt: new Date().toISOString(),
            status: 'completed' as 'completed',
            url: '#'
          };

          setGeneratedReports(prev => [newReport, ...prev]);
          setActiveTabId('reports');
          alert(t('reports.alerts.report_created'));
        }, 2000);
      }
    } finally {
      setGenerating(false);
    }
  };

  // 보고서 다운로드
  const downloadReport = (report: GeneratedReport) => {
    if (report.url) {
      window.open(report.url, '_blank');
    } else {
      alert(t('reports.alerts.no_download_url'));
    }
  };

  // 보고서 삭제
  const handleDeleteReport = async (reportId: string) => {
    if (confirm(tString('reports.alerts.confirm_delete'))) {
      try {
        await deleteReport(reportId);

        // 목록에서 제거
        setGeneratedReports(prev => prev.filter(report => report.id !== reportId));

      } catch (error) {
        console.error(t('reports.errors.delete'), error);
        alert(t('reports.errors.delete_message'));
      }
    }
  };

  // 미리보기가 필요할 때 데이터를 가져옵니다
  useEffect(() => {
    if (selectedCourse && activeTabId === 'preview') {
      fetchPreviewData();
    }
  }, [selectedCourse, activeTabId]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return t('reports.status.completed');
      case 'in-progress': return t('reports.status.in_progress');
      case 'failed': return t('reports.status.failed');
      default: return status;
    }
  };

  // 각 탭 컴포넌트 메모이제이션
  const generateTabContent = useMemo(() => (
    <Container header={<Header variant="h2">{t('reports.report_settings')}</Header>}>
      <SpaceBetween size="l">
        <FormField label={t('reports.select_course')}>
          <Select
            selectedOption={selectedCourse}
            onChange={({ detail }) => setSelectedCourse(detail.selectedOption)}
            options={courses}
            placeholder={tString('reports.course_placeholder')}
            filteringType="auto"
            statusType={loadingCourses ? "loading" : "finished"}
            loadingText={tString('reports.loading_courses')}
            empty={
              <Box textAlign="center" color="inherit">
                <b>{t('reports.no_courses.title')}</b>
                <Box padding={{ bottom: "xs" }}>
                  {t('reports.no_courses.message')}
                </Box>
              </Box>
            }
          />
        </FormField>

        <FormField label={t('reports.report_type')}>
          <Cards
            cardDefinition={{
              header: item => item.title,
              sections: [
                {
                  id: "description",
                  content: item => item.description
                }
              ]
            }}
            cardsPerRow={[
              { cards: 1 },
              { minWidth: 500, cards: 2 }
            ]}
            items={reportTypes}
            selectedItems={reportTypes.filter(item => item.id === selectedReportType)}
            selectionType="single"
            onSelectionChange={({ detail }) =>
              detail.selectedItems.length > 0 &&
              setSelectedReportType(detail.selectedItems[0].id)
            }
            trackBy="id"
          />
        </FormField>

        <ColumnLayout columns={2}>
          <FormField label={t('reports.start_date')}>
            <DatePicker
              onChange={({ detail }) => detail.value && setStartDate(detail.value)}
              value={startDate ? startDate.split('T')[0] : ''}
              placeholder="YYYY/MM/DD"
              i18nStrings={{
                nextMonthAriaLabel: tString('common.date.next_month'),
                previousMonthAriaLabel: tString('common.date.previous_month'),
                todayAriaLabel: tString('common.date.today')
              }}
            />
          </FormField>

          <FormField label={t('reports.end_date')}>
            <DatePicker
              onChange={({ detail }) => detail.value && setEndDate(detail.value)}
              value={endDate ? endDate.split('T')[0] : ''}
              placeholder="YYYY/MM/DD"
              i18nStrings={{
                nextMonthAriaLabel: tString('common.date.next_month'),
                previousMonthAriaLabel: tString('common.date.previous_month'),
                todayAriaLabel: tString('common.date.today')
              }}
            />
          </FormField>
        </ColumnLayout>

        <FormField label={t('reports.format')}>
          <SegmentedControl
            selectedId={selectedFormat}
            onChange={({ detail }) => setSelectedFormat(detail.selectedId)}
            options={reportFormats.map(format => ({
              id: format.id,
              text: format.label
            }))}
          />
        </FormField>

        <SpaceBetween direction="horizontal" size="xs">
          <Button
            onClick={() => setActiveTabId('preview')}
            disabled={!selectedCourse}
          >
            {t('reports.buttons.preview')}
          </Button>
          <Button
            variant="primary"
            loading={generating}
            onClick={handleGenerateReport}
            disabled={!selectedCourse}
          >
            {t('reports.buttons.generate')}
          </Button>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  ), [courses, selectedCourse, selectedReportType, startDate, endDate, selectedFormat, generating, loadingCourses]);

  const previewTabContent = useMemo(() => (
    <Container header={<Header variant="h2">{t('reports.preview_title')}</Header>}>
      {!selectedCourse ? (
        <Box textAlign="center" color="inherit" padding="l">
          <b>{t('reports.preview_select_course.title')}</b>
          <p>{t('reports.preview_select_course.message')}</p>
        </Box>
      ) : !previewData ? (
        <Box textAlign="center" padding="l">
          <Spinner size="large" />
          <p>{t('reports.loading_data')}</p>
        </Box>
      ) : (
        <SpaceBetween size="l">
          <Header variant="h3">{selectedCourse.label} - {t('reports.preview_subtitle')}</Header>

          {selectedReportType === 'quiz-comparison' && (
            <SpaceBetween size="l">
              <Header variant="h3">{t('reports.quiz_comparison')}</Header>

              {/* Cloudscape BarChart 사용 */}
              <BarChart
                series={[
                  {
                    title: t('reports.pre_quiz'),
                    type: "bar",
                    data: previewData.quizComparison.labels.map((label: string, i: number) => ({
                      x: label,
                      y: previewData.quizComparison.preSeries[i]
                    })),
                  },
                  {
                    title: t('reports.post_quiz'),
                    type: "bar",
                    data: previewData.quizComparison.labels.map((label: string, i: number) => ({
                      x: label,
                      y: previewData.quizComparison.postSeries[i]
                    })),
                  }
                ]}
                yDomain={[0, 100]}
                i18nStrings={{
                  filterLabel: tString('common.filter'),
                  filterPlaceholder: tString('common.filter'),
                  filterSelectedAriaLabel: tString('common.selected'),
                  legendAriaLabel: tString('common.legend'),
                  chartAriaRoleDescription: tString('common.chart.bar'),
                  xAxisAriaRoleDescription: tString('common.chart.xAxis'),
                  yAxisAriaRoleDescription: tString('common.chart.yAxis')
                }}
                ariaLabel={tString('reports.quiz_comparison')}
                height={400}
                hideFilter
              />

              <Box variant="awsui-key-label">{t('reports.average_improvement')}: {previewData.quizComparison.averageImprovement}</Box>
            </SpaceBetween>
          )}

          {selectedReportType === 'survey-analysis' && (
            <SpaceBetween size="l">
              <Header variant="h3">{t('reports.survey_analysis')}</Header>

              {/* Cloudscape PieChart 사용 */}
              <div style={{ height: "400px" }}>
                <PieChart
                  data={previewData.surveyAnalysis.satisfaction.labels.map((label: string, i: number) => ({
                    title: label,
                    value: previewData.surveyAnalysis.satisfaction.data[i]
                  }))}
                  detailPopoverContent={(datum, sum) => [
                    { key: t('reports.responses'), value: datum.value },
                    { key: t('reports.percentage'), value: `\${((datum.value / sum) * 100).toFixed(1)}%` }
                  ]}
                  segmentDescription={(datum, sum) =>
                    `\${datum.title}: \${((datum.value / sum) * 100).toFixed(1)}%`
                  }
                  i18nStrings={{
                    detailsValue: tString('common.value'),
                    detailsPercentage: tString('common.percentage'),
                    filterLabel: tString('common.filter'),
                    filterPlaceholder: tString('common.filter'),
                    filterSelectedAriaLabel: tString('common.selected'),
                    legendAriaLabel: tString('common.legend'),
                    chartAriaRoleDescription: tString('common.chart.pie')
                  }}
                  ariaLabel={tString('reports.survey_analysis')}
                  hideFilter
                  size="large"
                />
              </div>

              <Box variant="awsui-key-label">{t('reports.recommendation_score')}: {previewData.surveyAnalysis.recommendationScore}/10</Box>
              <SpaceBetween size="s">
                <Box variant="awsui-key-label">{t('reports.top_opinions')}:</Box>
                <ul>
                  {previewData.surveyAnalysis.topComments.map((comment: string, index: number) => (
                    <li key={index}>{comment}</li>
                  ))}
                </ul>
              </SpaceBetween>
            </SpaceBetween>
          )}
        </SpaceBetween>
      )}
    </Container>
  ), [selectedCourse, previewData, selectedReportType]);

  const reportsTabContent = useMemo(() => (
    <Container header={<Header variant="h2" counter={`(\${generatedReports.length}개)`}>{t('reports.generated_reports')}</Header>}>
      <Table
        items={generatedReports}
        loading={loadingReports}
        loadingText={tString('reports.loading_reports')}
        columnDefinitions={[
          {
            id: "title",
            header: t('reports.columns.title'),
            cell: item => item.title,
            sortingField: "title"
          },
          {
            id: "type",
            header: t('reports.columns.type'),
            cell: item => {
              const reportType = reportTypes.find(type => type.id === item.type);
              return reportType?.title || item.type;
            }
          },
          {
            id: "courseName",
            header: t('reports.columns.course'),
            cell: item => item.courseName
          },
          {
            id: "format",
            header: t('reports.columns.format'),
            cell: item => item.format.toUpperCase()
          },
          {
            id: "status",
            header: t('reports.columns.status'),
            cell: item => (
              <Badge color={
                item.status === 'completed' ? 'green' :
                  item.status === 'in-progress' ? 'blue' : 'red'
              }>
                {getStatusLabel(item.status)}
              </Badge>
            )
          },
          {
            id: "createdAt",
            header: t('reports.columns.created_date'),
            cell: item => new Date(item.createdAt).toLocaleDateString()
          },
          {
            id: "actions",
            header: t('reports.columns.actions'),
            cell: item => (
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  disabled={item.status !== 'completed'}
                  onClick={() => downloadReport(item)}
                  iconName="download"
                >
                  {t('reports.buttons.download')}
                </Button>
                <Button
                  onClick={() => handleDeleteReport(item.id)}
                  iconName="remove"
                >
                  {t('reports.buttons.delete')}
                </Button>
              </SpaceBetween>
            )
          }
        ]}
        empty={
          <Box textAlign="center" color="inherit">
            <b>{t('reports.no_reports.title')}</b>
            <Box padding={{ bottom: "s" }}>
              {t('reports.no_reports.message')}
            </Box>
          </Box>
        }
        sortingDisabled
      />
    </Container>
  ), [generatedReports, loadingReports]);

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description={t('reports.description')}
        >
          {t('reports.title')}
        </Header>

        {error && (
          <Alert type="error">
            {error}
          </Alert>
        )}

        <Tabs
          activeTabId={activeTabId}
          onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
          tabs={[
            {
              id: "generate",
              label: t('reports.tabs.generate'),
              content: generateTabContent
            },
            {
              id: "preview",
              label: t('reports.tabs.preview'),
              content: previewTabContent
            },
            {
              id: "reports",
              label: t('reports.tabs.generated'),
              content: reportsTabContent
            }
          ]}
        />
      </SpaceBetween>
    </Container>
  );
}