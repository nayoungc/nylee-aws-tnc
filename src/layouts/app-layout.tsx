import React, { useState } from 'react';
import {
  AppLayout,
  SideNavigation,
  TopNavigation,
  BreadcrumbGroup
} from '@cloudscape-design/components';
import { useAuth } from '../auth/auth-context';

interface MainLayoutProps {
  children: React.ReactNode;
  activeHref?: string;
  breadcrumbs?: { text: string; href: string }[];
  title?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeHref = '/',
  breadcrumbs = [],
  title = '교육 관리 시스템'
}) => {
  const { user, logout } = useAuth();
  const [navigationOpen, setNavigationOpen] = useState(true);

  const navItems = [
    { type: 'link', text: '대시보드', href: '/' },
    { 
      type: 'section', 
      text: '과정 카탈로그', 
      items: [
        { type: 'link', text: '카탈로그', href: '/catalogs' },
        { type: 'link', text: '모듈', href: '/modules' },
        { type: 'link', text: '실습', href: '/labs' }
      ]
    },
    { 
      type: 'section', 
      text: '과정 관리', 
      items: [
        { type: 'link', text: '과정 목록', href: '/courses' },
        { type: 'link', text: '고객사', href: '/customers' }
      ]
    },
    { 
      type: 'section', 
      text: '평가 및 설문', 
      items: [
        { type: 'link', text: '퀴즈', href: '/quizzes' },
        { type: 'link', text: '설문', href: '/surveys' },
        { type: 'link', text: '분석', href: '/analytics' }
      ]
    }
  ];

  const handleSignOut = () => {
    logout();
  };

  return (
    <AppLayout
      navigation={
        <SideNavigation
          items={navItems}
          header={{ text: title, href: '/' }}
          activeHref={activeHref}
        />
      }
      navigationOpen={navigationOpen}
      onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
      breadcrumbs={
        <BreadcrumbGroup items={breadcrumbs} />
      }
      toolsHide={true}
      content={children}
      headerSelector="#header"
    />
  );
};
