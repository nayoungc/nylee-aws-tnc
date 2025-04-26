// src/components/layout/MainLayout.tsx
import React from 'react';
import { AppLayout, SideNavigation, Box, Spinner } from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import TopNavigationHeader from './TopNavigationHeader';
import { useAuth } from '@hooks/useAuth';

interface MainLayoutProps {
  children: React.ReactNode;
  activeHref?: string;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeHref = '/',
  title
}) => {
  const { t, i18n } = useTranslation(['common', 'navigation']);
  const { isAuthenticated, loading, isAdmin, isInstructor } = useAuth();

  // 기존 네비게이션 아이템 정의 (변경 없음)
  const publicItems = [
    { type: 'link' as const, text: t('navigation:tnc'), href: '/tnc' }
  ];
  
  // 인증된 사용자 메뉴 (변경 없음)
  const authenticatedItems = isAuthenticated ? [
    { type: 'link' as const, text: t('navigation:dashboard'), href: '/' },
    { type: 'link' as const, text: t('navigation:resources'), href: '/resources' },
    { type: 'link' as const, text: t('navigation:calendar'), href: '/calendar' }
  ] : [];
  
  // 강사용 메뉴 항목 (변경 없음)
  const instructorItems = isInstructor || isAdmin ? [
    { type: 'divider' as const },
    {
      type: 'section' as const,
      text: t('navigation:instructor.title'),
      items: [
        // 과정 관리 그룹
        {
          type: 'expandable-link-group' as const,
          text: t('navigation:instructor.courseManagementGroup'),
          href: '/instructor/courses',
          items: [
            { type: 'link' as const, text: t('navigation:instructor.courseManagement'), href: '/instructor/courses' },
            { type: 'link' as const, text: t('navigation:instructor.catalog'), href: '/instructor/catalog' }
          ]
        },
        
        // 평가 도구 관리 그룹
        {
          type: 'expandable-link-group' as const,
          text: t('navigation:instructor.assessmentToolsGroup'),
          href: '/instructor/quizzes',
          items: [
            { type: 'link' as const, text: t('navigation:instructor.quizzes'), href: '/instructor/quizzes' },
            { type: 'link' as const, text: t('navigation:instructor.surveys'), href: '/instructor/surveys' }
          ]
        },
        
        // 관리 도구 그룹
        {
          type: 'expandable-link-group' as const,
          text: t('navigation:instructor.managementToolsGroup'),
          href: '/instructor/reports',
          items: [
            { type: 'link' as const, text: t('navigation:instructor.reports'), href: '/instructor/reports' },
            { type: 'link' as const, text: t('navigation:instructor.statistics'), href: '/instructor/statistics' }
          ]
        }
      ]
    }
  ] : [];
  
  // 관리자용 메뉴 항목 (변경 없음)
  const adminItems = isAdmin ? [
    { type: 'divider' as const },
    {
      type: 'section' as const,
      text: t('navigation:admin.title'),
      items: [
        { type: 'link' as const, text: t('navigation:admin.dashboard'), href: '/admin/dashboard' },
        { type: 'link' as const, text: t('navigation:admin.courseManagement'), href: '/admin/course-management' },
        { type: 'link' as const, text: t('navigation:admin.systemManagement'), href: '/admin/system-management' },
        { type: 'link' as const, text: t('navigation:admin.settings'), href: '/admin/settings' }
      ]
    }
  ] : [];

  // 모든 메뉴 항목 결합
  const navItems = [...publicItems, ...authenticatedItems, ...instructorItems, ...adminItems];

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
            activeHref={activeHref}
            header={{
              text: t('navigation:header'),
              href: '/',
              logo: {
                src: '/assets/aws.png',
                alt: t('common:app.logo_alt')
              }
            }}
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
        // topNavigation prop 제거하고 headerSelector만 사용
        headerSelector="#header"
        toolsHide
        breadcrumbs={title ? (
          <Box padding={{ top: 's', bottom: 's' }}>
            <h1>{title}</h1>
          </Box>
        ) : undefined}
        // 명시적으로 사이드바 및 콘텐츠 설정 추가
        navigationWidth={280}
        contentType="default"
      />
    </>
  );
};

export default MainLayout;