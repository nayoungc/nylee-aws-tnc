// src/AppRoutes.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  fetchAuthSession,
  getCurrentUser,
  fetchUserAttributes,
  signOut
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useTranslation } from 'react-i18next';

// 인증 관련 컴포넌트
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ConfirmSignUp from './components/ConfirmSignUp';
import ForgotPassword from './components/ForgotPassword';
import NewPassword from './components/NewPassword';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';

// 강사용 페이지 컴포넌트
import Dashboard from './pages/instructor/Dashboard';
import CoursesManagement from './pages/instructor/CoursesManagement';
import CourseCreation from './pages/instructor/CourseCreation';
import QuizManagement from './pages/instructor/QuizManagement';
import QuizCreator from './pages/instructor/QuizCreator';
import SurveyManagement from './pages/instructor/SurveyManagement';
import SurveyCreator from './pages/instructor/SurveyCreator';
import ReportGenerator from './pages/instructor/ReportGenerator';
import AdminPage from './pages/admin/AdminPage';
import CourseCatalog from './pages/admin/CourseCatalogTab'; 


// 교육생용 페이지 컴포넌트
import SurveyPage from './pages/courses/SurveyPage';
import PreQuizPage from './pages/courses/PreQuizPage';
import PostQuizPage from './pages/courses/PostQuizPage';
import CourseHome from './pages/courses/CourseHome'; 


// 레이아웃 컴포넌트
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// 리디렉션을 위한 별도 컴포넌트들
const StudentHomeRedirect = () => {
  const { courseId } = useParams();
  return <Navigate to={`/course/\${courseId}`} replace />;
};

