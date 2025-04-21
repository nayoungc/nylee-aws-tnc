// src/pages/instructor/courses/CourseCreate.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  FormField,
  Select,
  DatePicker,
  Input,
  Checkbox,
  Button,
  Box,
  ColumnLayout,
  Alert,
  Spinner,
  Modal,
  Table,
  Toggle,
  ExpandableSection,
  RadioGroup
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useTypedTranslation } from '../../../utils/i18n-utils';
import MainLayout from '../../../layouts/MainLayout';
import { client } from '../../../graphql/client';

interface CourseTemplate {
  id: string;
  title: string;
  description?: string;
  level?: string;
}

interface Instructor {
  id: string;
  name: string;
  email: string;
}

interface Customer {
  id: string;
  name: string;
}

const CourseCreate: React.FC = () => {
  const { t, tString } = useTypedTranslation();
  const navigate = useNavigate();
  
  // 상태 관리
  const [courseTemplates, setCourseTemplates] = useState<CourseTemplate[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // 폼 상태 - 기본 필드
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [duration, setDuration] = useState<string>('1');
  
  // 새 요청 필드
  const [lmsId, setLmsId] = useState<string>('');
  const [customCourseName, setCustomCourseName] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [useCustomCustomerName, setUseCustomCustomerName] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [location, setLocation] = useState<string>('');
  const [isVirtual, setIsVirtual] = useState<boolean>(false);
  const [labCount, setLabCount] = useState<string>('0');
  const [studentCount, setStudentCount] = useState<string>('0');

  // 평가 도구 관련
  const [includePreQuiz, setIncludePreQuiz] = useState(true);
  const [includePostQuiz, setIncludePostQuiz] = useState(true);
  const [includeSurvey, setIncludeSurvey] = useState(true);
  const [selectedPreQuiz, setSelectedPreQuiz] = useState<any>(null);
  const [selectedPostQuiz, setSelectedPostQuiz] = useState<any>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [preQuizzes, setPreQuizzes] = useState<any[]>([]);
  const [postQuizzes, setPostQuizzes] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  // 미리보기 관련
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewType, setPreviewType] = useState<'pre' | 'post' | 'survey'>('pre');
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // 데이터 가져오기 (간략 버전)
  useEffect(() => {
    fetchCourseTemplates();
    fetchInstructors();
    fetchCustomers();
  }, []);
  
  // 템플릿 선택 시 과정명 자동 설정 및 평가 도구 로드
  useEffect(() => {
    if (selectedTemplate) {
      setCustomCourseName(selectedTemplate.label || '');
      fetchAssessments(selectedTemplate.value);
    }
  }, [selectedTemplate]);

  // 각 데이터 가져오기 함수는 모두 Amplify Gen 2 방식으로 구현 (약식 버전)
  const fetchCourseTemplates = async () => {
    try {
      setLoadingTemplates(true);
      // API 호출 (개발용 데이터)
      setCourseTemplates([
        { id: 'template-1', title: 'AWS Cloud Practitioner', level: 'Foundational' },
        { id: 'template-2', title: 'AWS Solutions Architect Associate', level: 'Associate' }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      setLoadingInstructors(true);
      // API 호출 (개발용 데이터)
      setInstructors([
        { id: 'inst-1', name: 'John Doe', email: 'john@example.com' },
        { id: 'inst-2', name: 'Jane Smith', email: 'jane@example.com' }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingInstructors(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      // API 호출 (개발용 데이터)
      setCustomers([
        { id: 'cust-1', name: '한국 AWS' },
        { id: 'cust-2', name: '삼성전자' }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchAssessments = async (courseId: string) => {
    try {
      setLoadingAssessments(true);
      // API 호출 (개발용 데이터)
      const sampleQuizzes = [
        { id: 'pre-1', title: 'AWS 기초 개념 이해도 평가', type: 'pre', questionCount: 10 },
        { id: 'post-1', title: 'AWS 서비스 활용 이해도 평가', type: 'post', questionCount: 15 }
      ];
      
      setPreQuizzes(sampleQuizzes.filter(quiz => quiz.type === 'pre'));
      setPostQuizzes(sampleQuizzes.filter(quiz => quiz.type === 'post'));
      setSurveys([{ id: 'survey-1', title: '수강생 사전 경험 조사', type: 'survey', questionCount: 5 }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAssessments(false);
    }
  };

  // 과정 생성 처리
  const handleCreateCourse = async () => {
    if (!selectedTemplate || !startDate || !duration || !customCourseName) {
      setError(t('course_creation.errors.required_fields'));
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // 시작일 기반으로 종료일 계산
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + parseInt(duration) - 1);
      
      // 과정 데이터 준비 
      const courseData = {
        courseId: uuidv4(),
        title: customCourseName,
        startDate,
        catalogId: selectedTemplate.value,
        version: "v1",
        status: 'ACTIVE',
        customerId: useCustomCustomerName ? null : selectedCustomer?.value,
        customerName: useCustomCustomerName ? customerName : selectedCustomer?.label
      };
      
      console.log('Creating course with data:', courseData);
      
      // Amplify Gen 2 방식 API 호출
      // const { data, errors } = await client.models.Course.create(courseData);
      
      // 제출 성공 시뮬레이션 (실제 코드에서는 위의 API 호출 사용)
      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => navigate('/instructor/courses'), 2000);
      }, 1000);
      
    } catch (error) {
      console.error(error);
      setError(t('course_creation.errors.creation_message'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout title={tString('course_creation.title')}>
      <Container
        header={
          <Header
            variant="h2"
            description={t('course_creation.description')}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => navigate('/instructor/courses')}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleCreateCourse} 
                  loading={submitting}
                  disabled={submitting || !selectedTemplate || !startDate || !customCourseName}
                >
                  {t('course_creation.create_button')}
                </Button>
              </SpaceBetween>
            }
          >
            {t('course_creation.title')}
          </Header>
        }
      >
        <SpaceBetween size="l">
          {success && (
            <Alert type="success" header={t('course_creation.success.header')}>
              {t('course_creation.success.message')}
            </Alert>
          )}
          
          {error && (
            <Alert type="error" header={t('common.error')}>
              {error}
            </Alert>
          )}
          
          {/* 양식 필드들 - 간략 버전으로 핵심 필드만 표시 */}
          <Container header={<Header variant="h3">{t('course_creation.sections.basic_info')}</Header>}>
            <ColumnLayout columns={2}>
              <SpaceBetween size="l">
                <FormField 
                  label={t('course_creation.fields.course_name')} 
                  constraintText={t('common.required')}
                >
                  <Select
                    placeholder={tString('course_creation.placeholders.select_course')}
                    loadingText={tString('course_creation.loading.courses')}
                    statusType={loadingTemplates ? "loading" : "finished"}
                    options={courseTemplates.map(template => ({
                      label: template.title,
                      value: template.id,
                      description: template.level
                    }))}
                    selectedOption={selectedTemplate}
                    onChange={({ detail }) => setSelectedTemplate(detail.selectedOption)}
                  />
                </FormField>
                
                <FormField 
                  label={t('course_creation.fields.start_date')} 
                  constraintText={t('common.required')}
                >
                  <DatePicker
                    onChange={({ detail }) => setStartDate(detail.value)}
                    value={startDate}
                    placeholder="YYYY/MM/DD"
                  />
                </FormField>
              </SpaceBetween>
              
              <SpaceBetween size="l">
                <FormField 
                  label={t('course_creation.fields.customer_name')} 
                >
                  <Select
                    placeholder={tString('course_creation.placeholders.select_customer')}
                    loadingText={tString('course_creation.loading.customers')}
                    statusType={loadingCustomers ? "loading" : "finished"}
                    options={customers.map(customer => ({
                      label: customer.name,
                      value: customer.id
                    }))}
                    selectedOption={selectedCustomer}
                    onChange={({ detail }) => setSelectedCustomer(detail.selectedOption)}
                  />
                </FormField>
                
                <FormField 
                  label={t('course_creation.fields.instructor_name')} 
                >
                  <Select
                    placeholder={tString('course_creation.placeholders.select_instructor')}
                    loadingText={tString('course_creation.loading.instructors')}
                    statusType={loadingInstructors ? "loading" : "finished"}
                    options={instructors.map(instructor => ({
                      label: instructor.name,
                      value: instructor.id,
                      description: instructor.email
                    }))}
                    selectedOption={selectedInstructor}
                    onChange={({ detail }) => setSelectedInstructor(detail.selectedOption)}
                  />
                </FormField>
              </SpaceBetween>
            </ColumnLayout>
          </Container>
          
          {/* 평가 섹션 - 간략 버전 */}
          <Container header={<Header variant="h3">{t('course_creation.sections.assessment')}</Header>}>
            <SpaceBetween size="l">
              <Checkbox
                checked={includePreQuiz}
                onChange={({ detail }) => setIncludePreQuiz(detail.checked)}
              >
                {t('course_creation.assessments.include_pre_quiz')}
              </Checkbox>
              <Checkbox
                checked={includePostQuiz}
                onChange={({ detail }) => setIncludePostQuiz(detail.checked)}
              >
                {t('course_creation.assessments.include_post_quiz')}
              </Checkbox>
              <Checkbox
                checked={includeSurvey}
                onChange={({ detail }) => setIncludeSurvey(detail.checked)}
              >
                {t('course_creation.assessments.include_survey')}
              </Checkbox>
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </Container>
    </MainLayout>
  );
};

export default CourseCreate;