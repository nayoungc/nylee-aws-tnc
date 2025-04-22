// src/pages/instructor/courses/CourseCatalog.tsx
import React, { useState, useEffect } from 'react';
import {
  BaseCourseView,
  CourseCatalog as CourseCatalogType
} from '@components/courses/BaseCourseView';
import {
  Container,
  Header,
  SpaceBetween,
  Button,
  Tabs,
  ColumnLayout,
  Box,
  StatusIndicator
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '@utils/i18n-utils';
// 새로운 API 구조에 맞게 임포트 경로 변경
import { listQuizzes, listSurveys } from '@api';

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
  const [activeTabId, setActiveTabId] = useState('catalog');
  const [assessmentStats, setAssessmentStats] = useState<Record<string, AssessmentStats>>({});
  const [selectedCourse, setSelectedCourse] = useState<CourseCatalogType | null>(null);

  useEffect(() => {
    const fetchAssessmentStats = async () => {
      if (!selectedCourse?.catalogId) return;

      try {
        // 1. 퀴즈 데이터 가져오기 (DynamoDB 방식)
        const preQuizResult = await listQuizzes({
          filter: {
            expression: 'courseId = :courseId AND quizType = :quizType',
            expressionValues: {
              ':courseId': selectedCourse.catalogId,
              ':quizType': 'pre'
            }
          }
        });

        const postQuizResult = await listQuizzes({
          filter: {
            expression: 'courseId = :courseId AND quizType = :quizType',
            expressionValues: {
              ':courseId': selectedCourse.catalogId,
              ':quizType': 'post'
            }
          }
        });

        // 2. 설문조사 데이터 가져오기
        const surveysResult = await listSurveys({
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

        // 실제 구현에서는 위의 API 호출로 데이터를 가져와서 통계를 계산하면 됩니다
        // 현재는 샘플 데이터 사용
        const mockStats: Record<string, AssessmentStats> = {
          '1': {
            courseId: '1',
            preQuiz: { total: 15, completed: 10 },
            postQuiz: { total: 12, completed: 8 },
            surveys: { total: 20, completed: 15 }
          },
          '2': {
            courseId: '2',
            preQuiz: { total: 25, completed: 18 },
            postQuiz: { total: 22, completed: 15 },
            surveys: { total: 30, completed: 25 }
          }
        };

      } catch (error) {
        console.error('평가 현황 데이터 로드 중 오류:', error);
      }
    };

    if (selectedCourse?.catalogId) {
      fetchAssessmentStats();
    }
  }, [selectedCourse]);

  // useEffect(() => {
  //   const fetchAssessmentStats = async () => {
  //     try {
  //       // Gen 2 방식으로 API 호출
  //       // 실제 API를 구현할 경우 아래와 같이 사용
  //       // const preQuizResult = await listQuizzes({ filter: { 
  //       //   courseId: { eq: selectedCourse?.catalogId },
  //       //   quizType: { eq: 'pre' }
  //       // }});
  //       // 
  //       // const postQuizResult = await listQuizzes({ filter: { 
  //       //   courseId: { eq: selectedCourse?.catalogId },
  //       //   quizType: { eq: 'post' }
  //       // }});
  //       // 
  //       // const surveysResult = await listSurveys({ filter: { 
  //       //   courseId: { eq: selectedCourse?.catalogId }
  //       // }});

  //       // 실제 구현에서는 위의 API 호출로 데이터를 가져와서 통계를 계산하면 됩니다
  //       // 현재는 샘플 데이터 사용
  //       const mockStats: Record<string, AssessmentStats> = {
  //         '1': {
  //           courseId: '1',
  //           preQuiz: { total: 15, completed: 10 },
  //           postQuiz: { total: 12, completed: 8 },
  //           surveys: { total: 20, completed: 15 }
  //         },
  //         '2': {
  //           courseId: '2',
  //           preQuiz: { total: 25, completed: 18 },
  //           postQuiz: { total: 22, completed: 15 },
  //           surveys: { total: 30, completed: 25 }
  //         }
  //       };

  //       setAssessmentStats(mockStats);
  //     } catch (error) {
  //       console.error('평가 현황 데이터 로드 중 오류:', error);
  //     }
  //   };

  //   fetchAssessmentStats();
  // }, []);

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
              {assessmentStats && selectedCourse.catalogId && assessmentStats[selectedCourse.catalogId] ? (
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