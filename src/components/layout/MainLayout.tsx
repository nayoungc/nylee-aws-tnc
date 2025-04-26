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
      text: t('navigation:navigation.tnc'),
      href: '/tnc',
      info: <Badge color="blue">{t('navigation:badge.new')}</Badge>
    },
    { type: 'divider' as const }
  ];

  // 강사용 메뉴 아이템 수정
  const instructorItems = isInstructor || isAdmin ? [
    // 과정 관리 그룹
    {
      type: 'section-group' as const,
      title: t('navigation:instructor.title'),
      items: [
        { type: 'link' as const, text: t('navigation:instructor.courseManagement'), href: '/instructor/courses' },
        { type: 'link' as const, text: t('navigation:instructor.catalog'), href: '/instructor/catalog' }
      ]
    },
    
    // 평가 도구 그룹
    {
      type: 'section-group' as const,
      title: t('navigation:instructor.assessmentToolsGroup'),
      items: [
        { type: 'link' as const, text: t('navigation:instructor.quizzes'), href: '/instructor/quizzes' },
        { type: 'link' as const, text: t('navigation:instructor.surveys'), href: '/instructor/surveys' }
      ]
    },

    // 관리 도구 그룹
    {
      type: 'section-group' as const,
      title: t('navigation:instructor.managementToolsGroup'),
      items: [
        { type: 'link' as const, text: t('navigation:instructor.reports'), href: '/instructor/reports' },
        { type: 'link' as const, text: t('navigation:instructor.statistics'), href: '/instructor/statistics' }
      ]
    }
  ] : [];

  // 관리자용 메뉴 항목 (수정)
  const adminItems = isAdmin ? [
    { type: 'divider' as const },
    {
      type: 'section-group' as const,
      title: t('navigation:admin.title'),
      items: [
        { type: 'link' as const, text: t('navigation:admin.dashboard'), href: '/admin/dashboard' },
        {
          type: 'section' as const,
          text: t('navigation:admin.courseSection'),
          items: [
            { type: 'link' as const, text: t('navigation:admin.courseManagement'), href: '/admin/course-management' },
            { type: 'link' as const, text: t('navigation:admin.catalogManagement'), href: '/admin/catalog-management' }
          ]
        },
        {
          type: 'section' as const,
          text: t('navigation:admin.userSection'),
          items: [
            { type: 'link' as const, text: t('navigation:admin.userManagement'), href: '/admin/user-management' },
            { type: 'link' as const, text: t('navigation:admin.roleManagement'), href: '/admin/role-management' }
          ]
        },
        { type: 'link' as const, text: t('navigation:admin.settings'), href: '/admin/settings' },
        {
          type: 'link' as const,
          text: t('navigation:admin.notifications'),
          href: '/admin/notifications',
          info: <Badge color="red">3</Badge>
        }
      ]
    }
  ] : [];

  // 외부 링크 및 지원 메뉴
  const supportItems = [
    { type: 'divider' as const },
    {
      type: 'section-group' as const,
      title: t('navigation:navigation.supportSection'),
      items: [
        { type: 'link' as const, text: t('navigation:navigation.help'), href: '/help' },
        { type: 'link' as const, text: t('navigation:navigation.feedback'), href: '/feedback' },
        {
          type: 'link' as const,
          text: t('navigation:navigation.aws'),
          href: 'https://aws.amazon.com',
          external: true,
          externalIconAriaLabel: t('navigation:navigation.externalLinkAriaLabel')
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
              text: t('navigation:header.title'),
              href: '/',
              logo: {
                src: '/assets/aws.png',
                alt: t('navigation:header.logo.alt')
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