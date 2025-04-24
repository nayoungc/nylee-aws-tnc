import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Header,
  Cards,
  SpaceBetween,
  Box,
  Button,
  Badge,
  Spinner,
  Alert
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useTypedTranslation } from '@utils/i18n-utils';
import { listCourseCatalogs, CourseCatalog } from '@api';
import AWS from 'aws-sdk';
import { AuthRequired } from '../AuthRequired';
import { useAuth } from '../../contexts/AuthContext';

// BaseCourseView.tsx 파일 상단에 인증 상태 관련 변수
let lastAuthCheck = 0;
const AUTH_CHECK_INTERVAL = 30000; // 30초

// 인증 상태 확인 함수
async function checkAuthentication(): Promise<boolean> {
  const now = Date.now();
  // 30초 이내에 이미 확인했다면 중복 확인 방지
  if (now - lastAuthCheck < AUTH_CHECK_INTERVAL) {
    return false; // 인증 실패로 간주 (안전하게)
  }
  
  lastAuthCheck = now;
  
  try {
    await getCurrentUser();
    return true;
  } catch (err) {
    console.log('로그인이 필요합니다');
    return false;
  }
}

// AWS 자격 증명 설정 함수
async function setupAwsCredentials() {
  try {
    // 먼저 인증 확인
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      throw new Error('먼저 로그인이 필요합니다');
    }
    
    const session = await fetchAuthSession();
    if (session.credentials) {
      AWS.config.credentials = new AWS.Credentials({
        accessKeyId: session.credentials.accessKeyId,
        secretAccessKey: session.credentials.secretAccessKey,
        sessionToken: session.credentials.sessionToken
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('자격 증명 설정 실패:', error);
    return false;
  }
}

// 수정된 데이터 로드 함수
async function loadCourseData() {
  console.log('API 호출 시작...');
  
  try {
    // 인증 확인 추가
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      throw new Error('이 기능을 사용하려면 로그인이 필요합니다');
    }
    
    // AWS 자격 증명 설정
    const credentialsSet = await setupAwsCredentials();
    if (!credentialsSet) {
      throw new Error('AWS 자격 증명을 설정할 수 없습니다');
    }
    
    // API 호출하여 데이터 로드
    const result = await listCourseCatalogs();
    
    // 코드가 계속 실행되면 성공
    console.log('데이터 로드 성공');
    return result;
  } catch (error) {
    console.error('API 오류:', error);
    throw new Error('데이터를 불러오는 중 오류가 발생했습니다');
  }
}

// 데이터 매핑 함수 - API 응답을 UI 모델로 변환
const mapToCourseViewModel = (item: any): CourseCatalog => {
  return {
    catalogId: item.catalogId || '',
    version: item.version || 'v1',
    title: item.title || '',
    awsCode: item.awsCode,
    description: item.description,
    category: item.category || '',
    level: item.level,
    duration: item.duration,
    price: item.price,
    currency: item.currency,
    isPublished: item.isPublished !== undefined ? item.isPublished : true,
    publishedDate: item.publishedDate,
    deliveryMethod: item.deliveryMethod || '',
    objectives: item.objectives || [],
    targetAudience: item.targetAudience || [],
    status: item.status || 'ACTIVE',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
};

// BaseCourseView의 props 인터페이스
interface BaseCourseViewProps {
  title: string;
  description: string;
  isReadOnly?: boolean;
  isAdminView?: boolean;
  createPath?: string;
  managePath: string;
  viewPath: string;
  showCreateButton?: boolean;
  showManageButton?: boolean;
  showViewButton?: boolean;
  additionalActions?: React.ReactNode;
  courses?: CourseCatalog[];
  onSelectCourse?: (course: CourseCatalog) => void;
}

export { mapToCourseViewModel, type CourseCatalog };

export const BaseCourseView: React.FC<BaseCourseViewProps> = ({
  title,
  description,
  isReadOnly = false,
  isAdminView = false,
  createPath = '',
  managePath,
  viewPath,
  showCreateButton = false,
  showManageButton = true,
  showViewButton = true,
  additionalActions,
  courses: initialCourses,
  onSelectCourse
}) => {
  const navigate = useNavigate();
  const { t, tString } = useTypedTranslation();
  const [courses, setCourses] = useState<CourseCatalog[]>(initialCourses || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  const navigateToCreateCourse = useCallback(() => {
    if (createPath) navigate(createPath);
  }, [navigate, createPath]);

  // 인증 상태 확인
  useEffect(() => {
    async function checkAuth() {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    }
    
    checkAuth();
  }, []);

  // 데이터 로드
  useEffect(() => {
    if (initialCourses && initialCourses.length > 0) {
      setLoading(false);
      return;
    }

    // 인증 상태 확인이 완료된 후에만 진행
    if (!authChecked) {
      return;
    }

    // 인증되지 않은 상태면 API 호출 없이 종료
    if (!isAuthenticated) {
      setLoading(false);
      setError(t('courses.errors.authentication'));
      
      if (process.env.NODE_ENV === 'development') {
        setCourses([
          mapToCourseViewModel({ 
            catalogId: '1', 
            title: '개발 환경 - 샘플 과정', 
            description: '로그인하지 않았을 때 표시되는 샘플 데이터입니다.',
            level: '입문',
            category: '기타',
            duration: 0,
            status: 'ACTIVE',
          })
        ]);
      }
      return;
    }

    const checkAuthAndFetchCourses = async () => {
      setLoading(true);
      setError(null);
      
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setError(t('courses.errors.timeout'));
        
        if (process.env.NODE_ENV === 'development') {
          setCourses([
            mapToCourseViewModel({ 
              catalogId: '1', 
              title: '타임아웃 - 샘플 과정', 
              description: '타임아웃으로 인한 샘플 데이터입니다.',
              level: '입문',
              category: '기타',
              duration: 0,
              status: 'ACTIVE',
            })
          ]);
        }
      }, 15000);
      
      try {
        // AWS 자격 증명 설정 추가
        await setupAwsCredentials();
        
        console.log('API 호출 시작...');
        
        try {
          // 새로운 API 구조 사용
          const result = await listCourseCatalogs();
          
          console.log('API 응답:', result.data);
          
          if (result.data && Array.isArray(result.data)) {
            const mappedItems = result.data.map(mapToCourseViewModel);
            setCourses(mappedItems);
          } else {
            setCourses([]);
          }
          
          clearTimeout(timeoutId);
        } catch (apiError) {
          console.error('API 오류:', apiError);
          clearTimeout(timeoutId);
          throw new Error('데이터를 불러오는 중 오류가 발생했습니다');
        }
      } catch (error: any) {
        console.error('Course load error:', error);
        clearTimeout(timeoutId);
        
        if (error.name === 'UserUnAuthenticatedException' || 
            error.message?.includes('인증')) {
          setError(t('courses.errors.authentication'));
          setIsAuthenticated(false);
        } else {
          setError(t('courses.errors.load_message'));
        }
        
        if (process.env.NODE_ENV === 'development') {
          setCourses([
            mapToCourseViewModel({
              catalogId: '1',
              version: 'v1',
              title: 'AWS Cloud Practitioner Essentials',
              description: 'Learn the fundamentals of AWS Cloud',
              level: 'Beginner',
              category: 'Cloud',
              duration: 8,
              status: 'ACTIVE', 
            }),
            mapToCourseViewModel({ 
              catalogId: '2', 
              version: 'v1',
              title: 'AWS Solutions Architect Associate',
              description: 'Learn advanced AWS architecture concepts',
              level: 'Intermediate',
              category: 'Architecture',
              duration: 24,
              status: 'ACTIVE', 
            })
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      checkAuthAndFetchCourses();
    }
  }, [t, initialCourses, authChecked, isAuthenticated]);

  const getStatusColor = (status?: string): "green" | "blue" | "grey" => {
    if (!status) return 'grey';
    switch(status.toUpperCase()) {
      case 'ACTIVE': return 'green';
      case 'COMPLETED': return 'blue';
      default: return 'grey';
    }
  };

  // 로딩 중 UI
  if (loading) {
    return (
      <Box padding="l" textAlign="center">
        <Spinner size="large" />
        <Box padding="s">{t('courses.loading')}</Box>
      </Box>
    );
  }

  // 인증되지 않은 상태 UI
  if (!isAuthenticated && authChecked) {
    return (
      <Container>
        <Alert type="info" header={t('courses.auth_required') || "로그인 필요"}>
          <SpaceBetween direction="vertical" size="m">
            <div>{t('courses.please_login') || "이 기능을 사용하려면 로그인이 필요합니다."}</div>
            <Button variant="primary" onClick={() => navigate('/login')}>
              {t('courses.login') || "로그인하기"}
            </Button>
          </SpaceBetween>
        </Alert>
      </Container>
    );
  }

  const renderActionButtons = (item: CourseCatalog) => {
    return (
      <SpaceBetween direction="horizontal" size="xs">
        {onSelectCourse && (
          <Button onClick={() => onSelectCourse(item)}>
            {t('courses.view_stats')}
          </Button>
        )}
        
        {isAdminView && showManageButton && (
          <Button onClick={() => navigate(`\${managePath}\${item.catalogId}`)}>
            {t('courses.manage')}
          </Button>
        )}
        
        {showViewButton && (
          <Button iconName="external" onClick={() => navigate(`\${viewPath}\${item.catalogId}`)}>
            {t('courses.view_student')}
          </Button>
        )}
        
        {!isReadOnly && (
          <Button variant="normal">
            {t('courses.enroll')}
          </Button>
        )}
      </SpaceBetween>
    );
  };

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          description={description}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              {additionalActions}
              
              {isAdminView && showCreateButton && createPath && (
                <Button variant="primary" onClick={navigateToCreateCourse}>
                  {t('courses.create_button')}
                </Button>
              )}
            </SpaceBetween>
          }
        >
          {title}
        </Header>
        
        {error && (
          <Box color="text-status-error">
            <span role="img" aria-label="error">⚠️</span> {error}
          </Box>
        )}
        
        <Cards
          cardDefinition={{
            header: item => (
              <SpaceBetween size="xxs">
                <div>{item.title}</div>
                <Badge color={getStatusColor(item.status)}>
                  {item.status || 'ACTIVE'}
                </Badge>
              </SpaceBetween>
            ),
            sections: [
              {
                id: "description",
                content: item => item.description || t('courses.no_description')
              },
              {
                id: "details",
                header: t('courses.details'),
                content: item => (
                  <SpaceBetween size="xs">
                    <div>{t('courses.level')}: {item.level || t('courses.not_specified')}</div>
                    <div>{t('courses.duration')}: {item.duration ? `\${item.duration} \${t('courses.hours')}` : t('courses.not_specified')}</div>
                    {item.deliveryMethod && <div>{t('courses.delivery')}: {item.deliveryMethod}</div>}
                    {item.version && <div>{t('courses.version')}: {item.version}</div>}
                  </SpaceBetween>
                )
              },
              {
                id: "actions",
                content: renderActionButtons
              }
            ]
          }}
          cardsPerRow={[
            { cards: 1 },
            { minWidth: 500, cards: 2 }
          ]}
          items={courses}
          loadingText={tString('courses.loading')}
          empty={
            <Box textAlign="center" color="inherit">
              <b>{t('courses.empty.title')}</b>
              <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                {t('courses.empty.description')}
              </Box>
              {isAdminView && showCreateButton && createPath && (
                <Button onClick={navigateToCreateCourse}>
                  {t('courses.create_button')}
                </Button>
              )}
            </Box>
          }
        />
      </SpaceBetween>
    </Container>
  );
};