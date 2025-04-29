// src/pages/admin/SurveyManagementPage.tsx
import React, { useState } from 'react';
import {
  ContentLayout,
  SpaceBetween,
  Tabs,
  Container,
  Header,
  BreadcrumbGroup
} from '@cloudscape-design/components';
import MainLayout from '@/components/layout/MainLayout';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import SurveyQuestionBankTab from '@/components/survey/SurveyQuestionBankTab';
import SurveyCatalogTab from '@/components/survey/SurveyCatalogTab';
import SurveyDashboardTab from '@/components/survey/SurveyDashboardTab';

const SurveyManagementPage: React.FC = () => {
  const { t } = useAppTranslation()
  const [activeTabId, setActiveTabId] = useState('dashboard');

  return (
    <MainLayout 
      activeHref="/admin/survey-management"
      title={t('admin:surveyManagement.title', '설문조사 관리')}
    >
      <ContentLayout>
        <SpaceBetween size="l">
          <BreadcrumbGroup
            items={[
              { text: t('common:home'), href: '/' },
              { text: t('navigation:admin.title'), href: '/admin' },
              { text: t('navigation:admin.surveyManagement'), href: '/admin/survey-management' }
            ]}
            ariaLabel={t('common:breadcrumbs')}
          />

          <Container>
            <Tabs
              activeTabId={activeTabId}
              onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
              tabs={[
                {
                  id: 'dashboard',
                  label: t('navigation:admin.tabs.surveyDashboard', '설문조사 대시보드'),
                  content: <SurveyDashboardTab />
                },
                {
                  id: 'questionBank',
                  label: t('navigation:admin.tabs.surveyQuestionBank', '설문 문항 은행'),
                  content: <SurveyQuestionBankTab />
                },
                {
                  id: 'surveyCatalog',
                  label: t('navigation:admin.tabs.surveyCatalog', '설문 템플릿 관리'),
                  content: <SurveyCatalogTab />
                }
              ]}
            />
          </Container>
        </SpaceBetween>
      </ContentLayout>
    </MainLayout>
  );
};

export default SurveyManagementPage;