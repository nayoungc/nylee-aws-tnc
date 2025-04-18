import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppLayout,
  SideNavigation,
  SideNavigationProps,
  TopNavigation,
  BreadcrumbGroup,
  Flashbar,
  FlashbarProps
} from '@cloudscape-design/components';
import { useAuth } from '../hooks/useAuth';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<FlashbarProps.MessageDefinition[]>([]);
  const [activeHref, setActiveHref] = useState(location.pathname);

  // 현재 경로에서 빵부스러기(breadcrumbs) 생성
  const pathSegments = location.pathname.split('/').filter(segment => segment);
  const breadcrumbs = [
    { text: 'Home', href: '/' },
    ...pathSegments.map((segment, index) => ({
      text: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
      href: `/\${pathSegments.slice(0, index + 1).join('/')}`
    }))
  ];

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // 사용자 역할에 따른 네비게이션 항목
  const getNavigationItems = (): SideNavigationProps.Item[] => {
    // 기본값은 학생용
    let navItems: SideNavigationProps.Item[] = [
      { type: 'link', text: 'Home', href: '/student' },
      { type: 'link', text: 'Active Assessments', href: '/student/assessments' },
      { type: 'link', text: 'Resources', href: '/student/resources' },
      { type: 'link', text: 'Help', href: '/student/help' }
    ];

    // 강사인 경우
    if (user?.['custom:role'] === 'instructor') {
      navItems = [
        { type: 'link', text: 'Dashboard', href: '/dashboard' },
        {
          type: 'section',
          text: 'Course Management',
          items: [
            { type: 'link', text: 'Course Catalog', href: '/courses/catalog' },
            { type: 'link', text: 'My Courses', href: '/courses/my-courses' },
            { type: 'link', text: 'Session Management', href: '/courses/sessions' },
          ]
        },
        {
          type: 'section',
          text: 'Assessment Tools',
          items: [
            { type: 'link', text: 'Pre-Quiz Management', href: '/assessments/pre-quiz' },
            { type: 'link', text: 'Post-Quiz Management', href: '/assessments/post-quiz' },
            { type: 'link', text: 'Survey Management', href: '/assessments/survey' },
            { type: 'link', text: 'AI Question Generator', href: '/assessments/ai-generator' },
          ]
        },
        {
          type: 'section',
          text: 'Session Control',
          items: [
            { type: 'link', text: 'Active Sessions', href: '/sessions/active' },
            { type: 'link', text: 'Participant Monitoring', href: '/sessions/monitoring' },
            { type: 'link', text: 'Assessment Controls', href: '/sessions/controls' },
          ]
        },
        {
          type: 'section',
          text: 'Analytics',
          items: [
            { type: 'link', text: 'Results Dashboard', href: '/analytics/dashboard' },
            { type: 'link', text: 'Pre/Post Comparison', href: '/analytics/comparison' },
            { type: 'link', text: 'Participant Analysis', href: '/analytics/participants' },
            { type: 'link', text: 'Reports', href: '/analytics/reports' },
          ]
        },
        {
          type: 'section',
          text: 'Settings',
          items: [
            { type: 'link', text: 'Account Settings', href: '/settings/account' },
            { type: 'link', text: 'Notification Settings', href: '/settings/notifications' },
            { type: 'link', text: 'Integration Management', href: '/settings/integrations' },
          ]
        }
      ];
    }

    return navItems;
  };

  const navigationItems = getNavigationItems();

  const handleNavigate = (evt: CustomEvent) => {
    evt.preventDefault();
    const href = evt.detail.href;
    setActiveHref(href);
    navigate(href);
  };

  return (
    <AppLayout
      navigation={
        <SideNavigation
          activeHref={activeHref}
          header={{ text: 'TnC Assessment System', href: '/' }}
          items={navigationItems}
          onFollow={handleNavigate}
        />
      }
      toolsHide={true}
      content={
        <div style={{ padding: '20px' }}>
          {notifications.length > 0 && <Flashbar items={notifications} />}
          {title && <h1>{title}</h1>}
          {children}
        </div>
      }
      breadcrumbs={
        <BreadcrumbGroup
          items={breadcrumbs}
          onFollow={handleNavigate}
        />
      }
      notifications={<Flashbar items={notifications} />}
      contentType="default"
      navigationWidth={300}
      headerSelector="#header"
    />
  );
};

export default MainLayout;