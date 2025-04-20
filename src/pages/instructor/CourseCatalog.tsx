// CourseCatalog.tsx
import React from 'react';
import { BaseCourseView } from '@components/BaseCourseView';
import { useTypedTranslation } from '@utils/i18n-utils';

const CourseCatalog: React.FC = () => {
  const { t } = useTypedTranslation();
  
  return (
    <BaseCourseView 
      title={t('courses.catalog_title')}
      description={t('courses.catalog_description')}
      createPath="/instructor/courses" 
      managePath="/instructor/courses/"
      viewPath="/course/"
    />
  );
};

export default CourseCatalog;