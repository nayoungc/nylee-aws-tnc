// app/components/admin/course-catalog/CourseForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Form,
  Container,
  Header,
  SpaceBetween,
  Button,
  FormField,
  Input,
  Select,
  Textarea,
  RadioGroup,
  Multiselect,
  Box,
  ColumnLayout,
  Spinner
} from '@cloudscape-design/components';

// 이 인터페이스는 필요에 따라 수정하세요
interface FormData {
  id?: string;
  title: string;
  description: string;
  category: string;
  status: string;
  tags: string[];
  priority: string;
  [key: string]: any; // 추가 필드를 위한 인덱스 시그니처
}

// 이 인터페이스는 컴포넌트 props를 정의합니다
interface CourseFormProps {
  initialData?: FormData;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

// 기본값 설정
const defaultFormData: FormData = {
  title: '',
  description: '',
  category: '',
  status: 'draft',
  tags: [],
  priority: 'medium'
};

export const CourseCatalogForm: React.FC<CourseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false
}) => {
  // 상태 관리
  const [formData, setFormData] = useState<FormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 초기 데이터가 변경되면 폼 데이터 업데이트
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // 입력값 변경 처리
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 메시지 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    }
    
    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 처리
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('폼 제출 중 오류 발생:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      header={
        <Header
          variant="h2"
          description={isEdit ? "기존 항목을 수정합니다" : "새 항목을 생성합니다"}
        >
          {isEdit ? '항목 편집' : '새 항목 생성'}
        </Header>
      }
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button
            variant="link"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting || isLoading}
          >
            {isEdit ? '변경사항 저장' : '생성'}
          </Button>
        </SpaceBetween>
      }
    >
      {isLoading ? (
        <Box textAlign="center" padding="l">
          <Spinner size="large" />
          <Box variant="p" padding={{ top: "s" }}>
            데이터 로딩 중...
          </Box>
        </Box>
      ) : (
        <Container>
          <SpaceBetween size="l">
            <ColumnLayout columns={2}>
              <FormField
                label="제목"
                errorText={errors.title}
                constraintText="필수 항목입니다"
              >
                <Input
                  value={formData.title}
                  onChange={({ detail }) => handleChange('title', detail.value)}
                  autoFocus
                  disabled={isSubmitting || isLoading}
                />
              </FormField>
              
              <FormField
                label="카테고리"
                errorText={errors.category}
              >
                <Select
                  selectedOption={
                    formData.category
                      ? { label: formData.category, value: formData.category }
                      : null
                  }
                  onChange={({ detail }) => 
                    handleChange('category', detail.selectedOption.value)
                  }
                  options={[
                    { label: '선택해주세요', value: '' },
                    { label: '카테고리 1', value: 'category1' },
                    { label: '카테고리 2', value: 'category2' },
                    { label: '카테고리 3', value: 'category3' }
                  ]}
                  disabled={isSubmitting || isLoading}
                  placeholder="카테고리 선택"
                />
              </FormField>
            </ColumnLayout>
            
            <FormField
              label="설명"
              constraintText="선택 사항입니다"
            >
              <Textarea
                value={formData.description}
                onChange={({ detail }) => handleChange('description', detail.value)}
                disabled={isSubmitting || isLoading}
                rows={3}
              />
            </FormField>
            
            <FormField
              label="상태"
            >
              <RadioGroup
                value={formData.status}
                onChange={({ detail }) => handleChange('status', detail.value)}
                items={[
                  { value: 'draft', label: '초안' },
                  { value: 'published', label: '게시됨' },
                  { value: 'archived', label: '보관됨' }
                ]}
                // disabled={isSubmitting || isLoading}
              />
            </FormField>
            
            <FormField
              label="태그"
              constraintText="복수 선택 가능"
            >
              <Multiselect
                selectedOptions={formData.tags.map(tag => ({ label: tag, value: tag }))}
                onChange={({ detail }) => 
                  handleChange(
                    'tags', 
                    detail.selectedOptions.map(option => option.value)
                  )
                }
                options={[
                  { label: '태그 1', value: 'tag1' },
                  { label: '태그 2', value: 'tag2' },
                  { label: '태그 3', value: 'tag3' },
                  { label: '태그 4', value: 'tag4' }
                ]}
                disabled={isSubmitting || isLoading}
                placeholder="태그 선택"
              />
            </FormField>
            
            <FormField
              label="우선순위"
            >
              <Select
                selectedOption={
                  formData.priority
                    ? { 
                        label: formData.priority === 'high' ? '높음' : 
                               formData.priority === 'medium' ? '중간' : '낮음',
                        value: formData.priority 
                      }
                    : null
                }
                onChange={({ detail }) => 
                  handleChange('priority', detail.selectedOption.value)
                }
                options={[
                  { label: '높음', value: 'high' },
                  { label: '중간', value: 'medium' },
                  { label: '낮음', value: 'low' }
                ]}
                disabled={isSubmitting || isLoading}
              />
            </FormField>

            {/* 필요에 따라 더 많은 필드 추가 */}
          </SpaceBetween>
        </Container>
      )}
    </Form>
  );
};

export default CourseCatalogForm;