import React, { useEffect, useState } from 'react';
import {
  AppLayout,
  SideNavigation,
  SideNavigationProps
} from '@cloudscape-design/components';
import Header from '../components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useTypedTranslation } from '../utils/i18n-utils';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, tString } = useTypedTranslation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // title 활용
  useEffect(() => {
    if (title) {
      document.title = `\${title} | \${t('app.title')}`;
    } else {
      document.title = t('app.title');
    }
  }, [title, t]);

  // 사용자 역할 가져오기
  useEffect(() => {
    const getUserRole = async () => {
      try {
        // 캐시된 데이터 확인
        const cachedAttributes = sessionStorage.getItem('userAttributes');
        if (cachedAttributes) {
          const attributes = JSON.parse(cachedAttributes);
          setUserRole(attributes.profile || null);
          setLoading(false);
          return;
        }

        // 캐시가 없으면 속성 가져오기
        const attributes = await fetchUserAttributes();
        setUserRole(attributes.profile || null);
        setLoading(false);
      } catch (error) {
        console.error(t('common.errors.fetch_user_role'), error);
        setUserRole(null);
        setLoading(false);
      }
    };

    getUserRole();
  }, [t]);

  // 네비게이션 아이템 생성 함수 - Cloudscape의 타입 사용
  const getNavigationItems = (): SideNavigationProps.Item[] => {
    let navItems: SideNavigationProps.Item[] = [];
    
    // instructor 또는 admin 사용자를 위한 메뉴
    if (userRole === 'instructor' || userRole === 'admin') {
      navItems = [
        {
          type: 'link',
          text: t('nav.dashboard'),
          href: '/instructor/dashboard'
        },
        {
          type: 'section',
          text: t('nav.course_management'),
          items: [
            {
              type: 'link',
              text: t('nav.courses'),
              href: '/instructor/courses'
            },
            {
              type: 'link',
              text: t('nav.catalog'),
              href: '/instructor/courses/catalog'
            }
          ]
        },
        {
          type: 'section',
          text: t('nav.assessment_tools'),
          items: [
            {
              type: 'link',
              text: t('nav.quiz'),
              href: '/instructor/assessments/quiz'
            },
            {
              type: 'link',
              text: t('nav.survey'),
              href: '/instructor/assessments/survey'
            }
          ]
        },
        {
          type: 'section',
          text: t('nav.analytics'),
          items: [
            {
              type: 'link',
              text: t('nav.quiz_comparison'),
              href: '/instructor/analytics/comparison'
            },
            {
              type: 'link',
              text: t('nav.reports'),
              href: '/instructor/analytics/reports'
            },
            {
              type: 'link',
              text: t('nav.insights'),
              href: '/instructor/analytics/insights'
            }
          ]
        }
      ];
    }

    // admin 사용자만을 위한 추가 메뉴
    if (userRole === 'admin') {
      navItems.push({
        type: 'link',
        text: t('nav.admin'),
        href: '/admin'
      });
    }

    // 공개 메뉴 - 모든 사용자에게 별도 섹션으로 표시
    navItems.push({
      type: 'section',
      text: t('nav.public_resources'),
      items: [
        {
          type: 'link',
          text: t('nav.course_catalog'),
          href: '/tnc'
        },
        {
          type: 'link',
          text: t('nav.tnccourses'),
          href: '/tnc/courses'
        }
      ]
    });

    return navItems;
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header 컴포넌트를 AppLayout 외부에 배치 */}
      <div id="header">
        <Header />
      </div>

      <AppLayout
        navigation={
          <SideNavigation
            header={{ text: tString('app.title'), href: '/' }}
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
        headerSelector="#header"
      />
    </div>
  );
};

export default MainLayout;