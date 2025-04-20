// CoursesManagement.tsx
import React from 'react';
import { BaseCourseView } from '@components/BaseCourseView';
import { useTypedTranslation } from '@utils/i18n-utils';
import { Button } from '@cloudscape-design/components';

const CoursesManagement: React.FC = () => {
  const { t } = useTypedTranslation();
  
  return (
    <BaseCourseView 
      title={t('courses.management_title')} 
      description={t('courses.management_description')}
      createPath="/instructor/courses/create"
      managePath="/instructor/courses/"
      viewPath="/course/"
      additionalActions={
        <Button iconName="settings">
          {t('courses.management_settings')}
        </Button>
      }
    />
  );
};

export default CoursesManagement;