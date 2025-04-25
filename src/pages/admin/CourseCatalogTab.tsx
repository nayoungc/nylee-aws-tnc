import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { GraphQLQuery } from '@aws-amplify/api';
import {
  Box,
  Button,
  ColumnLayout,
  Container,
  Header,
  SpaceBetween,
  StatusIndicator,
  Tabs,
  Alert,
  Table,
  Pagination
} from '@cloudscape-design/components';
import { useAuth, withAuthErrorHandling, createAuthErrorHandler } from '@contexts/AuthContext';
import { useTypedTranslation } from '@utils/i18n-utils';

// API 클라이언트 생성
const client = generateClient();

// 코스 카탈로그 인터페이스
interface CourseCatalogType {
  catalogId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  instructor?: string;
  duration: number;
  level?: string;
  createdAt: string;
  updatedAt: string;
  version?: string;
  awsCode?: string;
}

// API 응답 타입 정의
interface ListCourseCatalogsQuery {
  listCourseCatalogs: {
    items: Array<{
      catalogId: string;
      title: string;
      description?: string;
      imageUrl?: string;
      instructor?: string;
      duration?: number;
      level?: string;
      createdAt?: string;
      updatedAt?: string;
      version?: string;
      awsCode?: string;
    }>
  }
}

// 평가 현황 인터페이스
interface AssessmentStats {
  courseId: string;
  preQuiz: { total: number, completed: number };
  postQuiz: { total: number, completed: number };
  surveys: { total: number, completed: number };
}

