// src/pages/instructor/courses/CourseCatalog.tsx
import { listQuizzes, listSurveys } from '@api';
import { useAuth, withAuthErrorHandling } from '@contexts/AuthContext';

import {
  Box,
  Button,
  ColumnLayout,
  Container,
  Header,
  SpaceBetween,
  StatusIndicator,
  Tabs,
  Table,
  TextFilter,
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
  Survey
} from '@api/types';

// Amplify Gen 2 관련 임포트
import { fetchAuthSession } from 'aws-amplify/auth';
import { get } from 'aws-amplify/api';
// GraphQL 쿼리와 API 직접 접근 방식 모두 사용
import { generateClient } from 'aws-amplify/api';

// Gen 2 API 클라이언트 생성
const client = generateClient();

// 평가 현황 인터페이스
interface AssessmentStats {
  courseId: string;
  preQuiz: { total: number, completed: number };
  postQuiz: { total: number, completed: number };
  surveys: { total: number, completed: number };
}

// Tnc-CourseCatalog 테이블 항목 인터페이스
interface CourseCatalogItem {
  catalogId: string;
  title: string;
  version: string;
  awsCode?: string;
  description?: string;
  level?: string;
  isPublished?: boolean;
  [key: string]: any;
}

// GraphQL 쿼리 응답 타입 정의
interface ListCourseCatalogsResponse {
  listCourseCatalogs?: {
    items: CourseCatalogItem[];
  };
}

// Gen 2 방식의 Catalog 조회 함수 - REST API 방식으로 수정
const searchCourseCatalog = async (searchTerm = ''): Promise<CourseCatalogItem[]> => {
  try {
    // 인증 세션 확인
    const session = await fetchAuthSession({ forceRefresh: true });
    if (!session.tokens) {
      throw new Error('인증이 필요합니다');
    }

    // 1. REST API 방식으로 접근 (Gen 2 방식)
    try {
      let apiPath = '/courses';
      
      // 검색어가 있는 경우 쿼리 파라미터로 추가
      if (searchTerm && searchTerm.length >= 3) {
        apiPath += `?search=\${encodeURIComponent(searchTerm)}`;
      }

      const restResponse = await get({
        apiName: 'CoursesApi',
        path: apiPath
      }).response;

      // 응답 처리
      const responseData = await restResponse.body.json();
      
      if (Array.isArray(responseData)) {
        console.log(`API Gateway를 통해 \${responseData.length}개 과정 조회 성공`);
        return responseData as CourseCatalogItem[];
      }
    } catch (restError) {
      console.warn('REST API 호출 실패:', restError);
      // REST API 실패 시 GraphQL로 계속 진행
    }

    // 2. GraphQL API 시도
    console.log('GraphQL API로 과정 조회 시도');
    
    // GraphQL 쿼리문
    const query = /* GraphQL */ `
      query ListCourseCatalogs(\$limit: Int) {
        listCourseCatalogs(limit: \$limit) {
          items {
            catalogId
            title
            version
            awsCode
            description
            level
            isPublished
            duration
            price
            currency
          }
        }
      }
    `;
    
    // GraphQL 변수
    const variables = { limit: 100 };
    
    // GraphQL 호출
    const graphqlResponse = await client.graphql({
      query,
      variables
    });
    
    // 타입 안전하게 접근 - 타입 가드 사용
    // 'data' 속성 존재 여부 확인
    if ('data' in graphqlResponse) {
      const responseData = graphqlResponse.data as ListCourseCatalogsResponse;
      const items = responseData?.listCourseCatalogs?.items || [];
      
      console.log(`GraphQL API로 \${items.length}개 과정 조회 성공`);
      return items;
    } else {
      console.log('GraphQL 응답에 data 속성이 없습니다');
      return [];
    }

  } catch (error) {
    console.error('CourseCatalog 검색 실패:', error);

    // 개발 환경에서는 샘플 데이터 반환
    if (process.env.NODE_ENV === 'development') {
      console.log('개발 환경에서 샘플 데이터 사용');
      return [
        {
          catalogId: '1',
          title: 'AWS Cloud Practitioner',
          version: '1.0',
          awsCode: 'AWS-CP',
          description: 'Fundamental AWS concepts',
          level: 'BEGINNER',
          isPublished: true
        },
        {
          catalogId: '2',
          title: 'AWS Solutions Architect',
          version: '2.0',
          awsCode: 'AWS-SAA',
          description: 'Advanced architecture patterns',
          level: 'ADVANCED',
          isPublished: true
        }
      ];
    }

    throw error;
  }
};

