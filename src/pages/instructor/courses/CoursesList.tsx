// src/pages/instructor/courses/CoursesList.tsx
import React from 'react';
import { BaseCourseView } from '@components/courses/BaseCourseView';
import { useTypedTranslation } from '@utils/i18n-utils';
import { Button } from '@cloudscape-design/components';
import MainLayout from '../../../layouts/MainLayout';

const CoursesList: React.FC = () => {
  const { t, tString } = useTypedTranslation();
  
  return (
    <MainLayout title={tString('courses.management_title')}>
      <BaseCourseView 
        title={t('courses.management_title')} 
        description={t('courses.management_description')}
        isAdminView={true}
        createPath="/instructor/courses/create"
        managePath="/instructor/courses/"
        viewPath="/course/"
        showCreateButton={true}
        showManageButton={true}
        additionalActions={
          <Button iconName="settings">
            {t('courses.management_settings')}
          </Button>
        }
      />
    </MainLayout>
  );
};

export default CoursesList;