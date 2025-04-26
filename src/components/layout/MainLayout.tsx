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
  
  // 강사용 메뉴 항목 - 수정된 부분: 올바른 구조로 변경
  const instructorItems = isInstructor || isAdmin ? [
    // 구분선
    { type: 'divider' as const },
    
    // 강사용 섹션
    { 
      type: 'section' as const, 
      text: t('navigation:instructor.title'),
      items: [
        // 과정 관리
        { 
          type: 'link' as const, 
          text: t('navigation:instructor.courseManagement'), 
          href: '/instructor/courses'
        },
        
        // 과정 카탈로그
        { 
          type: 'link' as const, 
          text: t('navigation:instructor.catalog'), 
          href: '/instructor/catalog'
        },
        
        // 퀴즈 관리
        { 
          type: 'link' as const, 
          text: t('navigation:instructor.quizzes'), 
          href: '/instructor/quizzes'
        },
        
        // 설문조사
        { 
          type: 'link' as const, 
          text: t('navigation:instructor.surveys'), 
          href: '/instructor/surveys'
        },
        
        // 보고서
        { 
          type: 'link' as const, 
          text: t('navigation:instructor.reports'), 
          href: '/instructor/reports'
        },
        
        // 통계
        { 
          type: 'link' as const, 
          text: t('navigation:instructor.statistics'), 
          href: '/instructor/statistics'
        }
      ]
    } 
  ] : [];
  
  // 관리자용 메뉴 항목
  const adminItems = isAdmin ? [
    // 구분선
    { type: 'divider' as const },
    
    // 관리자 섹션
    {
      type: 'section' as const,
      text: t('navigation:admin.title'),
      items: [
        { type: 'link' as const, text: t('navigation:admin.dashboard'), href: '/admin/dashboard' },
        { type: 'link' as const, text: t('navigation:admin.users'), href: '/admin/users' },
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
                src: '/assets/aws-logo.svg',
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