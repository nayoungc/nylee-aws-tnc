// src/components/layout/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { AppLayout, SideNavigation, Box, Spinner, Badge } from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNavigationHeader from './TopNavigationHeader';
import { useAuth } from '@hooks/useAuth';

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
  const { t } = useTranslation(['common', 'navigation', 'auth', 'admin']);
  const { isAuthenticated, loading, isAdmin, isInstructor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // activeHref가 명시적으로 제공되지 않으면 현재 위치 사용
  const [currentHref, setCurrentHref] = useState<string>(activeHref || location.pathname);

  // 위치가 변경되면 currentHref 업데이트
  useEffect(() => {
    setCurrentHref(activeHref || location.pathname);
  }, [activeHref, location.pathname]);

  // 네비게이션 핸들러 - 클릭 이벤트를 가로채서 React Router로 처리
  const handleFollow = (event: CustomEvent) => {
    // 이벤트의 기본 동작 방지
    event.preventDefault();

    const href = event.detail.href;

    // 외부 링크 확인
    if (event.detail.external) {
      window.open(href, '_blank');
      return false;
    }

    if (href) {
      // 내부 링크 React Router로 처리
      navigate(href);
      setCurrentHref(href);
      return false; // 기본 동작 실행 방지
    }

    return true; // 다른 경우 기본 동작 허용
  };

  // 기본 네비게이션 아이템
  const publicItems = [
    {
      type: 'link' as const,
      text: t('navigation:navigation_tnc'),
      href: '/tnc',
      info: <Badge color="blue">{t('navigation:badge_new')}</Badge>
    },
    { type: 'divider' as const }
  ];

  // 강사용 메뉴 아이템 수정
  const instructorItems = isInstructor || isAdmin ? [
    // 과정 관리 그룹
    {
      type: 'section-group' as const,
      title: t('navigation:instructor_title'),
      items: [
        { type: 'link' as const, text: t('navigation:instructor_course_management'), href: '/instructor/courses' },
        { type: 'link' as const, text: t('navigation:instructor_catalog'), href: '/instructor/catalog' }
      ]
    },

    // 평가 도구 그룹
    {
      type: 'section-group' as const,
      title: t('navigation:instructor_assessment_tools_group'),
      items: [
        { type: 'link' as const, text: t('navigation:instructor_quizzes'), href: '/instructor/quizzes' },
        { type: 'link' as const, text: t('navigation:instructor_surveys'), href: '/instructor/surveys' }
      ]
    },

    // 관리 도구 그룹
    {
      type: 'section-group' as const,
      title: t('navigation:instructor_management_tools_group'),
      items: [
        { type: 'link' as const, text: t('navigation:instructor_reports'), href: '/instructor/reports' },
        { type: 'link' as const, text: t('navigation:instructor_statistics'), href: '/instructor/statistics' }
      ]
    },
    { type: 'divider' as const }
  ] : [];

  // 관리자용 메뉴 항목 (수정 - 강사 메뉴 스타일로)
  const adminItems = isAdmin ? [
    // 대시보드 그룹
    {
      type: 'section-group' as const,
      title: t('navigation:admin_dashboard_group'),
      items: [
        { type: 'link' as const, text: t('navigation:admin_dashboard'), href: '/admin/dashboard' }
      ]
    },

    // 과정 관리 그룹
    {
      type: 'section-group' as const,
      title: t('navigation:admin_course_group'),
      items: [
        { type: 'link' as const, text: t('navigation:admin_course_management'), href: '/admin/course-management' },
        { type: 'link' as const, text: t('navigation:admin_catalog_management'), href: '/admin/catalog-management' }
      ]
    }, 

    { type: 'divider' as const },

    // // 시스템 관리 그룹
    // {
    //   type: 'section-group' as const,
    //   title: t('navigation:admin_system_group'),
    //   items: [
    //     { type: 'link' as const, text: t('navigation:admin_settings'), href: '/admin/settings' },
    //     {
    //       type: 'link' as const,
    //       text: t('navigation:admin_notifications'),
    //       href: '/admin/notifications',
    //       info: <Badge color="red">3</Badge>
    //     }
    //   ]
    // }
  ] : [];

  // 외부 링크 및 지원 메뉴
  const supportItems = [
    { type: 'divider' as const },
    {
      type: 'section-group' as const,
      title: t('navigation:navigation_support_section'),
      items: [
        { type: 'link' as const, text: t('navigation:navigation_help'), href: '/help' },
        { type: 'link' as const, text: t('navigation:navigation_feedback'), href: '/feedback' },
        {
          type: 'link' as const,
          text: t('navigation:navigation_aws'),
          href: 'https://aws.amazon.com',
          external: true,
          externalIconAriaLabel: t('navigation:navigation_external_link_aria_label')
        }
      ]
    }
  ];

  // 모든 메뉴 항목 결합
  const navItems = [...publicItems, ...instructorItems, ...adminItems, ...supportItems];

  return (
    <>
      {/* 헤더를 외부에서 한 번만 렌더링 */}
      <div id="header" className="main-layout-header">
        <TopNavigationHeader />
      </div>

      <AppLayout
        navigation={
          <SideNavigation
            items={navItems}
            activeHref={currentHref}
            header={{
              text: t('navigation:header_title'),
              href: '/',
              logo: {
                src: '/assets/aws.png',
                alt: t('navigation:header_logo_alt')
              }
            }}
            onFollow={handleFollow} // 클릭 이벤트 핸들러
          />
        }
        content={
          loading ? (
            <Box textAlign="center" padding={{ top: 'xxxl' }}>
              <Spinner size="large" />
              <Box variant="p" padding={{ top: 'l' }}>
                {t('common:loading')}
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
    </>
  );
}

export default MainLayout;