// 모의 데이터 추가
const mockCourses: CourseCatalogType[] = [
  {
    catalogId: 'mock-1',
    title: '모의 AWS 클라우드 기초',
    description: '클라우드 컴퓨팅 및 AWS의 기본 개념을 배웁니다.',
    imageUrl: 'https://via.placeholder.com/300x200?text=AWS+Basics',
    instructor: '김강사',
    duration: 8,
    level: '입문',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    catalogId: 'mock-2',
    title: '모의 데이터베이스 서비스',
    description: 'AWS의 다양한 데이터베이스 서비스에 대해 학습합니다.',
    imageUrl: 'https://via.placeholder.com/300x200?text=Database+Services',
    instructor: '이강사',
    duration: 10,
    level: '중급',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    catalogId: 'mock-3',
    title: '모의 서버리스 아키텍처',
    description: 'AWS Lambda와 serverless 개발 방법을 배웁니다.',
    imageUrl: 'https://via.placeholder.com/300x200?text=Serverless',
    instructor: '박강사',
    duration: 12,
    level: '고급',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 모의 평가 데이터
const mockAssessmentStats: Record<string, AssessmentStats> = {
  'mock-1': {
    courseId: 'mock-1',
    preQuiz: { total: 15, completed: 10 },
    postQuiz: { total: 12, completed: 8 },
    surveys: { total: 20, completed: 15 }
  },
  'mock-2': {
    courseId: 'mock-2',
    preQuiz: { total: 10, completed: 7 },
    postQuiz: { total: 10, completed: 5 },
    surveys: { total: 15, completed: 10 }
  },
  'mock-3': {
    courseId: 'mock-3',
    preQuiz: { total: 8, completed: 6 },
    postQuiz: { total: 8, completed: 4 },
    surveys: { total: 12, completed: 9 }
  }
};

const CourseCatalogTab: React.FC = () => {
  const { t } = useTypedTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthStatus, hasCredentials, refreshCredentials } = useAuth();
  const [activeTabId, setActiveTabId] = useState('catalog');
  const [assessmentStats, setAssessmentStats] = useState<Record<string, AssessmentStats>>({});
  const [selectedCourse, setSelectedCourse] = useState<CourseCatalogType | null>(null);
  const [loading, setLoading] = useState(false);
  const [credentialLoading, setCredentialLoading] = useState(false);
  const [courses, setCourses] = useState<CourseCatalogType[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // 초기화 완료 플래그 - 무한 호출 방지
  const [initialized, setInitialized] = useState(false);

  // 실제 데이터 로드 함수 - useCallback으로 메모이제이션
  const loadRealData = useCallback(async (retryAttempt = 0) => {
    // 이미 로딩 중이면 중복 실행 방지
    if (loading) return;
    
    // 이미 데이터가 로드되었다면 재시도가 아닐 때만 중복 로드 방지
    if (dataLoaded && !retryAttempt) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 자격 증명이 없으면 즉시 모의 데이터 사용
      if (!hasCredentials) {
        console.log('자격 증명 없음, 모의 데이터 사용');
        setUseMockData(true);
        setCourses(mockCourses);
        setDataLoaded(true);
        setLoading(false);
        return;
      }
      
      console.log('실제 코스 데이터 로드 시도...');
      
      // 인증 오류 핸들러 생성
      const authErrorHandler = createAuthErrorHandler(
        (error) => {
          console.error('인증 오류:', error);
          setUseMockData(true);
          setCourses(mockCourses);
        }
      );

      // API 호출
      const result = await withAuthErrorHandling(
        async () => {
          try {
            const query = `
              query ListCourseCatalogs {
                listCourseCatalogs {
                  items {
                    catalogId
                    title
                    description
                    imageUrl
                    instructor
                    duration
                    level
                    createdAt
                    updatedAt
                    version
                    awsCode
                  }
                }
              }
            `;

            const response = await client.graphql<GraphQLQuery<ListCourseCatalogsQuery>>({
              query,
              authMode: 'userPool'
            });
            
            return response.data?.listCourseCatalogs;
          } catch (error) {
            console.error('GraphQL 호출 중 오류:', error);
            throw error;
          }
        },
        authErrorHandler
      )();

      // API 응답 처리
      if (result && result.items && result.items.length > 0) {
        console.log(`실제 데이터 로드 성공: \${result.items.length}개 항목`);
        
        setUseMockData(false);
        setCourses(result.items.map((course) => ({
          catalogId: course.catalogId,
          title: course.title || '제목 없음',
          description: course.description || '설명 없음',
          imageUrl: course.imageUrl || 'https://via.placeholder.com/300x200?text=Course',
          instructor: course.instructor || '강사 정보 없음',
          duration: typeof course.duration === 'number' ? course.duration : 0,
          level: course.level || '난이도 정보 없음',
          createdAt: course.createdAt || new Date().toISOString(),
          updatedAt: course.updatedAt || new Date().toISOString(),
          version: course.version,
          awsCode: course.awsCode
        })));
      } else {
        console.log('API 결과에 데이터가 없습니다');
        
        // 최대 재시도 횟수 초과 시 모의 데이터 사용
        if (retryAttempt >= 2) {
          setUseMockData(true);
          setCourses(mockCourses);
        } else {
          // 데이터가 없는 경우 빈 배열 설정
          setCourses([]);
        }
      }
      
    } catch (error: any) {
      console.error('데이터 로드 오류:', error);
      
      // 재시도 로직
      if (retryAttempt < 2) {
        console.log(`오류 발생, 재시도 \${retryAttempt + 1}/2...`);
        setRetryCount(retryAttempt + 1);
        
        // 일정 시간 후 재시도
        setTimeout(() => {
          loadRealData(retryAttempt + 1);
        }, 1000);
        return;
      }
      
      // 최대 재시도 횟수 초과 시 모의 데이터 사용
      console.log('최대 재시도 횟수 초과, 모의 데이터 사용');
      setUseMockData(true);
      setCourses(mockCourses);
      setError('데이터를 불러오는 중 오류가 발생했습니다. 모의 데이터를 표시합니다.');
    } finally {
      // 상태 업데이트
      setLoading(false);
      setDataLoaded(true);
      setInitialized(true); // 초기화 완료 표시
      setRetryCount(0);
    }
  }, [hasCredentials, loading, dataLoaded]);

  // 초기 데이터 로드 - 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    // 이미 초기화되었으면 중복 실행 방지
    if (initialized) return;
    
    const initData = async () => {
      try {
        // 인증 상태 확인
        const isAuth = await checkAuthStatus(false);
        if (!isAuth) {
          console.log('인증되지 않은 상태, 로그인 페이지로 이동');
          navigate('/signin');
          return;
        }
        
        // 세션 스토리지에 이미 로딩 중 플래그가 있는지 확인 (새로고침 케이스 방지)
        const isAlreadyLoading = sessionStorage.getItem('courseDataLoading') === 'true';
        if (isAlreadyLoading) {
          console.log('이미 다른 인스턴스에서 데이터 로딩 중, 중복 요청 방지');
          setUseMockData(true);
          setCourses(mockCourses);
          setDataLoaded(true);
          setInitialized(true);
          return;
        }
        
        // 로딩 중 플래그 설정
        sessionStorage.setItem('courseDataLoading', 'true');
        
        // 자료 로드
        await loadRealData();
        
        // 로딩 완료 후 플래그 제거
        sessionStorage.removeItem('courseDataLoading');
      } catch (error) {
        console.error('초기 데이터 로드 중 오류:', error);
        setUseMockData(true);
        setCourses(mockCourses);
        setDataLoaded(true);
        setInitialized(true);
        sessionStorage.removeItem('courseDataLoading');
      }
    };

    initData();
    
    // 언마운트 시 로딩 플래그 정리
    return () => {
      sessionStorage.removeItem('courseDataLoading');
    };
  }, []);  // 빈 배열로 컴포넌트 마운트 시 한 번만 실행

  // 평가 통계 로드 로직 - 선택된 과목 변경 시만 실행
  useEffect(() => {
    if (!selectedCourse?.catalogId || !isAuthenticated) return;
    
    // 평가 통계는 항상 모의 데이터 사용
    setAssessmentStats({
      [selectedCourse.catalogId]: 
        mockAssessmentStats[selectedCourse.catalogId] || 
        {
          courseId: selectedCourse.catalogId,
          preQuiz: { total: 10, completed: 5 },
          postQuiz: { total: 10, completed: 4 },
          surveys: { total: 15, completed: 8 }
        }
    });
  }, [selectedCourse, isAuthenticated]);

  // 수동 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    setError(null);
    setDataLoaded(false);
    setRetryCount(0);
    loadRealData();
  }, [loadRealData]);

  // 과정 선택 핸들러
  const handleCourseSelect = useCallback((course: CourseCatalogType) => {
    setSelectedCourse(course);
    setActiveTabId('assessments');
  }, []);

  // 자격 증명 갱신 핸들러
  const handleRefreshCredentials = useCallback(async () => {
    setCredentialLoading(true);
    try {
      const success = await refreshCredentials();
      if (success) {
        setUseMockData(false);
        setDataLoaded(false);
        loadRealData();
      } else {
        alert(t('auth.credentials_refresh_failed') || '자격 증명 갱신에 실패했습니다.');
      }
    } catch (error) {
      console.error('자격 증명 갱신 중 오류:', error);
    } finally {
      setCredentialLoading(false);
    }
  }, [refreshCredentials, loadRealData, t]);

  // 로그아웃 및 로그인 핸들러
  const handleLogoutAndLogin = useCallback(() => {
    setCredentialLoading(true);
    try {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/signout');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      setCredentialLoading(false);
    }
  }, [navigate]);

  // 카탈로그 테이블 렌더링
  const renderCourseTable = () => (
    <Box>
      {useMockData && (
        <Alert
          type="info"
          header={t('courses.mock_data_header') || "모의 데이터 표시 중"}
        >
          {t('courses.mock_data_description') || "현재 AWS 자격 증명 부족으로 실제 데이터를 불러올 수 없어 모의 데이터를 표시합니다."}
        </Alert>
      )}

      <Table
        items={courses}
        columnDefinitions={[
          {
            id: 'title',
            header: t('courses.title') || '제목',
            cell: item => item.title,
            sortingField: 'title'
          },
          {
            id: 'level',
            header: t('courses.level') || '난이도',
            cell: item => item.level,
            sortingField: 'level'
          },
          {
            id: 'duration',
            header: t('courses.duration') || '기간',
            cell: item => `\${item.duration}시간`,
            sortingField: 'duration'
          },
          {
            id: 'actions',
            header: t('courses.actions') || '작업',
            cell: item => (
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => handleCourseSelect(item)}>
                  {t('courses.view_assessments') || '평가 보기'}
                </Button>
                <Button onClick={() => navigate(`/instructor/courses/\${item.catalogId}`)}>
                  {t('courses.edit') || '편집'}
                </Button>
              </SpaceBetween>
            )
          }
        ]}
        loading={loading}
        loadingText={retryCount > 0
          ? `\${t('admin.common.retrying') || '재시도 중'} (\${retryCount}/2)...`
          : (t('common.loading') || '로딩 중')}
        empty={
          <Box textAlign="center" padding="l">
            <b>{t('courses.no_courses') || "과정이 없습니다."}</b>
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              {t('courses.no_courses_to_display') || "표시할 과정이 없습니다."}
            </Box>
            <Button onClick={handleRefresh}>{t('admin.common.refresh') || "새로고침"}</Button>
          </Box>
        }
        header={
          <Header
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button iconName="refresh" onClick={handleRefresh}>
                  {t('admin.common.refresh') || "새로고침"}
                </Button>
                <Button onClick={() => navigate('/instructor/courses/create')}>
                  {t('courses.create_course') || "과정 생성"}
                </Button>
                <Button onClick={() => navigate('/instructor/assessments/quiz-creator')}>
                  {t('courses.create_assessment') || "평가 생성"}
                </Button>
              </SpaceBetween>
            }
          >
            {t('courses.catalog_title') || "과정 카탈로그"}
          </Header>
        }
        pagination={
          <Pagination
            currentPageIndex={1}
            pagesCount={1}
            ariaLabels={{
              nextPageLabel: '다음',
              previousPageLabel: '이전',
              pageLabel: page => `\${page}페이지`
            }}
          />
        }
      />
    </Box>
  );

  // 평가 탭 렌더링
  const renderAssessmentTab = () => (
    selectedCourse ? (
      <Container
        header={
          <Header
            variant="h2"
            description={selectedCourse.description}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => navigate(`/instructor/assessments/quiz?courseId=\${selectedCourse.catalogId}`)}>
                  {t('courses.manage_quizzes') || "퀴즈 관리"}
                </Button>
                <Button onClick={() => navigate(`/instructor/assessments/survey?courseId=\${selectedCourse.catalogId}`)}>
                  {t('courses.manage_surveys') || "설문 관리"}
                </Button>
              </SpaceBetween>
            }
          >
            {selectedCourse.title} - {t('courses.assessment_stats') || "평가 현황"}
          </Header>
        }
      >
        {assessmentStats && selectedCourse.catalogId && assessmentStats[selectedCourse.catalogId] ? (
          <ColumnLayout columns={3}>
            <Box variant="awsui-key-label">
              <h3>{t('courses.pre_quiz_stats') || "사전 퀴즈 현황"}</h3>
              <div>
                <StatusIndicator type="success">
                  {assessmentStats[selectedCourse.catalogId]?.preQuiz?.completed || 0} / {assessmentStats[selectedCourse.catalogId]?.preQuiz?.total || 0} {t('courses.completed') || "완료"}
                </StatusIndicator>
              </div>
            </Box>
            <Box variant="awsui-key-label">
              <h3>{t('courses.post_quiz_stats') || "사후 퀴즈 현황"}</h3>
              <div>
                <StatusIndicator type="info">
                  {assessmentStats[selectedCourse.catalogId]?.postQuiz?.completed || 0} / {assessmentStats[selectedCourse.catalogId]?.postQuiz?.total || 0} {t('courses.completed') || "완료"}
                </StatusIndicator>
              </div>
            </Box>
            <Box variant="awsui-key-label">
              <h3>{t('courses.survey_stats') || "설문조사 현황"}</h3>
              <div>
                <StatusIndicator type="warning">
                  {assessmentStats[selectedCourse.catalogId]?.surveys?.completed || 0} / {assessmentStats[selectedCourse.catalogId]?.surveys?.total || 0} {t('courses.completed') || "완료"}
                </StatusIndicator>
              </div>
            </Box>
          </ColumnLayout>
        ) : (
          <Box textAlign="center" padding="l">
            {t('courses.no_assessment_data') || "평가 데이터가 없습니다."}
          </Box>
        )}
      </Container>
    ) : (
      <Box textAlign="center" padding="l">
        {t('courses.select_course_prompt') || "과정을 선택하세요."}
      </Box>
    )
  );

  // 탭 렌더링
  const renderTabs = () => (
    <Tabs
      activeTabId={activeTabId}
      onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
      tabs={[
        {
          id: 'catalog',
          label: t('courses.tabs.catalog') || "카탈로그",
          content: renderCourseTable()
        },
        {
          id: 'assessments',
          label: t('courses.tabs.assessments') || "평가",
          content: renderAssessmentTab()
        }
      ]}
    />
  );

  // 자격 증명 경고 표시
  const renderCredentialsWarning = () => (
    isAuthenticated && !hasCredentials && (
      <Box padding="s">
        <Alert
          type="warning"
          header={t('auth.credentials_required') || "AWS 자격 증명 필요"}
          action={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                onClick={handleRefreshCredentials}
                loading={credentialLoading}
              >
                {t('auth.refresh_credentials') || "자격 증명 갱신"}
              </Button>
              <Button
                variant="primary"
                onClick={handleLogoutAndLogin}
                loading={credentialLoading}
              >
                {t('auth.logout_and_login') || "로그아웃 후 다시 로그인"}
              </Button>
            </SpaceBetween>
          }
        >
          {t('auth.mock_data_warning') || "AWS 자격 증명 부족으로 모의 데이터가 표시되고 있습니다. 실제 데이터를 보려면 자격 증명을 갱신하세요."}
        </Alert>
      </Box>
    )
  );

  // 메인 렌더링
  return (
    <SpaceBetween size="l">
      <Container
        header={
          <Header
            variant="h1"
            description={t('courses.catalog_admin_description') || "과정 카탈로그를 관리합니다."}
            actions={
              <Button iconName="refresh" onClick={handleRefresh}>
                {t('admin.common.refresh') || "새로고침"}
              </Button>
            }
          >
            {t('courses.catalog_management') || "과정 카탈로그 관리"}
          </Header>
        }
      >
        {error && <Alert type="error" dismissible>{error}</Alert>}
        {renderCredentialsWarning()}
        
        {!initialized || (loading && !dataLoaded) ? (
          <Box textAlign="center" padding="l">
            {retryCount > 0
              ? `\${t('admin.common.retrying') || '재시도 중'} (\${retryCount}/2)...`
              : (t('common.loading') || '로딩 중...')}
          </Box>
        ) : (
          renderTabs()
        )}
      </Container>
    </SpaceBetween>
  );
};

export default CourseCatalogTab;