const StudentPathRedirect = () => {
  const { courseId, path } = useParams();
  return <Navigate to={`/course/\${courseId}/\${path}`} replace />;
};

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userAttributes, setUserAttributes] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  
  // 인증 요청 중복 방지 ref
  const authCheckInProgress = useRef(false);
  // 인증 실패 횟수 카운터
  const authFailCount = useRef(0);
  // 인증 시도 사이 지연 시간
  const authRetryDelay = useRef(1000); // 초기 1초, 실패에 따라 증가
  // 마지막 성공적인 속성 가져오기 시간
  const lastSuccessfulFetch = useRef(0);
  // 캐시 수명 (15분)
  const CACHE_TTL = 15 * 60 * 1000;

  // 인증 상태 확인 함수
  const checkAuthState = useCallback(async () => {
    // 이미 인증 체크 중이면 중복 요청 방지
    if (authCheckInProgress.current) return;
    
    // 세션 스토리지에서 사용자 속성 확인
    const cachedData = sessionStorage.getItem('userAttributes');
    const timestamp = sessionStorage.getItem('userAttributesTimestamp');
    
    // 캐시가 유효한 경우 사용
    if (cachedData && timestamp && (Date.now() - parseInt(timestamp) < CACHE_TTL)) {
      try {
        const parsedData = JSON.parse(cachedData);
        setUserAttributes(parsedData);
        setAuthenticated(true);
        setIsLoading(false);
        return;
      } catch (e) {
        // 캐시 데이터 파싱 오류는 무시하고 계속 진행
      }
    }
    
    // 재시도 블록 확인
    const retryBlock = sessionStorage.getItem('userAttributesRetryBlock');
    if (retryBlock && parseInt(retryBlock) > Date.now()) {
      console.log('재시도 블록 활성화 중. 요청을 건너뜁니다.');
      // 인증 상태만 확인하고, 속성 가져오기는 건너뜀
      try {
        const session = await fetchAuthSession();
        if (session.tokens) {
          setAuthenticated(true);
        }
      } catch (error) {
        setAuthenticated(false);
      }
      setIsLoading(false);
      return;
    }
    
    authCheckInProgress.current = true;
    setIsLoading(true);

    try {
      // 현재 사용자 가져오기
      const user = await getCurrentUser();

      try {
        // 속성 가져오기 시도 (마지막 성공 후 15분 경과 시만)
        if ((Date.now() - lastSuccessfulFetch.current > CACHE_TTL) && 
            authFailCount.current < 3) { // 연속 3회 이상 실패하면 시도하지 않음
          
          const attributes = await fetchUserAttributes();
          setUserAttributes(attributes);
          
          // 성공하면 저장 및 카운터 초기화
          sessionStorage.setItem('userAttributes', JSON.stringify(attributes));
          sessionStorage.setItem('userAttributesTimestamp', Date.now().toString());
          sessionStorage.removeItem('userAttributesFailCount');
          
          // 성공 기록
          lastSuccessfulFetch.current = Date.now();
          authFailCount.current = 0;
          authRetryDelay.current = 1000; // 지연 시간 초기화
        }
      } catch (error) {
        // 타입 캐스팅 사용
        const err = error as Error;
        console.warn('속성 가져오기 실패:', err);
        authFailCount.current++;
        
        // 실패 횟수 저장
        const failCount = parseInt(sessionStorage.getItem('userAttributesFailCount') || '0') + 1;
        sessionStorage.setItem('userAttributesFailCount', failCount.toString());
        
        // 3회 이상 실패 시 30분 동안 재시도 차단
        if (failCount >= 3) {
          const blockUntil = Date.now() + 30 * 60 * 1000; // 30분
          sessionStorage.setItem('userAttributesRetryBlock', blockUntil.toString());
          console.log(`최대 재시도 횟수 초과. \${new Date(blockUntil).toLocaleTimeString()}까지 재시도하지 않습니다.`);
        }
        
        // 지수 백오프 (실패할수록 대기 시간 증가)
        authRetryDelay.current = Math.min(authRetryDelay.current * 2, 30000); // 최대 30초
        
        // 안전하게 오류 메시지 확인
        const errorMessage = String(error);
        
        // Rate Exceeded 오류시 추가 처리
        if (errorMessage.includes('TooManyRequestsException')) {
          console.log('요청 제한 초과, 잠시 후 다시 시도합니다');
        }
      }

      // 세션 확인
      const session = await fetchAuthSession();
      if (!session.tokens) {
        throw new Error('No valid tokens');
      }

      setAuthenticated(true);
    } catch (error) {
      console.log('사용자 미인증:', error);
      setAuthenticated(false);
      setUserAttributes(null);

      // 공개 경로 목록
      const publicPaths = [
        '/signin', '/signup', '/confirm-signup', '/forgot-password', 
        '/new-password', '/courses'
      ];
      
      // 공개 경로 패턴 (시작 부분만 체크)
      const publicPathPatterns = ['/course/'];
      
      // 현재 경로가 공개 경로인지 체크
      const isPublicPath = 
        publicPaths.includes(location.pathname) || 
        publicPathPatterns.some(pattern => location.pathname.startsWith(pattern));
      
      // 보호된 경로인 경우만 리디렉션
      if (!isPublicPath) {
        // 리디렉션 중복 방지
        const currentPath = location.pathname;
        if (currentPath !== '/signin') {
          navigate('/signin');
        }
      }
    } finally {
      setIsLoading(false);
      
      // 다음 인증 체크 호출을 허용하기 전에 지연
      setTimeout(() => {
        authCheckInProgress.current = false;
      }, authRetryDelay.current);
    }
  }, [navigate, location.pathname]);

  // 초기 인증 상태 확인 - 의존성 배열에서 location.pathname 제거
  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  // Amplify Auth Hub 이벤트 리스너
  useEffect(() => {
    const listener = Hub.listen('auth', ({ payload }) => {
      console.log('Auth 이벤트:', payload.event);

      switch (payload.event) {
        case 'signedIn':
          if (!authenticated) checkAuthState();
          break;
        case 'signedOut':
          setAuthenticated(false);
          setUserAttributes(null);
          sessionStorage.removeItem('userAttributes');
          sessionStorage.removeItem('userAttributesTimestamp');
          // 이미 로그인 페이지가 아닌 경우에만 리디렉션
          if (location.pathname !== '/signin') {
            navigate('/signin');
          }
          break;
        case 'tokenRefresh_failure':
          setAuthenticated(false);
          setUserAttributes(null);
          sessionStorage.removeItem('userAttributes');
          // 이미 로그인 페이지가 아닌 경우에만 리디렉션
          if (location.pathname !== '/signin') {
            navigate('/signin', {
              state: { message: t('auth.session_expired') || '세션이 만료되었습니다.' }
            });
          }
          break;
      }
    });

    return () => listener();
  }, [checkAuthState, navigate, t, authenticated, location.pathname]);

  // 로딩 중 화면
  if (isLoading && authenticated === null) {
    return <LoadingScreen message={t('common.loading') || '로딩 중...'} />;
  }

  // 강사 전용 라우트를 위한 래퍼 컴포넌트
  const InstructorRoute = ({ children }: { children: React.ReactNode }) => (
    <ProtectedRoute
      authenticated={authenticated}
      redirectPath="/signin"
      requiredRole="instructor"
      userAttributes={userAttributes}
    >
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );

  return (
    <Routes>
      {/* 인증 페이지 라우트 - AuthLayout을 각 라우트의 element 안에 포함시켜 children 전달 */}
      <Route path="/signin" element={
        authenticated ? <Navigate to="/" /> : <AuthLayout><SignIn /></AuthLayout>
      } />
      <Route path="/signup" element={
        authenticated ? <Navigate to="/" /> : <AuthLayout><SignUp /></AuthLayout>
      } />
      <Route path="/confirm-signup" element={
        authenticated ? <Navigate to="/" /> : <AuthLayout><ConfirmSignUp /></AuthLayout>
      } />
      <Route path="/forgot-password" element={
        authenticated ? <Navigate to="/" /> : <AuthLayout><ForgotPassword /></AuthLayout>
      } />
      <Route path="/new-password" element={
        authenticated ? <Navigate to="/" /> : <AuthLayout><NewPassword /></AuthLayout>
      } />

      {/* 루트 리디렉션 */}      
      <Route
        path="/"
        element={
          authenticated ? (
            userAttributes?.profile === 'instructor' || userAttributes?.profile === 'admin' ? (
              <Navigate to="/instructor/dashboard" />
            ) : (
              <Navigate to="/courses" />
            )
          ) : (
            <Navigate to="/signin" />
          )
        }
      />
      {/* 공개 접근 가능한 과정 페이지 */}
      <Route path="/courses" element={
        <ProtectedRoute
          authenticated={authenticated}
          redirectPath="/signin"
          requiredRole="student" // 또는 권한 체크를 하지 않도록 수정
          userAttributes={userAttributes}
        >
          <MainLayout><CourseHome /></MainLayout>
        </ProtectedRoute>
      } />
  
      
      {/* 공개 접근 가능한 과정 페이지 */}
      <Route path="/courses" element={<MainLayout><CourseHome /></MainLayout>} />
      
      {/* 통합된 과정 경로 - 상세 및 교육생 기능 */}
      <Route path="/course/:courseId">
        {/* 과정 홈페이지 */}
        <Route index element={<MainLayout><CourseHome /></MainLayout>} />
        {/* 교육생 평가 페이지 */}
        <Route path="survey" element={<MainLayout><SurveyPage /></MainLayout>} />
        <Route path="quiz" element={<MainLayout><PreQuizPage /></MainLayout>} />
      </Route>

      {/* 강사용 페이지 (URL 구조 변경) */}
      <Route path="/instructor">
        {/* 대시보드 */}
        <Route path="dashboard" element={<InstructorRoute><Dashboard /></InstructorRoute>} />
        
        {/* 과정 관리 */}
        <Route path="courses" element={<InstructorRoute><CoursesManagement /></InstructorRoute>} />
        <Route path="courses/create" element={<InstructorRoute><CourseCreation /></InstructorRoute>} />
        <Route path="courses/catalog" element={<InstructorRoute><CourseCatalog /></InstructorRoute>} />

        {/* 평가 도구 관리 */}
        <Route path="assessments">
          <Route path="quiz" element={<InstructorRoute><QuizManagement /></InstructorRoute>} />
          <Route path="quiz-creator" element={<InstructorRoute><QuizCreator /></InstructorRoute>} />
          <Route path="survey" element={<InstructorRoute><SurveyManagement /></InstructorRoute>} />
          <Route path="survey-creator" element={<InstructorRoute><SurveyCreator /></InstructorRoute>} />
        </Route>

        {/* 분석 및 보고서 */}
        <Route path="analytics">
          <Route path="comparison" element={
            <InstructorRoute>
              <div>사전/사후 비교 분석</div>
            </InstructorRoute>
          } />
          <Route path="reports" element={
            <InstructorRoute>
              <ReportGenerator />
            </InstructorRoute>
          } />
          <Route path="insights" element={
            <InstructorRoute>
              <div>과정별 인사이트</div>
            </InstructorRoute>
          } />
        </Route>
      </Route>

      {/* 관리자 라우트 */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            authenticated={authenticated}
            redirectPath="/signin"
            requiredRole="admin"
            userAttributes={userAttributes}
          >
            <MainLayout>
              <AdminPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 이전 URL 경로 리디렉션 - 단순 경로는 직접 처리 */}
      <Route path="/dashboard" element={<Navigate to="/instructor/dashboard" replace />} />
      <Route path="/courses/my-courses" element={<Navigate to="/instructor/courses" replace />} />
      <Route path="/assessments/survey" element={<Navigate to="/instructor/assessments/survey" replace />} />
      
      {/* 교육생 페이지 리디렉션 - 별도 컴포넌트 사용 */}
      <Route path="/student/:courseId" element={<StudentHomeRedirect />} />
      <Route path="/student/:courseId/:path" element={<StudentPathRedirect />} />

      {/* 404 라우트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;