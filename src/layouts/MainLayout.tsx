// src/layouts/MainLayout.tsx
import React, { useEffect, useState } from 'react';
import { AppLayout, SideNavigation } from '@cloudscape-design/components';
import Header from '../components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useTypedTranslation } from '@/utils/i18n-utils'; // 경로 확인

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string; // title prop 추가 (선택적)
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTypedTranslation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // title 활용 예시 (선택적으로 구현)
  useEffect(() => {
    if (title) {
      document.title = `\${title} | \${t('app.title')}`;
    } else {
      document.title = t('app.title');
    }
  }, [title, t]);

  // 나머지 코드는 그대로...
  
  // 사용자 역할 가져오기
  useEffect(() => {
    const getUserRole = async () => {
      // 기존 코드...
    };

    getUserRole();
  }, []);

  // 네비게이션 아이템 생성 함수
  const getNavigationItems = () => {
    // 기존 코드...
  };

  return (
    <AppLayout
      navigation={
        <SideNavigation
          header={{ text: t('app.title') || 'AWS Training & Certification', href: '/' }}
          items={getNavigationItems()}
          activeHref={location.pathname}
          onFollow={event => {
            if (!event.detail.external) {
              event.preventDefault();
              navigate(event.detail.href);
            }
          }}
        />
      }
      content={children}
      toolsHide={true}
      navigationWidth={250}
      contentType="default"
      headerHide={false}
      header={<Header />}
    />
  );
};

export default MainLayout;