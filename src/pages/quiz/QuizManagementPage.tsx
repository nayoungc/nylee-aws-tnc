// src/pages/admin/QuizManagementPage.tsx
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
import QuestionBankTab from '@/components/quiz/QuestionBankTab';
import QuizCatalogTab from '@/components/quiz/QuizCatalogTab';
import QuizDashboardTab from '@/components/quiz/QuizDashboardTab';

const QuizManagementPage: React.FC = () => {
  const { t } = useAppTranslation();
  const [activeTabId, setActiveTabId] = useState('dashboard');

  return (
    <MainLayout 
      activeHref="/admin/quiz-management"
      title={t('admin:quizManagement.title', '퀴즈 관리')}
    >
      <ContentLayout>
        <SpaceBetween size="l">
          <BreadcrumbGroup
            items={[
              { text: t('common:home'), href: '/' },
              { text: t('navigation:admin.title'), href: '/admin' },
              { text: t('navigation:admin.quizManagement'), href: '/admin/quiz-management' }
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
                  label: t('navigation:admin.tabs.quizDashboard', '퀴즈 대시보드'),
                  content: <QuizDashboardTab />
                },
                {
                  id: 'questionBank',
                  label: t('navigation:admin.tabs.questionBank', '문항 은행'),
                  content: <QuestionBankTab />
                },
                {
                  id: 'quizCatalog',
                  label: t('navigation:admin.tabs.quizCatalog', '퀴즈 템플릿'),
                  content: <QuizCatalogTab />
                }
              ]}
            />
          </Container>
        </SpaceBetween>
      </ContentLayout>
    </MainLayout>
  );
};

export default QuizManagementPage;