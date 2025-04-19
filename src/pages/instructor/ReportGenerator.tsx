import React, { useState, useEffect } from 'react';
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
  ContentLayout,
  Alert,
  Badge,
  Spinner,
  SegmentedControl,
  BarChart,
  PieChart
} from '@cloudscape-design/components';
import { SelectProps } from '@cloudscape-design/components';
import { generateClient } from 'aws-amplify/api';
import { post } from 'aws-amplify/api';
import { useNavigate } from 'react-router-dom';

// 타입 정의
interface CourseItem {
  id: string;
  title: string;
}

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

// GraphQL 쿼리
const listCourseCatalogs = /* GraphQL */ `
  query ListCourseCatalogs(
    \$filter: ModelCourseCatalogFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listCourseCatalogs(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        title
        status
      }
      nextToken
    }
  }
`;

const listReports = /* GraphQL */ `
  query ListReports(
    \$filter: ModelReportFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listReports(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        title
        type
        courseId
        courseName
        format
        createdAt
        url
        status
      }
      nextToken
    }
  }
`;

export default function ReportGenerator() {
  const navigate = useNavigate();
  
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
  const [activeTab, setActiveTab] = useState<string>("generate");
  const [previewData, setPreviewData] = useState<any>(null);
  
  // 보고서 유형 목록
  const reportTypes: ReportType[] = [
    {
      id: 'quiz-comparison',
      title: '사전/사후 퀴즈 비교 분석',
      description: '사전 및 사후 퀴즈 결과를 비교하여 학습 효과를 분석합니다.',
      icon: 'bar-chart'
    },
    {
      id: 'survey-analysis',
      title: '설문조사 분석',
      description: '설문조사 응답을 분석하여 과정 만족도 및 피드백을 확인합니다.',
      icon: 'pie-chart'
    },
    {
      id: 'comprehensive',
      title: '종합 과정 분석',
      description: '퀴즈, 설문조사, 참여도 등 모든 데이터를 종합적으로 분석합니다.',
      icon: 'dashboard'
    },
    {
      id: 'attendance',
      title: '출석 및 참여도 보고서',
      description: '세션별 출석 및 참여도를 분석합니다.',
      icon: 'user-profile'
    }
  ];

  // 보고서 형식 목록
  const reportFormats: ReportFormat[] = [
    { id: 'pdf', label: 'PDF', type: 'pdf' },
    { id: 'excel', label: 'Excel', type: 'excel' },
    { id: 'csv', label: 'CSV', type: 'csv' },
    { id: 'html', label: 'Web (HTML)', type: 'html' }
  ];

  // 과정 목록 로드
  useEffect(() => {
    fetchCourses();
    fetchReports();
  }, []);

  // 과정 목록 가져오기
  const fetchCourses = async () => {
    setLoadingCourses(true);
    
    try {
      const client = generateClient();
      
      const response = await client.graphql({
        query: listCourseCatalogs,
        variables: {
          limit: 100,
          filter: {
            status: { eq: "ACTIVE" }
          }
        }
      });

      const responseAny: any = response;
      const courseItems = responseAny.data?.listCourseCatalogs?.items || [];
      
      const courseOptions: SelectProps.Option[] = courseItems.map((course: CourseItem) => ({
        label: course.title,
        value: course.id
      }));
      
      setCourses(courseOptions);
    } catch (error) {
      console.error('과정 로드 오류:', error);
      setError('과정 목록을 로드하는 데 실패했습니다.');
      
      // 개발 환경 폴백 데이터
      if (process.env.NODE_ENV === 'development') {
        setCourses([
          { label: 'AWS Cloud Practitioner', value: 'course-1' },
          { label: 'AWS Solutions Architect Associate', value: 'course-2' },
          { label: 'AWS Developer Associate', value: 'course-3' }
        ]);
      }
    } finally {
      setLoadingCourses(false);
    }
  };

  // 보고서 목록 가져오기
  const fetchReports = async () => {
    setLoadingReports(true);
    
    try {
      const client = generateClient();
      
      const response = await client.graphql({
        query: listReports,
        variables: {
          limit: 50
        }
      });

      const responseAny: any = response;
      const reportItems = responseAny.data?.listReports?.items || [];
      
      // 날짜 기준 내림차순 정렬 (최신순)
      const sortedReports = [...reportItems].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setGeneratedReports(sortedReports);
    } catch (error) {
      console.error('보고서 로드 오류:', error);
      setError('보고서 목록을 로드하는 데 실패했습니다.');
      
      // 개발 환경 폴백 데이터
      if (process.env.NODE_ENV === 'development') {
        setGeneratedReports([
          {
            id: 'report-1',
            title: 'AWS Cloud Practitioner - 사전/사후 퀴즈 비교 분석',
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
            title: 'AWS Solutions Architect Associate - 설문조사 분석',
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
          labels: ['문제 1', '문제 2', '문제 3', '문제 4', '문제 5', '문제 6', '문제 7', '문제 8', '문제 9', '문제 10'],
          preSeries: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70],
          postSeries: [80, 75, 90, 88, 76, 82, 69, 80, 85, 95],
          averageImprovement: '23.5%'
        },
        surveyAnalysis: {
          satisfaction: {
            labels: ['매우 만족', '만족', '보통', '불만족', '매우 불만족'],
            data: [42, 35, 15, 5, 3]
          },
          recommendationScore: 8.7,
          topComments: [
            '실습 시간이 충분해서 좋았습니다.',
            '강사님의 설명이 매우 이해하기 쉬웠어요.',
            '더 많은 실전 예제가 있었으면 좋겠습니다.'
          ]
        }
      };
      
      setPreviewData(sampleData);
    } catch (error) {
      console.error('미리보기 데이터 로드 오류:', error);
      setError('미리보기 데이터를 로드하는 데 실패했습니다.');
    }
  };

  // 보고서 생성
  const generateReport = async () => {
    if (!selectedCourse) {
      setError('과정을 선택해주세요.');
      return;
    }
    
    setGenerating(true);
    setError(null);
    
    try {
      const selectedReportTypeObj = reportTypes.find(type => type.id === selectedReportType);
      const selectedFormatObj = reportFormats.find(format => format.id === selectedFormat);
      
      const reportTitle = `\${selectedCourse.label} - \${selectedReportTypeObj?.title}`;
      
      const response = await post({
        apiName: 'reportApi',
        path: '/generate-report',
        options: {
          body: JSON.stringify({
            courseId: selectedCourse.value,
            courseName: selectedCourse.label,
            reportType: selectedReportType,
            startDate,
            endDate,
            format: selectedFormat,
            title: reportTitle
          })
        }
      }).response;
      
      // 보고서 생성이 시작되었음을 알림
      alert('보고서 생성이 시작되었습니다. 생성된 보고서 탭에서 확인할 수 있습니다.');
      
      // 보고서 목록 다시 불러오기
      fetchReports();
      
      // 보고서 탭으로 전환
      setActiveTab('reports');
      
    } catch (error) {
      console.error('보고서 생성 오류:', error);
      setError('보고서 생성 중 오류가 발생했습니다.');
      
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
          setActiveTab('reports');
          alert('보고서가 생성되었습니다.');
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
      alert('다운로드 URL을 찾을 수 없습니다.');
    }
  };

  // 보고서 삭제
  const deleteReport = async (reportId: string) => {
    if (confirm('정말로 이 보고서를 삭제하시겠습니까?')) {
      try {
        await post({
          apiName: 'reportApi',
          path: '/delete-report',
          options: {
            body: JSON.stringify({ reportId })
          }
        });
        
        // 목록에서 제거
        setGeneratedReports(prev => prev.filter(report => report.id !== reportId));
        
      } catch (error) {
        console.error('보고서 삭제 오류:', error);
        alert('보고서를 삭제하는 데 실패했습니다.');
      }
    }
  };
  
  // 미리보기가 필요할 때 데이터를 가져옵니다
  useEffect(() => {
    if (selectedCourse && activeTab === 'preview') {
      fetchPreviewData();
    }
  }, [selectedCourse, activeTab]);

  return (
    <ContentLayout>
      <SpaceBetween size="l">
        <Header variant="h1">보고서 생성</Header>
        
        {error && (
          <Alert type="error">
            {error}
          </Alert>
        )}
        
        <Tabs
          activeTabId={activeTab}
          onChange={({ detail }) => setActiveTab(detail.activeTabId)}
          tabs={[
            {
              id: "generate",
              label: "보고서 생성",
              content: (
                <Container header={<Header variant="h2">보고서 설정</Header>}>
                  <SpaceBetween size="l">
                    <FormField label="과정 선택">
                      <Select
                        selectedOption={selectedCourse}
                        onChange={({ detail }) => setSelectedCourse(detail.selectedOption)}
                        options={courses}
                        placeholder="과정 선택"
                        filteringType="auto"
                        statusType={loadingCourses ? "loading" : "finished"}
                        loadingText="과정 목록을 불러오는 중..."
                        empty={
                          <Box textAlign="center" color="inherit">
                            <b>과정이 없습니다</b>
                            <Box padding={{ bottom: "xs" }}>
                              사용 가능한 과정이 없습니다. 과정을 먼저 등록하세요.
                            </Box>
                          </Box>
                        }
                      />
                    </FormField>
                    
                    <FormField label="보고서 유형">
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
                      <FormField label="시작 날짜">
                        <DatePicker
                          onChange={({ detail }) => detail.value && setStartDate(detail.value)}
                          value={startDate ? startDate.split('T')[0] : ''}
                          placeholder="YYYY/MM/DD"
                        />
                      </FormField>
                      
                      <FormField label="종료 날짜">
                        <DatePicker
                          onChange={({ detail }) => detail.value && setEndDate(detail.value)}
                          value={endDate ? endDate.split('T')[0] : ''}
                          placeholder="YYYY/MM/DD"
                        />
                      </FormField>
                    </ColumnLayout>
                    
                    <FormField label="보고서 형식">
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
                        onClick={() => setActiveTab('preview')}
                        disabled={!selectedCourse}
                      >
                        미리보기
                      </Button>
                      <Button
                        variant="primary"
                        loading={generating}
                        onClick={generateReport}
                        disabled={!selectedCourse}
                      >
                        보고서 생성
                      </Button>
                    </SpaceBetween>
                  </SpaceBetween>
                </Container>
              ),
            },
            {
              id: "preview",
              label: "미리보기",
              content: (
                <Container header={<Header variant="h2">보고서 미리보기</Header>}>
                  {!selectedCourse ? (
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>과정을 선택해주세요</b>
                      <p>보고서 미리보기를 위해 과정을 먼저 선택해주세요.</p>
                    </Box>
                  ) : !previewData ? (
                    <Box textAlign="center" padding="l">
                      <Spinner size="large" />
                      <p>데이터를 불러오는 중입니다...</p>
                    </Box>
                  ) : (
                    <SpaceBetween size="l">
                      <Header variant="h3">{selectedCourse.label} - 보고서 미리보기</Header>
                      
                      {selectedReportType === 'quiz-comparison' && (
                        <SpaceBetween size="l">
                          <Header variant="h3">사전/사후 퀴즈 비교</Header>
                          
                          {/* Cloudscape BarChart 사용 */}
                          <BarChart
                            series={[
                              {
                                title: "사전 퀴즈",
                                type: "bar",
                                data: previewData.quizComparison.labels.map((label: string, i: number) => ({
                                  x: label,
                                  y: previewData.quizComparison.preSeries[i]
                                })),
                              },
                              {
                                title: "사후 퀴즈",
                                type: "bar",
                                data: previewData.quizComparison.labels.map((label: string, i: number) => ({
                                  x: label,
                                  y: previewData.quizComparison.postSeries[i]
                                })),
                              }
                            ]}
                            yDomain={[0, 100]}
                            i18nStrings={{
                              filterLabel: "필터",
                              filterPlaceholder: "필터",
                              filterSelectedAriaLabel: "선택됨",
                              legendAriaLabel: "범례",
                              chartAriaRoleDescription: "막대 차트",
                              xAxisAriaRoleDescription: "X축",
                              yAxisAriaRoleDescription: "Y축"
                            }}
                            ariaLabel="사전/사후 퀴즈 비교"
                            height={400}
                            hideFilter
                          />
                          
                          <Box variant="awsui-key-label">평균 향상도: {previewData.quizComparison.averageImprovement}</Box>
                        </SpaceBetween>
                      )}
                      
                      {selectedReportType === 'survey-analysis' && (
                        <SpaceBetween size="l">
                          <Header variant="h3">설문조사 분석</Header>
                          
                          {/* Cloudscape PieChart 사용 */}
                          <div style={{ height: "400px" }}>
                            <PieChart
                                data={previewData.surveyAnalysis.satisfaction.labels.map((label: string, i: number) => ({
                                title: label,
                                value: previewData.surveyAnalysis.satisfaction.data[i]
                                }))}
                                detailPopoverContent={(datum, sum) => [
                                { key: '응답 수', value: datum.value },
                                { key: '비율', value: `\${((datum.value / sum) * 100).toFixed(1)}%` }
                                ]}
                                segmentDescription={(datum, sum) => 
                                `\${datum.title}: \${((datum.value / sum) * 100).toFixed(1)}%`
                                }
                                i18nStrings={{
                                detailsValue: "값",
                                detailsPercentage: "백분율",
                                filterLabel: "필터",
                                filterPlaceholder: "필터",
                                filterSelectedAriaLabel: "선택됨",
                                legendAriaLabel: "범례",
                                chartAriaRoleDescription: "파이 차트"
                                }}
                                ariaLabel="설문 조사 분석"
                                hideFilter
                                size="large" // size 속성을 사용하여 크기 조절
                            />
                            </div>
                          
                          <Box variant="awsui-key-label">추천 점수: {previewData.surveyAnalysis.recommendationScore}/10</Box>
                          <SpaceBetween size="s">
                            <Box variant="awsui-key-label">주요 의견:</Box>
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
              )
            },
            {
              id: "reports",
              label: "생성된 보고서",
              content: (
                <Container header={<Header variant="h2" counter={`(\${generatedReports.length}개)`}>생성된 보고서</Header>}>
                  <Table
                    items={generatedReports}
                    loading={loadingReports}
                    loadingText="보고서 목록을 불러오는 중..."
                    columnDefinitions={[
                      {
                        id: "title",
                        header: "제목",
                        cell: item => item.title,
                        sortingField: "title"
                      },
                      {
                        id: "type",
                        header: "보고서 유형",
                        cell: item => {
                          const reportType = reportTypes.find(type => type.id === item.type);
                          return reportType?.title || item.type;
                        }
                      },
                      {
                        id: "courseName",
                        header: "과정",
                        cell: item => item.courseName
                      },
                      {
                        id: "format",
                        header: "형식",
                        cell: item => item.format.toUpperCase()
                      },
                      {
                        id: "status",
                        header: "상태",
                        cell: item => (
                          <Badge color={
                            item.status === 'completed' ? 'green' : 
                            item.status === 'in-progress' ? 'blue' : 'red'
                          }>
                            {item.status === 'completed' ? '완료' : 
                             item.status === 'in-progress' ? '생성 중' : '실패'}
                          </Badge>
                        )
                      },
                      {
                        id: "createdAt",
                        header: "생성 날짜",
                        cell: item => new Date(item.createdAt).toLocaleDateString()
                      },
                      {
                        id: "actions",
                        header: "작업",
                        cell: item => (
                          <SpaceBetween direction="horizontal" size="xs">
                            <Button
                              disabled={item.status !== 'completed'}
                              onClick={() => downloadReport(item)}
                              iconName="download"
                            >
                              다운로드
                            </Button>
                            <Button
                              onClick={() => deleteReport(item.id)}
                              iconName="remove"
                            >
                              삭제
                            </Button>
                          </SpaceBetween>
                        )
                      }
                    ]}
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>생성된 보고서가 없습니다</b>
                        <Box padding={{ bottom: "s" }}>
                          '보고서 생성' 탭에서 새 보고서를 생성하세요.
                        </Box>
                      </Box>
                    }
                    sortingDisabled
                  />
                </Container>
              )
            }
          ]}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}