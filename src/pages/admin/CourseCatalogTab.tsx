// src/pages/admin/CourseCatalogTab.tsx
import { listQuizzes, listSurveys } from '@api';
import { useAuth, withAuthErrorHandling, createAuthErrorHandler } from '@contexts/AuthContext';

import {
  Box,
  Button,
  ColumnLayout,
  Container,
  Header,
  SpaceBetween,
  StatusIndicator,
  Tabs
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
  Survey
} from '@api/types';

// 평가 현황 인터페이스
interface AssessmentStats {
  courseId: string;
  preQuiz: { total: number, completed: number };
  postQuiz: { total: number, completed: number };
  surveys: { total: number, completed: number };
}

const CourseCatalogPage: React.FC = () => {
  const { t, tString } = useTypedTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const { isAuthenticated, checkAuthStatus } = auth;
  const [activeTabId, setActiveTabId] = useState('catalog');
  const [assessmentStats, setAssessmentStats] = useState<Record<string, AssessmentStats>>({});
  const [selectedCourse, setSelectedCourse] = useState<CourseCatalogType | null>(null);
  const [loading, setLoading] = useState(false);

  // 인증 상태 확인
  useEffect(() => {
    const verifyAuthentication = async () => {
      const isAuth = await checkAuthStatus(true); // 강제 새로고침
      if (!isAuth) {
        console.log('인증되지 않은 상태, 로그인 페이지로 이동');
        navigate('/signin');
      }
    };

    verifyAuthentication();
  }, [checkAuthStatus, navigate]);

  // 선택된 과정에 대한 평가 통계 불러오기
  useEffect(() => {
    const fetchAssessmentStats = async () => {
      if (!selectedCourse?.catalogId || !isAuthenticated) return;

      setLoading(true);
      try {
        // API 호출 전 인증 확인
        const isAuth = await checkAuthStatus();
        if (!isAuth) {
          console.log('인증되지 않은 상태, API 호출 중단');
          return;
        }

        // createAuthErrorHandler 사용 (AuthContext.tsx에 추가된 경우)
        const authErrorHandler = createAuthErrorHandler(
          (error) => {
            console.error('인증 오류:', error);
            setLoading(false);
          },
          navigate
        );

        // 1. 퀴즈 데이터 가져오기 - 인증 오류 자동 처리
        const preQuizResult = await withAuthErrorHandling(listQuizzes, auth)({
          filter: {
            expression: 'courseId = :courseId AND quizType = :quizType',
            expressionValues: {
              ':courseId': selectedCourse.catalogId,
              ':quizType': 'pre'
            }
          }
        });

        const postQuizResult = await withAuthErrorHandling(listQuizzes, auth)({
          filter: {
            expression: 'courseId = :courseId AND quizType = :quizType',
            expressionValues: {
              ':courseId': selectedCourse.catalogId,
              ':quizType': 'post'
            }
          }
        });

        // 2. 설문조사 데이터 가져오기
        const surveysResult = await withAuthErrorHandling(listSurveys, auth)({
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

        // 통계 데이터가 없으면 샘플 데이터 사용 (개발용)
        if (Object.keys(stats).length === 0) {
          console.log('샘플 데이터 사용');

          // 샘플 데이터
          const mockStats: Record<string, AssessmentStats> = {
            [selectedCourse.catalogId]: {
              courseId: selectedCourse.catalogId,
              preQuiz: { total: 15, completed: 10 },
              postQuiz: { total: 12, completed: 8 },
              surveys: { total: 20, completed: 15 }
            }
          };

          setAssessmentStats(mockStats);
        }

      } catch (error) {
        console.error('평가 현황 데이터 로드 중 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCourse?.catalogId && isAuthenticated) {
      fetchAssessmentStats();
    }
  }, [selectedCourse, isAuthenticated, checkAuthStatus, auth]);

  const handleCourseSelect = (course: CourseCatalogType) => {
    setSelectedCourse(course);
    setActiveTabId('assessments');
  };

  const additionalActions = (
    <Button
      onClick={() => navigate('/instructor/assessments/quiz-creator')}
    >
      {t('courses.create_assessment')}
    </Button>
  );

  const renderTabs = () => (
    <Tabs
      activeTabId={activeTabId}
      onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
      tabs={[
        {
          id: 'catalog',
          label: t('courses.tabs.catalog'),
          content: (
            <BaseCourseView
              title={t('courses.catalog_title')}
              description={t('courses.catalog_description')}
              isAdminView={true}
              showCreateButton={true}
              createPath="/instructor/courses/create"
              managePath="/instructor/courses/"
              viewPath="/tnc/"
              additionalActions={additionalActions}
              onSelectCourse={handleCourseSelect}
            />
          )
        },
        {
          id: 'assessments',
          label: t('courses.tabs.assessments'),
          content: selectedCourse ? (
            <Container
              header={
                <Header
                  variant="h2"
                  description={selectedCourse.description}
                  actions={
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button onClick={() => navigate(`/instructor/assessments/quiz?courseId=\${selectedCourse.catalogId}`)}>
                        {t('courses.manage_quizzes')}
                      </Button>
                      <Button onClick={() => navigate(`/instructor/assessments/survey?courseId=\${selectedCourse.catalogId}`)}>
                        {t('courses.manage_surveys')}
                      </Button>
                    </SpaceBetween>
                  }
                >
                  {/* course_name 필드 대신 title 필드 사용 */}
                  {selectedCourse.title} - {t('courses.assessment_stats')}
                </Header>
              }
            >
              {loading ? (
                <Box textAlign="center" padding="l">
                  {t('common.loading')}
                </Box>
              ) : assessmentStats && selectedCourse.catalogId && assessmentStats[selectedCourse.catalogId] ? (
                <ColumnLayout columns={3}>
                  <Box variant="awsui-key-label">
                    <h3>{t('courses.pre_quiz_stats')}</h3>
                    <div>
                      <StatusIndicator type="success">
                        {assessmentStats[selectedCourse.catalogId]?.preQuiz?.completed || 0} / {assessmentStats[selectedCourse.catalogId]?.preQuiz?.total || 0} {t('courses.completed')}
                      </StatusIndicator>
                    </div>
                  </Box>
                  <Box variant="awsui-key-label">
                    <h3>{t('courses.post_quiz_stats')}</h3>
                    <div>
                      <StatusIndicator type="info">
                        {assessmentStats[selectedCourse.catalogId]?.postQuiz?.completed || 0} / {assessmentStats[selectedCourse.catalogId]?.postQuiz?.total || 0} {t('courses.completed')}
                      </StatusIndicator>
                    </div>
                  </Box>
                  <Box variant="awsui-key-label">
                    <h3>{t('courses.survey_stats')}</h3>
                    <div>
                      <StatusIndicator type="warning">
                        {assessmentStats[selectedCourse.catalogId]?.surveys?.completed || 0} / {assessmentStats[selectedCourse.catalogId]?.surveys?.total || 0} {t('courses.completed')}
                      </StatusIndicator>
                    </div>
                  </Box>
                </ColumnLayout>
              ) : (
                <Box textAlign="center" padding="l">
                  {t('courses.no_assessment_data')}
                </Box>
              )}
            </Container>
          ) : (
            <Box textAlign="center" padding="l">
              {t('courses.select_course_prompt')}
            </Box>
          )
        }
      ]}
    />
  );

  return (
    <SpaceBetween size="l">
      <Container
        header={
          <Header
            variant="h1"
            description={t('courses.catalog_admin_description')}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => navigate('/instructor/courses/create')}>
                  {t('courses.create_course')}
                </Button>
              </SpaceBetween>
            }
          >
            {t('courses.catalog_management')}
          </Header>
        }
      >
        {renderTabs()}
      </Container>
    </SpaceBetween>
  );
};

export default CourseCatalogPage;