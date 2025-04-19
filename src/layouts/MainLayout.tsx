import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppLayout,
  SideNavigation,
  SideNavigationProps,
  BreadcrumbGroup,
  Flashbar,
  FlashbarProps,
  Spinner
} from '@cloudscape-design/components';
import { fetchUserAttributes, signOut } from 'aws-amplify/auth';
import { useTranslation } from 'react-i18next';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  // Amplify Gen 2 방식으로 사용자 정보 관리
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<FlashbarProps.MessageDefinition[]>([]);
  const [activeHref, setActiveHref] = useState(location.pathname);

  // Amplify Gen 2 방식으로 사용자 정보 로드
  useEffect(() => {
    async function loadUserAttributes() {
      setLoading(true);
      try {
        const attributes = await fetchUserAttributes();
        setUser(attributes);
      } catch (error) {
        console.error('사용자 정보를 불러올 수 없습니다:', error);
        setUser(null);
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    }
    
    loadUserAttributes();
  }, [navigate]);

  // 현재 경로에서 빵부스러기(breadcrumbs) 생성
  const pathSegments = location.pathname.split('/').filter(segment => segment);
  const breadcrumbs = [
    { text: 'Home', href: '/' },
    ...pathSegments.map((segment, index) => ({
      text: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
      href: `/\${pathSegments.slice(0, index + 1).join('/')}` // 백슬래시 제거
    }))
  ];

  // Amplify Gen 2 방식으로 로그아웃 처리
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('로그아웃 처리 중 오류가 발생했습니다:', error);
      setNotifications([
        ...notifications,
        {
          type: 'error',
          content: '로그아웃 처리 중 오류가 발생했습니다.',
          dismissible: true,
          id: `error-\${Date.now()}`
        }
      ]);
    }
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

    // 강사인 경우 (Amplify Gen 2에서는 속성 접근 방식이 변경됨)
    // 이메일 도메인으로 역할 확인 (custom:role이 없을 수 있음)
    const isInstructor = user?.email?.endsWith('@amazon.com') || false;
    
    if (isInstructor) {
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

  // 사용자가 로그인하지 않았거나 로딩 중일 때 로딩 인디케이터 표시
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="large" />
      </div>
    );
  }

  // 사용자 정보가 없으면 로그인 페이지로 리디렉션
  if (!user) {
    navigate('/signin');
    return null;
  }

  // 상단 네비게이션 유틸리티 아이템 설정
  const utilities = [
    {
      type: 'menu-dropdown' as const,
      text: user.email || user.username || '사용자',
      iconName: 'user-profile' as const,
      items: [
        { id: 'profile', text: String(t('nav.profile') || 'Profile') },
        { id: 'settings', text: String(t('nav.settings') || 'Settings') },
        { id: 'signout', text: String(t('auth.sign_out') || 'Sign out') }
      ],
      onItemClick: (e: any) => {
        if (e.detail.id === 'signout') {
          handleLogout();
        } else if (e.detail.id === 'settings') {
          navigate('/settings/account');
        } else if (e.detail.id === 'profile') {
          navigate('/profile');
        }
      }
    }
  ];

  // 언어 전환 드롭다운 추가 (i18next 통합)
  if (t) {
    utilities.unshift({
      type: 'menu-dropdown' as const,
      text: user?.locale === 'ko' ? '한국어' : 'English',
      iconName: 'user-profile' as const,
      items: [
        { id: 'en', text: 'English' },
        { id: 'ko', text: '한국어' }
      ],
      onItemClick: (e: any) => {
        // 여기에 언어 전환 로직 구현
      }
    });
  }

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