const CourseCatalogPage: React.FC = () => {
  const { t, tString } = useTypedTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const { isAuthenticated, checkAuthStatus } = auth;
  const [activeTabId, setActiveTabId] = useState('catalog');
  const [assessmentStats, setAssessmentStats] = useState<Record<string, AssessmentStats>>({});
  const [selectedCourse, setSelectedCourse] = useState<CourseCatalogType | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Tnc-CourseCatalog 테이블 데이터를 위한 상태 추가
  const [catalogCourses, setCatalogCourses] = useState<CourseCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);

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
  
  // Tnc-CourseCatalog 테이블 데이터 로드 함수 - Gen 2 방식
  const fetchCourseCatalog = async () => {
    setCatalogLoading(true);
    try {
      // 인증 확인
      const isAuth = await checkAuthStatus();
      if (!isAuth) {
        console.log('인증되지 않은 상태, API 호출 중단');
        return;
      }
      
      const courses = await searchCourseCatalog(filterText);
      setCatalogCourses(courses);
    } catch (error) {
      console.error('과정 카탈로그 로드 실패:', error);
    } finally {
      setCatalogLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 Tnc-CourseCatalog 테이블 데이터 로드
  useEffect(() => {
    if (isAuthenticated && activeTabId === 'direct-catalog') {
      fetchCourseCatalog();
    }
  }, [isAuthenticated, activeTabId]);

  // 검색어 변경 시 데이터 새로고침 - 디바운스 처리
  useEffect(() => {
    if (activeTabId !== 'direct-catalog') return;
    
    const handler = setTimeout(() => {
      if (isAuthenticated) {
        fetchCourseCatalog();
      }
    }, 500); // 500ms 디바운스
    
    return () => clearTimeout(handler);
  }, [filterText, isAuthenticated, activeTabId]);

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

        // 퀴즈 데이터 가져오기 - 인증 오류 자동 처리
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

        // 설문조사 데이터 가져오기
        const surveysResult = await withAuthErrorHandling(listSurveys, auth)({
          filter: {
            expression: 'courseId = :courseId',
            expressionValues: {
              ':courseId': selectedCourse.catalogId
            }
          }
        });

        // 통계 계산 및 상태 업데이트
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
  
  // Tnc-CourseCatalog 테이블에서 선택된 항목 처리
  const handleCatalogCourseSelect = (course: CourseCatalogItem) => {
    setSelectedCourse(course as unknown as CourseCatalogType);
    setActiveTabId('assessments');
  };

  const additionalActions = (
    <Button
      onClick={() => navigate('/instructor/assessments/quiz-creator')}
    >
      {t('courses.create_assessment')}
    </Button>
  );
  
  // 페이지당 아이템 수
  const PAGE_SIZE = 10;
  const filteredCourses = catalogCourses;
  const paginatedCourses = filteredCourses.slice(
    (currentPageIndex - 1) * PAGE_SIZE,
    currentPageIndex * PAGE_SIZE
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
          id: 'direct-catalog', // 직접 Tnc-CourseCatalog 테이블 검색 탭
          label: "직접 과정 검색",
          content: (
            <Box padding="m">
              <SpaceBetween size="l">
                <TextFilter
                  filteringText={filterText}
                  filteringPlaceholder="과정 검색..."
                  onChange={({ detail }) => setFilterText(detail.filteringText)}
                />
                
                <Table
                  loading={catalogLoading}
                  loadingText="과정 데이터 로드 중..."
                  items={paginatedCourses}
                  columnDefinitions={[
                    {
                      id: 'awsCode',
                      header: '과정 코드',
                      cell: item => item.awsCode || '-',
                    },
                    {
                      id: 'title',
                      header: '제목',
                      cell: item => item.title || '-',
                    },
                    {
                      id: 'version',
                      header: '버전',
                      cell: item => item.version || '-',
                    },
                    {
                      id: 'level',
                      header: '수준',
                      cell: item => item.level || '-',
                    },
                    {
                      id: 'actions',
                      header: '작업',
                      cell: item => (
                        <SpaceBetween direction="horizontal" size="xs">
                          <Button onClick={() => handleCatalogCourseSelect(item)}>선택</Button>
                          <Button onClick={() => navigate(`/instructor/courses/\${item.catalogId}`)}>
                            관리
                          </Button>
                        </SpaceBetween>
                      ),
                    },
                  ]}
                  empty={
                    <Box textAlign="center" color="inherit">
                      <b>과정이 없습니다</b>
                      <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                        새 과정을 생성하거나 다른 검색어를 사용해보세요.
                      </Box>
                      <Button onClick={fetchCourseCatalog}>새로고침</Button>
                    </Box>
                  }
                  onRowClick={({ detail }) => handleCatalogCourseSelect(detail.item)}
                />
                
                <Pagination
                  currentPageIndex={currentPageIndex}
                  pagesCount={Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE))}
                  onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
                />
              </SpaceBetween>
            </Box>
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
                <Button onClick={fetchCourseCatalog}>
                  카탈로그 새로고침
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