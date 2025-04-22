// src/pages/instructor/courses/CoursesList.tsx
import { Button } from '@cloudscape-design/components';
import { BaseCourseView } from '@components/courses/BaseCourseView';
import { useTypedTranslation } from '@utils/i18n-utils';
import React from 'react';

const CoursesList: React.FC = () => {
  const { t } = useTypedTranslation(); // tString이 사용되지 않으므로 제거
  
  return (
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
  );
};

export default CoursesList;