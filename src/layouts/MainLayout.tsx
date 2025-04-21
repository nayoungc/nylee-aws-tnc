import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, signOut, fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import { useTypedTranslation } from '@utils/i18n-utils';

import {
  AppLayout,
  TopNavigation,
  SideNavigation,
  BreadcrumbGroup,
  Button,
  SpaceBetween,
  Icon,
  Badge,
  Container,
  Modal,
  Box,
  Header
} from '@cloudscape-design/components';

// Cloudscape 컴포넌트들의 타입
import { SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import { TopNavigationProps } from '@cloudscape-design/components/top-navigation';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * 애플리케이션의 주요 레이아웃 컴포넌트
 * 
 * 상단 탐색, 사이드 탐색, 헤더 및 콘텐츠 영역을 포함한 일관된 레이아웃을 제공합니다.
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, tString, i18n } = useTypedTranslation();
  const [loading, setLoading] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [userAttributes, setUserAttributes] = useState<any>(null);
  const [username, setUsername] = useState<string>('');

  // 사용자 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 현재 세션 확인
        const session = await fetchAuthSession();
        if (session.tokens) {
          setAuthenticated(true);
          
          // 사용자 속성 가져오기
          try {
            const user = await getCurrentUser();
            setUsername(user.username);
            
            const attributes = await fetchUserAttributes();
            setUserAttributes(attributes);
          } catch (err) {
            console.error('사용자 속성 가져오기 실패:', err);
          }
        } else {
          setAuthenticated(false);
          setUserAttributes(null);
        }
      } catch (err) {
        setAuthenticated(false);
        setUserAttributes(null);
      }
    };
    
    checkAuth();
  }, []);

  // 로그아웃 처리
  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setAuthenticated(false);
      setUserAttributes(null);
      navigate('/signin');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      setLoading(false);
      setShowSignOutModal(false);
    }
  };

  // 사용자 역할 확인 (기본값: student)
  const userRole = useMemo(() => {
    return userAttributes?.profile || 'student';
  }, [userAttributes]);

  // 사이드 메뉴 아이템 결정 - 모든 사용자에게 퍼블릭 메뉴 표시
  const sideNavigationItems: SideNavigationProps.Item[] = useMemo(() => {
    // 기본 공개 메뉴 (모든 사용자에게 표시)
    const publicMenuItems: SideNavigationProps.Item[] = [
      { type: 'link', text: t('nav.course_list'), href: '/tnc' }
    ];
    
    // 인증된 사용자만을 위한 추가 메뉴 준비
    if (!authenticated) {
      return publicMenuItems;
    }

    // 강사 또는 관리자인 경우 추가 메뉴
    if (userRole === 'instructor' || userRole === 'admin') {
      const instructorItems: SideNavigationProps.Item[] = [
        { type: 'link', text: t('nav.dashboard'), href: '/instructor/dashboard' },
        { type: 'link', text: t('nav.course_management'), href: '/instructor/courses' },
        {
          type: 'section',
          text: t('nav.assessments'),
          items: [
            { type: 'link', text: t('nav.quiz_management'), href: '/instructor/assessments/quiz' },
            { type: 'link', text: t('nav.survey_management'), href: '/instructor/assessments/survey' }
          ]
        },
        {
          type: 'section',
          text: t('nav.analytics'),
          items: [
            { type: 'link', text: t('nav.reports'), href: '/instructor/analytics/reports' },
            { type: 'link', text: t('nav.insights'), href: '/instructor/analytics/insights' },
            {
              type: 'link',
              text: t('nav.comparison'),
              href: '/instructor/analytics/comparison',
              info: <Badge color="blue">New</Badge>
            }
          ]
        }
      ];

      // 관리자 전용 메뉴
      const adminItems: SideNavigationProps.Item[] = userRole === 'admin' ? [
        {
          type: 'section',
          text: t('nav.admin'),
          items: [
            { type: 'link', text: t('nav.admin_page'), href: '/admin' }
          ]
        }
      ] : [];

      // 공개 메뉴 + 강사 메뉴 + 관리자 메뉴 (순서 변경 - 퍼블릭 메뉴를 먼저 표시)
      return [
        ...publicMenuItems,
        { type: 'divider' },
        {
          type: 'section',
          text: t('nav.instructor_tools'),
          items: instructorItems
        },
        ...adminItems
      ];
    }
    
    // 일반 교육생은 공개 메뉴만 표시
    return publicMenuItems;
  }, [authenticated, userRole, t]);

  // 현재 경로에 맞는 브레드크럼 생성
  const breadcrumbItems = useMemo(() => {
    const path = location.pathname;
    const items = [{ text: t('nav.home'), href: '/' }];

    if (path.startsWith('/tnc')) {
      items.push({ text: t('nav.course_list'), href: '/tnc' });
      
      // 과정 상세 페이지인 경우
      const segments = path.split('/').filter(Boolean);
      if (segments.length > 1) {
        items.push({ text: t('common.course_detail'), href: `/tnc/\${segments[1]}` });
        
        // 평가 페이지인 경우
        if (segments.length > 2) {
          const assessmentType = segments[2];
          if (assessmentType === 'pre-quiz') {
            items.push({ text: t('assessment.pre_quiz'), href: path });
          } else if (assessmentType === 'post-quiz') {
            items.push({ text: t('assessment.post_quiz'), href: path });
          } else if (assessmentType === 'survey') {
            items.push({ text: t('assessment.survey'), href: path });
          }
        }
      }
    } else if (path.startsWith('/pre-quiz')) {
      items.push({ text: t('assessment.pre_quiz'), href: path });
    } else if (path.startsWith('/post-quiz')) {
      items.push({ text: t('assessment.post_quiz'), href: path });
    } else if (path.startsWith('/survey')) {
      items.push({ text: t('assessment.survey'), href: path });
    } else if (path.startsWith('/instructor')) {
      items.push({ text: t('nav.instructor_tools'), href: '/instructor/dashboard' });
      
      const segments = path.split('/').filter(Boolean);
      if (segments.length > 1) {
        switch (segments[1]) {
          case 'dashboard':
            items.push({ text: t('nav.dashboard'), href: path });
            break;
          case 'courses':
            items.push({ text: t('nav.course_management'), href: '/instructor/courses' });
            if (segments.length > 2) {
              if (segments[2] === 'create') {
                items.push({ text: t('course.create_course'), href: path });
              } else if (segments[2] === 'catalog') {
                items.push({ text: t('course.catalog'), href: path });
              }
            }
            break;
          case 'assessments':
            items.push({ text: t('nav.assessments'), href: '#' });
            if (segments.length > 2) {
              switch (segments[2]) {
                case 'quiz':
                  items.push({ text: t('nav.quiz_management'), href: path });
                  break;
                case 'quiz-creator':
                  items.push({ 
                    text: t('nav.quiz_management'), 
                    href: '/instructor/assessments/quiz' 
                  });
                  items.push({ text: t('assessment.create_quiz'), href: path });
                  break;
                case 'survey':
                  items.push({ text: t('nav.survey_management'), href: path });
                  break;
                case 'survey-creator':
                  items.push({ 
                    text: t('nav.survey_management'), 
                    href: '/instructor/assessments/survey' 
                  });
                  items.push({ text: t('assessment.create_survey'), href: path });
                  break;
              }
            }
            break;
          case 'analytics':
            items.push({ text: t('nav.analytics'), href: '#' });
            if (segments.length > 2) {
              switch (segments[2]) {
                case 'reports':
                  items.push({ text: t('nav.reports'), href: path });
                  break;
                case 'insights':
                  items.push({ text: t('nav.insights'), href: path });
                  break;
                case 'comparison':
                  items.push({ text: t('nav.comparison'), href: path });
                  break;
              }
            }
            break;
        }
      }
    } else if (path.startsWith('/admin')) {
      items.push({ text: t('nav.admin'), href: '/admin' });
    }

    return items;
  }, [location.pathname, t]);

  // SideNavigation의 onFollow 핸들러
  const handleNavigationFollow = (event: CustomEvent<SideNavigationProps.FollowDetail>) => {
    // 외부 링크가 아닌 경우에만 기본 동작 방지 및 페이지 이동
    if (!event.detail.external) {
      event.preventDefault();
      navigate(event.detail.href);
    }
  };

  // TopNavigation utilities 생성 - 타입에 맞게 수정
  const getTopNavigationUtilities = (): TopNavigationProps.Utility[] => {
    // 언어 변경 버튼
    const languageButton: TopNavigationProps.ButtonUtility = {
      type: 'button',
      text: tString('common.language'),
      iconName: 'globe',
      onClick: () => {
        // 언어 전환 기능
        const currentLang = i18n.language;
        const newLang = currentLang === 'ko' ? 'en' : 'ko';
        i18n.changeLanguage(newLang);
      }
    };
    
    // 인증된 사용자의 메뉴
    if (authenticated) {
      const userDropdown: TopNavigationProps.MenuDropdownUtility = {
        type: 'menu-dropdown',
        text: username,
        description: userRole === 'admin' ? tString('role.admin') :
                     userRole === 'instructor' ? tString('role.instructor') : 
                     tString('role.student'),
        iconName: 'user-profile',
        items: [
          { id: 'profile', text: tString('auth.profile'), href: '#profile' },
          { id: 'preferences', text: tString('auth.preferences'), href: '#preferences' },
          { id: 'security', text: tString('auth.security'), href: '#security' },
          {
            id: 'help-group',
            text: tString('common.help'),
            items: [
              {
                id: 'documentation',
                text: tString('common.documentation'),
                href: "#",
                external: true,
                externalIconAriaLabel: tString('common.opens_in_new_tab')
              },
              { 
                id: 'support', 
                text: tString('common.support'),
                href: '#support'
              },
              {
                id: 'feedback',
                text: tString('common.feedback'),
                href: "#",
                external: true,
                externalIconAriaLabel: tString('common.opens_in_new_tab')
              }
            ]
          },
          { id: 'signout-divider', text: '', href: '#divider', disabled: true },
          { id: 'signout', text: tString('auth.sign_out'), href: '#signout' }
        ],
        onItemClick: (e) => {
          if (e.detail.id === 'signout') {
            setShowSignOutModal(true);
          }
        }
      };
      
      return [languageButton, userDropdown];
    } else {
      // 로그인 버튼 (비인증 사용자용)
      const signInButton: TopNavigationProps.ButtonUtility = {
        type: 'button',
        text: tString('auth.sign_in'),
        onClick: () => navigate('/signin')
      };
      
      return [languageButton, signInButton];
    }
  };

  return (
    <>
      {/* 로그아웃 확인 모달 */}
      <Modal
        visible={showSignOutModal}
        onDismiss={() => setShowSignOutModal(false)}
        header={t('auth.sign_out_confirm')}
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowSignOutModal(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSignOut}
                loading={loading}
              >
                {t('auth.sign_out')}
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        {t('auth.sign_out_message')}
      </Modal>

      {/* 헤더 요소 - headerSelector에 의해 참조됨 */}
      <div id="header">
        <TopNavigation
          identity={{
            href: '/',
            title: tString('app.title'),
            logo: {
              src: '/images/aws.png',
              alt: tString('app.title')
            }
          }}
          utilities={getTopNavigationUtilities()}
          i18nStrings={{
            searchIconAriaLabel: tString('common.search'),
            searchDismissIconAriaLabel: tString('common.close_search'),
            overflowMenuTriggerText: tString('common.more')
          }}
        />
      </div>

      {/* 메인 레이아웃 */}
      <AppLayout
        content={
          <SpaceBetween size="l">
            {title && (
              <Container>
                <SpaceBetween size="m">
                  <Header variant="h1">{title}</Header>
                </SpaceBetween>
              </Container>
            )}
            {children}
          </SpaceBetween>
        }
        headerSelector="#header"
        breadcrumbs={
          <BreadcrumbGroup items={breadcrumbItems} />
        }
        navigation={
          <SideNavigation 
            activeHref={location.pathname}
            header={{ text: tString('app.title'), href: '/' }}
            items={sideNavigationItems}
            onFollow={handleNavigationFollow}
          />
        }
        toolsHide={true}
        notifications={<div id="notifications" />}
        contentType="default"
      />
    </>
  );
};

export default MainLayout;