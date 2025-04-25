// src/components/layout/MainLayout.tsx
import React from 'react';
import { AppLayout, SideNavigation } from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';
import TopNavigationHeader from './TopNavigationHeader';

interface MainLayoutProps {
  children: React.ReactNode;
  activeHref?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  activeHref = '/'
}) => {
  const { t } = useTranslation();
  
  // 사이드 내비게이션 아이템
  const navItems = [
    { type: 'link', text: t('nav.home'), href: '/' },
    { 
      type: 'section', 
      text: t('nav.courses.title'), 
      items: [
        { type: 'link', text: t('nav.courses.catalog'), href: '/courses' },
        { type: 'link', text: t('nav.courses.myLearning'), href: '/my-courses' }
      ]
    },
    { type: 'link', text: t('nav.quizzes'), href: '/quizzes' },
    { type: 'link', text: t('nav.surveys'), href: '/surveys' }
  ];

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
        content={children}
        headerSelector="#header"
        toolsHide
      />
    </>
  );
};

export default MainLayout;