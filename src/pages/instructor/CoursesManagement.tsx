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
      isReadOnly={false}      // 읽기 전용 아님
      isAdminView={true}      // 관리자 뷰
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

export default CoursesManagement;