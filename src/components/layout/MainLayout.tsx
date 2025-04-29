// src/components/layout/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { 
  AppLayout, 
  SideNavigation, 
  Box, 
  Spinner, 
  Badge,
  Modal,
  Button,
  SpaceBetween
} from '@cloudscape-design/components';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNavigationHeader from './TopNavigationHeader';
import { useAuth } from '@hooks/useAuth';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface MainLayoutProps {
  children: React.ReactNode;
  activeHref?: string;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeHref,
  title
}) => {
  const { t } = useAppTranslation();
  const { isAuthenticated, loading, isAdmin, isInstructor, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentHref, setCurrentHref] = useState<string>(activeHref || location.pathname);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // 경로 변경 시 현재 활성 경로 업데이트
  useEffect(() => {
    setCurrentHref(activeHref || location.pathname);
  }, [activeHref, location.pathname]);

  // 인증되지 않은 사용자 리디렉션 (필요시 활성화)
  /*
  useEffect(() => {
    if (!loading && !isAuthenticated && !location.pathname.startsWith('/login')) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [isAuthenticated, loading, navigate, location]);
  */

  const handleFollow = (event: CustomEvent) => {
    event.preventDefault();
    const href = event.detail.href;

    if (event.detail.external) {
      window.open(href, '_blank');
      return false;
    }

    if (href) {
      // 로그아웃 메뉴 처리
      if (href === '/logout') {
        setShowLogoutModal(true);
        return false;
      }
      
      navigate(href);
      setCurrentHref(href);
      return false;
    }

    return true;
  };

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const result = await logout();
      
      if (result.success) {
        navigate('/login');
      } else {
        console.error('로그아웃 실패:', result.error);
        // 로그아웃에 실패해도 로그인 페이지로 리디렉션
        navigate('/login');
      }
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  // 네비게이션 항목 정의
  const publicItems = [
    {
      type: 'link' as const,
      text: t('navigation_tnc'),
      href: '/tnc',
      info: <Badge color="blue">{t('badge_new')}</Badge>
    },
    { type: 'divider' as const }
  ];

  const instructorItems = isInstructor || isAdmin ? [
    {
      type: 'section-group' as const,
      title: t('navigation_title'),
      items: [
        { type: 'link' as const, text: t('navigation_course_management'), href: '/instructor/courses' },
        { type: 'link' as const, text: t('navigation_catalog'), href: '/instructor/catalog' }
      ]
    },
    {
      type: 'section-group' as const,
      title: t('navigation_assessment_tools_group'),
      items: [
        { type: 'link' as const, text: t('navigation_quizzes'), href: '/instructor/quiz' },
        { type: 'link' as const, text: t('navigation_surveys'), href: '/instructor/survey' }
      ]
    },
    {
      type: 'section-group' as const,
      title: t('navigation_management_tools_group'),
      items: [
        { type: 'link' as const, text: t('navigation_reports'), href: '/instructor/report' },
        { type: 'link' as const, text: t('navigation_statistics'), href: '/instructor/statistic' }
      ]
    },
    { type: 'divider' as const }
  ] : [];

  const adminItems = isAdmin ? [
    {
      type: 'section-group' as const,
      title: t('navigation_dashboard_group'),
      items: [
        { type: 'link' as const, text: t('navigation_dashboard'), href: '/admin/dashboard' }
      ]
    },
    {
      type: 'section-group' as const,
      title: t('admin_course_group'),
      items: [
        { type: 'link' as const, text: t('navigation_course_management'), href: '/admin/course-management' },
        { type: 'link' as const, text: t('navigation_system_management'), href: '/admin/system-management' }
      ]
    }, 
    { type: 'divider' as const }
  ] : [];

  // 로그아웃 항목 추가
  const accountItems = isAuthenticated ? [
    {
      type: 'section-group' as const,
      title: t('navigation_account_section'),
      items: [
        { type: 'link' as const, text: t('navigation_profile'), href: '/profile' },
        { type: 'link' as const, text: t('navigation_settings'), href: '/settings' },
        { type: 'link' as const, text: t('navigation_logout'), href: '/logout' }
      ]
    }
  ] : [];

  const supportItems = [
    {
      type: 'section-group' as const,
      title: t('navigation_support_section'),
      items: [
        { type: 'link' as const, text: t('navigation_help'), href: '/help' },
        { type: 'link' as const, text: t('navigation_feedback'), href: '/feedback' },
        {
          type: 'link' as const,
          text: t('navigation_aws'),
          href: 'https://aws.amazon.com',
          external: true,
          externalIconAriaLabel: t('navigation_external_link_aria_label')
        }
      ]
    }
  ];

  // 모든 네비게이션 항목 결합
  const navItems = [
    ...publicItems,
    ...instructorItems,
    ...adminItems,
    ...accountItems,
    ...supportItems
  ];

  return (
    <>
      <div id="header" className="main-layout-header">
        <TopNavigationHeader />
      </div>

      <AppLayout
        navigation={
          <SideNavigation
            items={navItems}
            activeHref={currentHref}
            header={{
              text: t('header_title'),
              href: '/',
              logo: {
                src: '/assets/aws.png',
                alt: t('header_logo_alt')
              }
            }}
            onFollow={handleFollow}
          />
        }
        content={
          loading ? (
            <Box textAlign="center" padding={{ top: 'xxxl' }}>
              <Spinner size="large" />
              <Box variant="p" padding={{ top: 'l' }}>
                {t('loading')}
              </Box>
            </Box>
          ) : children
        }
        headerSelector="#header"
        toolsHide
        breadcrumbs={title ? (
          <Box padding={{ top: 's', bottom: 's' }}>
            <h1>{title}</h1>
          </Box>
        ) : undefined}
        navigationWidth={280}
        contentType="default"
      />

      {/* 로그아웃 확인 모달 */}
      <Modal
        visible={showLogoutModal}
        onDismiss={() => setShowLogoutModal(false)}
        header={t('logout_modal_title')}
        footer={
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              variant="link"
              onClick={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleLogout}
              loading={isLoggingOut}
            >
              {t('confirm_logout')}
            </Button>
          </SpaceBetween>
        }
      >
        {t('logout_confirm_message')}
      </Modal>
    </>
  );
};

export default MainLayout;