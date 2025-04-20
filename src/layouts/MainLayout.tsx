// src/layouts/MainLayout.tsx
import React, { useEffect, useState } from 'react';
import {
  AppLayout,
  SideNavigation,
  SideNavigationProps  // 추가: SideNavigationProps 타입 가져오기
} from '@cloudscape-design/components';
import Header from '../components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useTypedTranslation } from '../utils/i18n-utils'; // 상대 경로로 변경

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTypedTranslation();
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
        console.error('사용자 역할을 가져오는데 실패했습니다:', error);
        setUserRole(null);
        setLoading(false);
      }
    };

    getUserRole();
  }, []);

  // 네비게이션 아이템 생성 함수 - Cloudscape의 타입 사용
  const getNavigationItems = (): SideNavigationProps.Item[] => {
    // 로그인하지 않은 사용자 또는 일반 학생용 메뉴 (공개 메뉴만 표시)
    let navItems: SideNavigationProps.Item[] = [
      {
        type: 'link',
        text: t('nav.course_catalog') || '과정 카탈로그',
        href: '/courses'
      }
    ];

    // instructor 또는 admin 사용자를 위한 메뉴
    if (userRole === 'instructor' || userRole === 'admin') {
      navItems = [
        {
          type: 'link',
          text: t('nav.dashboard') || '대시보드',
          href: '/instructor/dashboard'
        },
        {
          type: 'section',
          text: t('nav.course_management') || '과정 관리',
          items: [
            {
              type: 'link',
              text: t('nav.courses') || '과정 목록',
              href: '/instructor/courses'
            },
            {
              type: 'link',
              text: t('nav.catalog') || '과정 카탈로그',
              href: '/instructor/courses/catalog'
            }
          ]
        },
        {
          type: 'section',
          text: t('nav.assessment_tools') || '평가 도구',
          items: [
            {
              type: 'link',
              text: t('nav.quiz') || '퀴즈',
              href: '/instructor/assessments/quiz'
            },
            {
              type: 'link',
              text: t('nav.survey') || '설문조사',
              href: '/instructor/assessments/survey'
            }
          ]
        },
        {
          type: 'section',
          text: t('nav.analytics') || '분석 및 보고서',
          items: [
            {
              type: 'link',
              text: t('nav.quiz_comparison') || '사전/사후 비교',
              href: '/instructor/analytics/comparison'
            },
            {
              type: 'link',
              text: t('nav.reports') || '보고서',
              href: '/instructor/analytics/reports'
            },
            {
              type: 'link',
              text: t('nav.insights') || '과정 인사이트',
              href: '/instructor/analytics/insights'
            }
          ]
        },
        // 과정 카탈로그는 모든 사용자에게 표시
        {
          type: 'link',
          text: t('nav.course_catalog') || '과정 카탈로그',
          href: '/courses'
        }
      ];
    }

    // admin 사용자만을 위한 추가 메뉴
    if (userRole === 'admin') {
      navItems.push({
        type: 'section',
        text: t('nav.admin_section') || '관리자 메뉴',
        items: [
          {
            type: 'link',
            text: t('nav.admin_dashboard') || '관리자 대시보드',
            href: '/admin'
          },
          {
            type: 'link',
            text: t('nav.user_management') || '사용자 관리',
            href: '/admin/users'
          },
          {
            type: 'link',
            text: t('nav.system_settings') || '시스템 설정',
            href: '/admin/settings'
          }
        ]
      });
    }

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
        headerSelector="#header"
      />
    </div>
  );
};

export default MainLayout;