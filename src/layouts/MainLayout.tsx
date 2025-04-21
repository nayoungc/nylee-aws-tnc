// src/layouts/MainLayout.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // AuthContext 사용
import { useTypedTranslation } from '@utils/i18n-utils';

import {
  AppLayout,
  TopNavigation,
  SideNavigation,
  BreadcrumbGroup,
  Button,
  SpaceBetween,
  Badge,
  Container,
  Modal,
  Box,
  Header,
  SideNavigationProps, 
  TopNavigationProps
} from '@cloudscape-design/components';

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
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signoutLoading, setSignoutLoading] = useState(false);
  
  // AuthContext에서 인증 정보 가져오기 - 중복 인증 검사 방지
  const { isAuthenticated, username, userAttributes, userRole, logout } = useAuth();

  // 로그아웃 핸들러 - useCallback 사용
  const handleSignOut = useCallback(async () => {
    setSignoutLoading(true);
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      setSignoutLoading(false);
      setShowSignOutModal(false);
    }
  }, [logout, navigate]);

  // 사이드 네비게이션 클릭 핸들러 - useCallback 사용
  const handleNavigationFollow = useCallback((event: CustomEvent<SideNavigationProps.FollowDetail>) => {
    if (!event.detail.external) {
      event.preventDefault();
      navigate(event.detail.href);
    }
  }, [navigate]);

  // 사이드 내비게이션 아이템 - 최적화된 의존성 배열
  const sideNavigationItems = useMemo(() => {
    // 기본 메뉴 (모든 사용자용)
    const publicMenuItems: SideNavigationProps.Item[] = [
      { type: 'link', text: t('nav.course_list'), href: '/tnc' }
    ] as SideNavigationProps.Item[];
    
    // 비인증 사용자는 공개 메뉴만 보여줌
    if (!isAuthenticated) {
      return publicMenuItems;
    }

    // 강사/관리자 메뉴 구성
    if (userRole === 'instructor' || userRole === 'admin') {
      const instructorItems: SideNavigationProps.Item[] = [
        { type: 'link', text: t('nav.dashboard'), href: '/instructor/dashboard' },
        { type: 'link', text: t('nav.course_management'), href: '/instructor/courses' },
        { type: 'link', text: t('nav.course_catalog'), href: '/instructor/courses/catalog' },
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
    
    // 일반 사용자는 공개 메뉴만 표시
    return publicMenuItems;
  }, [isAuthenticated, userRole, t]);

  // 브레드크럼 - 경로 변경시에만 계산
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

  // TopNavigation utilities 메모이제이션
  const topNavUtilities = useMemo(() => {
    const utilities: TopNavigationProps.Utility[] = [];
    
    // 언어 변경 버튼
    utilities.push({
      type: 'button',
      text: tString('common.language'),
      iconName: 'globe',
      onClick: () => {
        const currentLang = i18n.language;
        const newLang = currentLang === 'ko' ? 'en' : 'ko';
        i18n.changeLanguage(newLang);
      }
    });
    
    // 인증된 사용자 메뉴 또는 로그인 버튼
    if (isAuthenticated) {
      utilities.push({
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
      });
    } else {
      utilities.push({
        type: 'button',
        text: tString('auth.sign_in'),
        onClick: () => navigate('/signin')
      });
    }
    
    return utilities;
  }, [isAuthenticated, username, userRole, tString, i18n, navigate]);

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
                loading={signoutLoading}
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
          utilities={topNavUtilities}
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
            items={sideNavigationItems as any} // 또는 as readonly Item[]
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

// 메모이제이션으로 불필요한 렌더링 방지
export default React.memo(MainLayout);