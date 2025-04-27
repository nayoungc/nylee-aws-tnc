// src/components/layout/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { AppLayout, SideNavigation, Box, Spinner, Badge } from '@cloudscape-design/components';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNavigationHeader from './TopNavigationHeader';
import { useAuth } from '@hooks/useAuth';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface MainLayoutProps {
  children: React.ReactNode;
  activeHref?: string;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeHref,
  title
}) => {
  const { t } = useAppTranslation();
  const { isAuthenticated, loading, isAdmin, isInstructor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentHref, setCurrentHref] = useState<string>(activeHref || location.pathname);

  useEffect(() => {
    setCurrentHref(activeHref || location.pathname);
  }, [activeHref, location.pathname]);

  const handleFollow = (event: CustomEvent) => {
    event.preventDefault();
    const href = event.detail.href;

    if (event.detail.external) {
      window.open(href, '_blank');
      return false;
    }

    if (href) {
      navigate(href);
      setCurrentHref(href);
      return false;
    }

    return true;
  };

  const publicItems = [
    {
      type: 'link' as const,
      text: t('navigation_tnc'),
      href: '/tnc',
      info: <Badge color="blue">{t('badge_new')}</Badge>
    },
    { type: 'divider' as const }
  ];

  const instructorItems = isInstructor || isAdmin ? [
    {
      type: 'section-group' as const,
      title: t('instructor_title'),
      items: [
        { type: 'link' as const, text: t('instructor_course_management'), href: '/instructor/courses' },
        { type: 'link' as const, text: t('instructor_catalog'), href: '/instructor/catalog' }
      ]
    },
    {
      type: 'section-group' as const,
      title: t('instructor_assessment_tools_group'),
      items: [
        { type: 'link' as const, text: t('instructor_quizzes'), href: '/instructor/quizzes' },
        { type: 'link' as const, text: t('instructor_surveys'), href: '/instructor/surveys' }
      ]
    },
    {
      type: 'section-group' as const,
      title: t('instructor_management_tools_group'),
      items: [
        { type: 'link' as const, text: t('instructor_reports'), href: '/instructor/reports' },
        { type: 'link' as const, text: t('instructor_statistics'), href: '/instructor/statistics' }
      ]
    },
    { type: 'divider' as const }
  ] : [];

  const adminItems = isAdmin ? [
    {
      type: 'section-group' as const,
      title: t('admin_dashboard_group'),
      items: [
        { type: 'link' as const, text: t('admin_dashboard'), href: '/admin/dashboard' }
      ]
    },
    {
      type: 'section-group' as const,
      title: t('admin_course_group'),
      items: [
        { type: 'link' as const, text: t('admin_course_management'), href: '/admin/course-management' },
        { type: 'link' as const, text: t('admin_catalog_management'), href: '/admin/catalog-management' }
      ]
    }, 
    { type: 'divider' as const }
  ] : [];

  const supportItems = [
    { type: 'divider' as const },
    {
      type: 'section-group' as const,
      title: t('navigation_support_section'),
      items: [
        { type: 'link' as const, text: t('navigation_help'), href: '/help' },
        { type: 'link' as const, text: t('navigation_feedback'), href: '/feedback' },
        {
          type: 'link' as const,
          text: t('navigation_aws'),
          href: 'https://aws.amazon.com',
          external: true,
          externalIconAriaLabel: t('navigation_external_link_aria_label')
        }
      ]
    }
  ];

  const navItems = [...publicItems, ...instructorItems, ...adminItems, ...supportItems];

  return (
    <>
      <div id="header" className="main-layout-header">
        <TopNavigationHeader />
      </div>

      <AppLayout
        navigation={
          <SideNavigation
            items={navItems}
            activeHref={currentHref}
            header={{
              text: t('header_title'),
              href: '/',
              logo: {
                src: '/assets/aws.png',
                alt: t('header_logo_alt')
              }
            }}
            onFollow={handleFollow}
          />
        }
        content={
          loading ? (
            <Box textAlign="center" padding={{ top: 'xxxl' }}>
              <Spinner size="large" />
              <Box variant="p" padding={{ top: 'l' }}>
                {t('loading')}
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
        navigationWidth={280}
        contentType="default"
      />
    </>
  );
}

export default MainLayout;