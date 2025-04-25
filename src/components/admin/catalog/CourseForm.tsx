// app/components/admin/course-catalog/CourseForm.tsx
import React, { useState } from 'react';
import {
  Form,
  FormField,
  Input,
  Textarea,
  SpaceBetween,
  Button,
  Select,
  Box,
  Multiselect,
  Container
} from '@cloudscape-design/components';
import { Course } from '@/types/admin.types';
import { addCourse, updateCourse } from '@/api/coursesApi';
import { useNotification } from '@/contexts/NotificationContext';

interface CourseFormProps {
  course: Course | null;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

const categoryOptions = [
  { label: 'AWS 기초', value: 'aws-fundamentals' },
  { label: '개발', value: 'development' },
  { label: '보안', value: 'security' },
  { label: '데이터베이스', value: 'database' },
  { label: '머신러닝', value: 'machine-learning' }
];

const CourseForm: React.FC<CourseFormProps> = ({ course, onSubmitSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Course>>(course || {
    code: '',
    title: '',
    description: '',
    category: '',
    duration: 1,
    level: 'beginner',
    prerequisites: []
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  const { addNotification } = useNotification();
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.code?.trim()) errors.code = '과정 코드는 필수입니다';
    if (!formData.title?.trim()) errors.title = '과정명은 필수입니다';
    if (!formData.category) errors.category = '카테고리를 선택해주세요';
    if (!formData.duration || formData.duration < 1) errors.duration = '올바른 기간을 입력해주세요';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (course?.id) {
        // 기존 과정 업데이트
        await updateCourse(course.id, formData as Course);
        addNotification({
          type: 'success',
          content: '과정이 성공적으로 업데이트되었습니다.',
          dismissible: true
        });
      } else {
        // 새 과정 추가
        await addCourse(formData as Course);
        addNotification({
          type: 'success',
          content: '새 과정이 성공적으로 추가되었습니다.',
          dismissible: true
        });
      }
      
      onSubmitSuccess();
    } catch (error) {
      addNotification({
        type: 'error',
        content: '과정 저장 중 오류가 발생했습니다.',
        dismissible: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box padding="l">
      <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
        <Form
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={onCancel}>
                취소
              </Button>
              <Button variant="primary" loading={loading} formAction="submit">
                {course ? '변경 사항 저장' : '과정 추가'}
              </Button>
            </SpaceBetween>
          }
        >
          <Container>
            <SpaceBetween size="l">
              <FormField
                label="과정 코드"
                description="과정 식별을 위한 고유 코드를 입력하세요"
                errorText={formErrors.code}
              >
                <Input
                  value={formData.code || ''}
                  onChange={({ detail }) => 
                    setFormData(prev => ({ ...prev, code: detail.value }))
                  }
                  placeholder="예: AWS-100"
                />
              </FormField>
              
              <FormField
                label="과정명"
                errorText={formErrors.title}
              >
                <Input
                  value={formData.title || ''}
                  onChange={({ detail }) => 
                    setFormData(prev => ({ ...prev, title: detail.value }))
                  }
                  placeholder="과정 제목을 입력하세요"
                />
              </FormField>
              
              <FormField
                label="설명"
              >
                <Textarea
                  value={formData.description || ''}
                  onChange={({ detail }) => 
                    setFormData(prev => ({ ...prev, description: detail.value }))
                  }
                  placeholder="과정에 대한 설명을 입력하세요"
                  rows={3}
                />
              </FormField>
              
              <FormField
                label="카테고리"
                errorText={formErrors.category}
              >
                <Select
                  selectedOption={
                    formData.category 
                      ? { label: categoryOptions.find(opt => opt.value === formData.category)?.label || '', value: formData.category } 
                      : null
                  }
                  onChange={({ detail }) => 
                    setFormData(prev => ({ ...prev, category: detail.selectedOption.value }))
                  }
                  options={categoryOptions}
                  placeholder="카테고리 선택"
                />
              </FormField>
              
              <FormField
                label="기간 (일)"
                errorText={formErrors.duration}
              >
                <Input
                  type="number"
                  value={formData.duration?.toString() || '1'}
                  onChange={({ detail }) => 
                    setFormData(prev => ({ ...prev, duration: parseInt(detail.value) || 1 }))
                  }
                  min={1}
                />
              </FormField>
              
              <FormField
                label="난이도"
              >
                <Select
                  selectedOption={{
                    label: 
                      formData.level === 'beginner' ? '초급' :
                      formData.level === 'intermediate' ? '중급' :
                      formData.level === 'advanced' ? '고급' : '초급',
                    value: formData.level || 'beginner'
                  }}
                  onChange={({ detail }) => 
                    setFormData(prev => ({ ...prev, level: detail.selectedOption.value }))
                  }
                  options={[
                    { label: '초급', value: 'beginner' },
                    { label: '중급', value: 'intermediate' },
                    { label: '고급', value: 'advanced' }
                  ]}
                />
              </FormField>
              
              <FormField
                label="선수 과정"
                description="이 과정을 수강하기 전에 들어야 하는 과정"
              >
                <Multiselect
                  selectedOptions={
                    (formData.prerequisites || []).map(code => ({ label: code, value: code }))
                  }
                  onChange={({ detail }) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      prerequisites: detail.selectedOptions.map(opt => opt.value)
                    }))
                  }
                  options={[
                    { label: 'AWS-101', value: 'AWS-101' },
                    { label: 'AWS-201', value: 'AWS-201' },
                    { label: 'DEV-101', value: 'DEV-101' }
                    // 실제로는 서버에서 가져온 과정 목록을 사용
                  ]}
                  placeholder="선수 과정 선택 (선택 사항)"
                />
              </FormField>
            </SpaceBetween>
          </Container>
        </Form>
      </form>
    </Box>
  );
};

export default CourseForm;