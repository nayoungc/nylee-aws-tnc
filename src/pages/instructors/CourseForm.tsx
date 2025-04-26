// src/components/CourseForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCourse, useCreateCourse, useUpdateCourse } from '@hooks/useCourse';
import { 
  Form, Container, Header, SpaceBetween, Button, FormField,
  Input, Select, DatePicker 
} from '@cloudscape-design/components';
import { CourseInput } from '@models/courses';
import i18n from '../../i18n';

interface CourseFormProps {
  isEdit?: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({ isEdit = false }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, loading: fetchLoading } = useGetCourse(isEdit ? courseId : undefined);
  const { createCourse, loading: createLoading } = useCreateCourse();
  const { updateCourse, loading: updateLoading } = useUpdateCourse();
  
  const [formData, setFormData] = useState<CourseInput>({
    startDate: '',
    catalogId: '',
    shareCode: '',
    instructor: '',
    customerId: '',
    status: 'scheduled',
  });

  useEffect(() => {
    if (isEdit && course) {
      setFormData({
        startDate: course.startDate,
        catalogId: course.catalogId,
        shareCode: course.shareCode,
        instructor: course.instructor,
        customerId: course.customerId,
        durations: course.durations,
        location: course.location,
        attendance: course.attendance,
        status: course.status as any,
      });
    }
  }, [isEdit, course]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (isEdit && courseId) {
        await updateCourse(courseId, formData);
        navigate(`/courses/\${courseId}`);
      } else {
        const newCourse = await createCourse(formData);
        navigate(`/courses/\${newCourse.courseId}`);
      }
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  const handleChange = (field: keyof CourseInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const statusOptions = [
    { label: i18n.t('scheduled'), value: 'scheduled' },
    { label: i18n.t('inProgress'), value: 'inProgress' },
    { label: i18n.t('completed'), value: 'completed' },
    { label: i18n.t('cancelled'), value: 'cancelled' },
  ];

  return (
    <Container
      header={
        <Header>
          {isEdit ? i18n.t('editCourse') : i18n.t('createCourse')}
        </Header>
      }
    >
      <form onSubmit={handleSubmit}>
        <Form
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => navigate(-1)}>
                {i18n.t('cancel')}
              </Button>
              <Button variant="primary" loading={createLoading || updateLoading} formAction="submit">
                {isEdit ? i18n.t('save') : i18n.t('create')}
              </Button>
            </SpaceBetween>
          }
        >
          <SpaceBetween direction="vertical" size="l">
            <FormField label={i18n.t('startDate')}>
              <DatePicker
                value={formData.startDate}
                onChange={({ detail }) => handleChange('startDate', detail.value)}
                placeholder="YYYY-MM-DD"
              />
            </FormField>
            
            <FormField label={i18n.t('instructor')}>
              <Input
                value={formData.instructor}
                onChange={({ detail }) => handleChange('instructor', detail.value)}
              />
            </FormField>
            
            <FormField label={i18n.t('catalogId')}>
              <Input
                value={formData.catalogId}
                onChange={({ detail }) => handleChange('catalogId', detail.value)}
              />
            </FormField>
            
            <FormField label={i18n.t('customerId')}>
              <Input
                value={formData.customerId}
                onChange={({ detail }) => handleChange('customerId', detail.value)}
              />
            </FormField>
            
            <FormField label={i18n.t('shareCode')}>
              <Input
                value={formData.shareCode}
                onChange={({ detail }) => handleChange('shareCode', detail.value)}
              />
            </FormField>
            
            <FormField label={i18n.t('location')}>
              <Input
                value={formData.location || ''}
                onChange={({ detail }) => handleChange('location', detail.value)}
              />
            </FormField>
            
            <FormField label={i18n.t('duration')}>
              <Input
                type="number"
                value={formData.durations?.toString() || ''}
                onChange={({ detail }) => handleChange('durations', parseInt(detail.value) || undefined)}
              />
            </FormField>
            
            <FormField label={i18n.t('attendance')}>
              <Input
                type="number"
                value={formData.attendance?.toString() || ''}
                onChange={({ detail }) => handleChange('attendance', parseInt(detail.value) || undefined)}
              />
            </FormField>
            
            <FormField label={i18n.t('status')}>
              <Select
                options={statusOptions}
                selectedOption={{ label: statusOptions.find(o => o.value === formData.status)?.label || '', value: formData.status || '' }}
                onChange={({ detail }) => handleChange('status', detail.selectedOption.value)}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </form>
    </Container>
  );
};

export default CourseForm;