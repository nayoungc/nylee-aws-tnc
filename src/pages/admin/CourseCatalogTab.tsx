// src/pages/admin/CourseCatalogTab.tsx
import { listQuizzes, listSurveys, listCourses } from '@api';
import { useAuth, withAuthErrorHandling, createAuthErrorHandler } from '@contexts/AuthContext';
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
import {
  BaseCourseView,
  CourseCatalog as CourseCatalogType
} from '@components/courses/BaseCourseView';
import { useTypedTranslation } from '@utils/i18n-utils';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Quiz,
  Survey,
  Course
} from '@api/types';

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
    duration: '8시간',
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
    duration: '10시간',
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
    duration: '12시간',
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
  const { t, tString } = useTypedTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthStatus, handleAuthError, hasCredentials, refreshCredentials } = useAuth();
  const [activeTabId, setActiveTabId] = useState('catalog');
  const [assessmentStats, setAssessmentStats] = useState<Record<string, AssessmentStats>>({});
  const [selectedCourse, setSelectedCourse] = useState<CourseCatalogType | null>(null);
  const [loading, setLoading] = useState(false);
  const [credentialLoading, setCredentialLoading] = useState(false);
  const [courses, setCourses] = useState<CourseCatalogType[]>([]);
  const [useMockData, setUseMockData] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // 인증 상태 확인
  useEffect(() => {
    const verifyAuthentication = async () => {
      const isAuth = await checkAuthStatus(true);
      if (!isAuth) {
        console.log('인증되지 않은 상태, 로그인 페이지로 이동');
        navigate('/signin');
        return;
      }

      // 인증은 되었지만 AWS 자격 증명이 없는 경우 모의 데이터 사용
      if (!hasCredentials) {
        console.log('자격 증명 없음, 모의 데이터 사용');
        setUseMockData(true);
        setCourses(mockCourses);
        setDataLoaded(true);
      } else {
        // 자격 증명이 있으면 실제 데이터 로드 시도
        loadRealData();
      }
    };

    verifyAuthentication();
  }, [checkAuthStatus, hasCredentials, navigate]);

  // 실제 데이터 로드 함수
  const loadRealData = async () => {
    setLoading(true);
    try {
      // 인증 오류 핸들러 생성
      const authErrorHandler = createAuthErrorHandler(
        (error) => {
          console.error('인증 오류:', error);
          setUseMockData(true);
          setCourses(mockCourses);
        },
        navigate
      );

      // listCourses API를 사용하여 실제 데이터 로드
      const result = await withAuthErrorHandling(listCourses, authErrorHandler)({});
      
      if (result.success && result.data && result.data.length > 0) {
        setCourses(result.data.map((course: any) => ({
          catalogId: course.id,
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl || 'https://via.placeholder.com/300x200?text=Course',
          instructor: course.instructor || '강사 정보 없음',
          duration: course.duration || '기간 정보 없음',
          level: course.level || '난이도 정보 없음',
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        })));
        setDataLoaded(true);
      } else {
        // API 결과가 비어있으면 모의 데이터 사용
        console.log('API 결과가 없습니다. 모의 데이터 사용');
        setUseMockData(true);
        setCourses(mockCourses);
        setDataLoaded(true);
      }
    } catch (error) {
      console.error('과정 데이터 로드 오류:', error);
      setUseMockData(true);
      setCourses(mockCourses);
      setDataLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  // 선택된 과정에 대한 평가 통계 불러오기
  useEffect(() => {
    const fetchAssessmentStats = async () => {
      if (!selectedCourse?.catalogId || !isAuthenticated) return;

      setLoading(true);
      
      // 자격 증명이 없거나 모의 데이터 모드면 모의 통계 사용
      if (!hasCredentials || useMockData) {
        console.log('자격 증명 없음 또는 모의 데이터 모드, 모의 통계 사용');
        const mockStat = mockAssessmentStats[selectedCourse.catalogId] || {
          courseId: selectedCourse.catalogId,
          preQuiz: { total: 10, completed: 5 },
          postQuiz: { total: 10, completed: 4 },
          surveys: { total: 15, completed: 8 }
        };
        
        setAssessmentStats({
          [selectedCourse.catalogId]: mockStat
        });
        setLoading(false);
        return;
      }

      try {
        // createAuthErrorHandler 사용
        const authErrorHandler = createAuthErrorHandler(
          (error) => {
            console.error('인증 오류:', error);
            setLoading(false);
          },
          navigate
        );

        // 1. 퀴즈 데이터 가져오기
        const preQuizResult = await withAuthErrorHandling(listQuizzes, authErrorHandler)({
          filter: {
            expression: 'courseId = :courseId AND quizType = :quizType',
            expressionValues: {
              ':courseId': selectedCourse.catalogId,
              ':quizType': 'pre'
            }
          }
        });

        const postQuizResult = await withAuthErrorHandling(listQuizzes, authErrorHandler)({
          filter: {
            expression: 'courseId = :courseId AND quizType = :quizType',
            expressionValues: {
              ':courseId': selectedCourse.catalogId,
              ':quizType': 'post'
            }
          }
        });

        // 2. 설문조사 데이터 가져오기
        const surveysResult = await withAuthErrorHandling(listSurveys, authErrorHandler)({
          filter: {
            expression: 'courseId = :courseId',
            expressionValues: {
              ':courseId': selectedCourse.catalogId
            }
          }
        });

        // 3. 통계 계산 및 상태 업데이트
        const stats: Record<string, AssessmentStats> = {
          [selectedCourse.catalogId]: {
            courseId: selectedCourse.catalogId,
            preQuiz: {
              total: preQuizResult.data.length,
              completed: (preQuizResult.data as Quiz[]).filter(q => q.status === 'COMPLETED').length
            },
            postQuiz: {
              total: postQuizResult.data.length,
              completed: (postQuizResult.data as Quiz[]).filter(q => q.status === 'COMPLETED').length
            },
            surveys: {
              total: surveysResult.data.length,
              completed: (surveysResult.data as Survey[]).filter(s => s.responseCount > 0).length
            }
          }
        };

        setAssessmentStats(stats);
      } catch (error) {
        console.error('평가 현황 데이터 로드 중 오류:', error);
        // 오류 발생 시 모의 데이터로 대체
        const mockStat = mockAssessmentStats[selectedCourse.catalogId] || {
          courseId: selectedCourse.catalogId,
          preQuiz: { total: 10, completed: 5 },
          postQuiz: { total: 10, completed: 4 },
          surveys: { total: 15, completed: 8 }
        };
        
        setAssessmentStats({
          [selectedCourse.catalogId]: mockStat
        });
      } finally {
        setLoading(false);
      }
    };

    if (selectedCourse?.catalogId && isAuthenticated) {
      fetchAssessmentStats();
    }
  }, [selectedCourse, isAuthenticated, checkAuthStatus, hasCredentials, useMockData]);

  const handleCourseSelect = (course: CourseCatalogType) => {
    setSelectedCourse(course);
    setActiveTabId('assessments');
  };

  // 자격 증명 갱신 시도
  const handleRefreshCredentials = async () => {
    setCredentialLoading(true);
    try {
      const success = await refreshCredentials();
      if (success) {
        // 성공 시 실제 데이터 로드
        setUseMockData(false);
        loadRealData();
      } else {
        alert(t('auth.credentials_refresh_failed') || '자격 증명 갱신에 실패했습니다. 다시 로그인해주세요.');
      }
    } catch (error) {
      console.error('자격 증명 갱신 중 오류:', error);
    } finally {
      setCredentialLoading(false);
    }
  };

  const handleLogoutAndLogin = async () => {
    setCredentialLoading(true);
    try {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/signout');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      setCredentialLoading(false);
    }
  };

  // 카탈로그 테이블 직접 구현 (BaseCourseView 대체)
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
            id: 'instructor',
            header: t('courses.instructor') || '강사',
            cell: item => item.instructor,
            sortingField: 'instructor'
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
            cell: item => item.duration,
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
        loadingText={t('common.loading') || "로딩 중"}
        empty={
          <Box textAlign="center" padding="l">
            {t('courses.no_courses') || "과정이 없습니다."}
          </Box>
        }
        header={
          <Header
            actions={
              <SpaceBetween direction="horizontal" size="xs">
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
        {loading ? (
          <Box textAlign="center" padding="l">
            {t('common.loading') || "로딩 중..."}
          </Box>
        ) : assessmentStats && selectedCourse.catalogId && assessmentStats[selectedCourse.catalogId] ? (
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
          actionLinks={
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

  return (
    <SpaceBetween size="l">
      <Container
        header={
          <Header
            variant="h1"
            description={t('courses.catalog_admin_description') || "과정 카탈로그를 관리합니다."}
          >
            {t('courses.catalog_management') || "과정 카탈로그 관리"}
          </Header>
        }
      >
        {renderCredentialsWarning()}
        {loading && !dataLoaded ? (
          <Box textAlign="center" padding="l">
            {t('common.loading') || "로딩 중..."}
          </Box>
        ) : (
          renderTabs()
        )}
      </Container>
    </SpaceBetween>
  );
};

export default CourseCatalogTab;