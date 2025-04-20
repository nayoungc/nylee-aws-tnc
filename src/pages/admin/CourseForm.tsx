// src/pages/admin/CourseForm.tsx
import React, { useState } from 'react';
import { 
  Form, 
  FormField, 
  Input, 
  SpaceBetween,
  Button
} from '@cloudscape-design/components';
import { useTranslation } from 'react-i18next';

interface CourseFormProps {
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  initialData?: any;
  isLoading?: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  isLoading = false
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    category: initialData.category || '',
    description: initialData.description || '',
    duration: initialData.duration?.toString() || '',
    level: initialData.level || '',
    price: initialData.price?.toString() || '',
    publishedDate: initialData.publishedDate || null,
    isActive: initialData.isActive ?? true,
    // 평가도구 선택 옵션 추가
    hasPreQuiz: initialData.hasPreQuiz ?? false,
    hasPostQuiz: initialData.hasPostQuiz ?? false,
    hasSurvey: initialData.hasSurvey ?? false
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 수정: 폼 제출 핸들러를 클릭 핸들러로 변경
  const handleSubmitClick = () => {
    onSubmit(formData);
  };

  return (
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="link" onClick={() => onCancel()}>
            {t('admin.common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSubmitClick} loading={isLoading}>
            {t('admin.common.save')}
          </Button>
        </SpaceBetween>
      }
    >
      <FormField label={t('admin.courses.form.title')}>
        <Input
          value={formData.title}
          onChange={e => handleChange('title', e.detail.value)}
        />
      </FormField>

      {/* 나머지 FormField 항목들... */}
    </Form>
  );
};

export default CourseForm;