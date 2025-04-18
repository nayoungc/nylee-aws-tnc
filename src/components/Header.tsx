import React from 'react';
import { TopNavigation } from '@cloudscape-design/components';
// 이벤트 타입 임포트 추가
import { TopNavigationProps } from '@cloudscape-design/components';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // 사용자 역할에 따른 다른 유틸리티
  const getUtilities = () => {
    // 기본 유틸리티 항목
    const baseUtilities = [
      {
        type: 'button' as const,
        text: 'Documentation',
        href: '/help',
        external: false,
        externalIconAriaLabel: ' (opens in a new tab)'
      },
      {
        type: 'menu-dropdown' as const,
        text: user?.name || user?.email || 'User',
        description: user?.['custom:role'] || 'User',
        items: [
          { id: 'profile', text: 'Profile' },
          { id: 'preferences', text: 'Preferences' },
          { id: 'signout', text: 'Sign out' }
        ],
        // 파라미터에 타입 지정
        onItemClick: (e: CustomEvent<{ id: string }>) => {
          if (e.detail.id === 'signout') {
            handleLogout();
          } else if (e.detail.id === 'profile') {
            navigate('/settings/account');
          } else if (e.detail.id === 'preferences') {
            navigate('/settings/preferences');
          }
        }
      }
    ];

    // 강사인 경우 추가 유틸리티
    if (user?.['custom:role'] === 'instructor') {
      baseUtilities.unshift({
        type: 'menu-dropdown' as const,
        text: 'Create',
        description: 'Create new resources',
        items: [
          { id: 'create-session', text: 'Create Session' },
          { id: 'create-course', text: 'Create Course' },
          { id: 'create-quiz', text: 'Create Quiz' }
        ],
        // 파라미터에 타입 지정
        onItemClick: (e: CustomEvent<{ id: string }>) => {
          switch (e.detail.id) {
            case 'create-session':
              navigate('/courses/sessions/create');
              break;
            case 'create-course':
              navigate('/courses/create');
              break;
            case 'create-quiz':
              navigate('/assessments/create');
              break;
          }
        }
      });
    }

    return baseUtilities;
  };

  return (
    <div id="header">
      <TopNavigation
        identity={{
          href: '/',
          title: 'AWS Training & Certification',
          logo: {
            src: '/assets/logo.svg',
            alt: 'TnC'
          }
        }}
        utilities={getUtilities()}
      />
    </div>
  );
};

export default Header;