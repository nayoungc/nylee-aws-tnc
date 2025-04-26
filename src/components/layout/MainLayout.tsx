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
  
  // 기본 메뉴 항목 (모든 사용자에게 표시)
  const publicItems = [
    { type: 'link' as const, text: t('navigation:tnc'), href: '/tnc' }
  ];
  
  // 인증된 사용자를 위한 메뉴 항목
  const authenticatedItems = isAuthenticated ? [
    { type: 'link' as const, text: t('navigation:dashboard'), href: '/' },
    { type: 'link' as const, text: t('navigation:resources'), href: '/resources' },
    { type: 'link' as const, text: t('navigation:calendar'), href: '/calendar' }
  ] : [];
  
  // 강사용 메뉴 항목
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
        href: '/instructor/courses', // 기본 링크 추가
        items: [
          { type: 'link' as const, text: t('navigation:instructor.courseManagement'), href: '/instructor/courses' },
          { type: 'link' as const, text: t('navigation:instructor.catalog'), href: '/instructor/catalog' }
        ]
      },
      
      // 평가 도구 관리 그룹
      {
        type: 'expandable-link-group' as const,
        text: t('navigation:instructor.assessmentToolsGroup'),
        href: '/instructor/quizzes', // 기본 링크 추가
        items: [
          { type: 'link' as const, text: t('navigation:instructor.quizzes'), href: '/instructor/quizzes' },
          { type: 'link' as const, text: t('navigation:instructor.surveys'), href: '/instructor/surveys' }
        ]
      },
      
      // 관리 도구 그룹
      {
        type: 'expandable-link-group' as const,
        text: t('navigation:instructor.managementToolsGroup'),
        href: '/instructor/reports', // 기본 링크 추가
        items: [
          { type: 'link' as const, text: t('navigation:instructor.reports'), href: '/instructor/reports' },
          { type: 'link' as const, text: t('navigation:instructor.statistics'), href: '/instructor/statistics' }
        ]
      }
    ]
  } 
] : [];
  
  // 관리자용 메뉴 항목
  const adminItems = isAdmin ? [
    { type: 'divider' as const },
    {
      type: 'section' as const,
      text: t('navigation:admin.title'),
      items: [
        { type: 'link' as const, text: t('navigation:admin.dashboard'), href: '/admin/dashboard' },
        { type: 'link' as const, text: t('navigation:admin.users'), href: '/admin/users' },
        { type: 'link' as const, text: t('navigation:admin.calendar'), href: '/admin/calendar' },
        { type: 'link' as const, text: t('navigation:admin.announcements'), href: '/admin/announcements' },
        { type: 'link' as const, text: t('navigation:admin.settings'), href: '/admin/settings' }
      ]
    }
  ] : [];

  // 모든 메뉴 항목 결합
  const navItems = [...publicItems, ...authenticatedItems, ...instructorItems, ...adminItems];

  return (
    <>
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
        headerSelector="#header"
        toolsHide
        breadcrumbs={title ? (
          <Box padding={{ top: 's', bottom: 's' }}>
            <h1>{title}</h1>
          </Box>
        ) : undefined}
      />
    </>
  );
};

export default MainLayout;