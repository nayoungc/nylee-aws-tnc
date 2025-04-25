// src/components/layout/MainLayout.tsx
import React from 'react';
import { AppLayout, SideNavigation } from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import TopNavigationHeader from './TopNavigationHeader';
import { useAuth } from '@hooks/useAuth';

interface MainLayoutProps {
  children: React.ReactNode;
  activeHref?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  activeHref = '/'
}) => {
  const { t } = useTranslation();
  const { isAuthenticated, user, loading } = useAuth();
  
  // 사용자 역할 확인
  const isAdmin = user?.attributes?.['custom:role'] === 'admin';
  const isInstructor = user?.attributes?.['custom:role'] === 'instructor';
  
  // 기본 메뉴 항목 (모든 사용자에게 표시)
  const publicItems = [
    // 학생용 페이지 (로그인 불필요)
    { type: 'link' as const, text: t('nav.courses.public'), href: '/courses/public' }
  ];
  
  // 강사용 메뉴 항목
  const instructorItems = isInstructor || isAdmin ? [
    // 구분선
    { type: 'divider' as const },
    
    // 강사용 섹션
    { 
      type: 'section' as const, 
      text: t('nav.instructor.title'),
      items: [
        // 과정 관리
        { 
          type: 'link' as const, 
          text: t('nav.instructor.courseManagement.catalog'), 
          href: '/instructor/catalog'
        },
        { 
          type: 'link' as const, 
          text: t('nav.instructor.courseManagement.courses'), 
          href: '/instructor/courses'
        },
        
        // 평가 도구
        { 
          type: 'link' as const, 
          text: t('nav.instructor.assessmentTools.quizzes'), 
          href: '/instructor/quizzes'
        },
        { 
          type: 'link' as const, 
          text: t('nav.instructor.assessmentTools.surveys'), 
          href: '/instructor/surveys'
        },
        
        // 관리 도구
        { 
          type: 'link' as const, 
          text: t('nav.instructor.managementTools.reports'), 
          href: '/instructor/reports'
        },
        { 
          type: 'link' as const, 
          text: t('nav.instructor.managementTools.statistics'), 
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
      text: t('nav.admin.title'),
      items: [
        { type: 'link' as const, text: t('nav.admin.dashboard'), href: '/admin/dashboard' },
        { type: 'link' as const, text: t('nav.admin.users'), href: '/admin/users' },
        { type: 'link' as const, text: t('nav.admin.settings'), href: '/admin/settings' }
      ]
    }
  ] : [];

  // 모든 메뉴 항목 결합
  const navItems = [...publicItems, ...instructorItems, ...adminItems];

  return (
    <>
      {/* 최상단 헤더 */}
      <div id="header" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
        <TopNavigationHeader />
      </div>

      {/* 메인 레이아웃 */}
      <AppLayout
        navigation={
          <SideNavigation 
            items={navItems}
            activeHref={activeHref}
            header={{ text: t('nav.header'), href: '/' }}
          />
        }
        content={loading ? <div>로딩 중...</div> : children}
        headerSelector="#header"
        toolsHide
      />
    </>
  );
};

export default MainLayout;