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
// client 임포트를 제거하고 구체적인 함수들로 대체
import {
  listCourseCatalogs,
  listCustomers,
  createCourse,
  listQuizzes,
  listSurveys
} from '@api';

// 타입 정의도 API 폴더에서 가져오기
import {
  CourseCatalog,
  Customer,
  Quiz,
  Survey,
  Course
} from '@api/types';

// 강사 인터페이스 정의 - User Pool에서 관리
interface Instructor {
  id: string;
  name: string;
  email: string;
}

const CourseCreate: React.FC = () => {
  const { t, tString } = useTypedTranslation();
  const navigate = useNavigate();

  // 상태 관리
  const [courseTemplates, setCourseTemplates] = useState<CourseCatalog[]>([]);
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
  const [preQuizzes, setPreQuizzes] = useState<Quiz[]>([]);
  const [postQuizzes, setPostQuizzes] = useState<Quiz[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  // 미리보기 관련
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewType, setPreviewType] = useState<'pre' | 'post' | 'survey'>('pre');
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // 데이터 가져오기
  // useEffect(() => {
  //   fetchCourseTemplates();
  //   fetchInstructors();
  //   fetchCustomers();
  // }, []);

  // 템플릿 선택 시 과정명 자동 설정 및 평가 도구 로드
  useEffect(() => {
    if (selectedTemplate) {
      setCustomCourseName(selectedTemplate.label || '');
      fetchAssessments(selectedTemplate.value);
    }
  }, [selectedTemplate]);

  // 과정 템플릿(카탈로그) 가져오기
  // const fetchCourseTemplates = async () => {
  //   try {
  //     setLoadingTemplates(true);
  //     // DynamoDB API 호출
  //     const result = await listCourseCatalogs();

  //     if (result.data && Array.isArray(result.data)) {
  //       // 명시적으로 각 필드를 매핑하여 타입 변환
  //       const mappedData = result.data.map(item => ({
  //         catalogId: item.catalogId || '',
  //         title: item.title || '',
  //         version: item.version || 'v1',
  //         isPublished: item.isPublished !== undefined ? item.isPublished : true,
  //         status: item.status || 'ACTIVE',
  //         level: item.level,
  //         description: item.description,
  //         awsCode: item.awsCode,
  //         // 기타 필요한 필드들...
  //       } as CourseCatalog));
        
  //       setCourseTemplates(mappedData);
  //     } else {
  //       // 개발 환경 또는 에러 시 샘플 데이터
  //       if (process.env.NODE_ENV === 'development') {
  //         setCourseTemplates([
  //           {
  //             catalogId: 'template-1',
  //             title: 'AWS Cloud Practitioner',
  //             version: 'v1',
  //             isPublished: true,
  //             status: 'ACTIVE',
  //             level: 'Foundational'
  //           },
  //           {
  //             catalogId: 'template-2',
  //             title: 'AWS Solutions Architect Associate',
  //             version: 'v1',
  //             isPublished: true,
  //             status: 'ACTIVE',
  //             level: 'Associate'
  //           }
  //         ] as CourseCatalog[]);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error fetching course templates:', error);
  //   } finally {
  //     setLoadingTemplates(false);
  //   }
  // };

  // // 강사 목록 가져오기 (User Pool API 사용 예정)
  // const fetchInstructors = async () => {
  //   try {
  //     setLoadingInstructors(true);
  //     // 향후 Cognito User Pool API 호출로 대체
  //     // 현재는 샘플 데이터
  //     setInstructors([
  //       { id: 'inst-1', name: 'John Doe', email: 'john@example.com' },
  //       { id: 'inst-2', name: 'Jane Smith', email: 'jane@example.com' }
  //     ]);
  //   } catch (error) {
  //     console.error('Error fetching instructors:', error);
  //   } finally {
  //     setLoadingInstructors(false);
  //   }
  // };

  // 고객사 목록 가져오기
  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      // DynamoDB API 호출
      const result = await listCustomers();

      if (result.data && Array.isArray(result.data)) {
        setCustomers(result.data as Customer[]);
      } else {
        // 개발 환경 또는 에러 시 샘플 데이터
        if (process.env.NODE_ENV === 'development') {
          setCustomers([
            { customerId: 'cust-1', customerName: '한국 AWS' },
            { customerId: 'cust-2', customerName: '삼성전자' }
          ] as Customer[]);
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // 특정 과정에 관련된 평가(퀴즈, 설문) 가져오기
  const fetchAssessments = async (catalogId: string) => {
    try {
      setLoadingAssessments(true);

      // 타입 어서션 사용
      const preQuizzesResult = await listQuizzes({
        filter: {
          courseId: { eq: catalogId },
          quizType: { eq: 'pre' }
        } as any
      });

      const postQuizzesResult = await listQuizzes({
        filter: {
          courseId: { eq: catalogId },
          quizType: { eq: 'post' }
        } as any
      });

      const surveysResult = await listSurveys({
        filter: {
          courseId: { eq: catalogId }
        } as any
      });

      setPreQuizzes(preQuizzesResult.data || []);
      setPostQuizzes(postQuizzesResult.data || []);
      setSurveys(surveysResult.data || []);

      // 개발 환경 또는 데이터가 없을 때 샘플 데이터
      if (process.env.NODE_ENV === 'development' && (!preQuizzesResult.data || preQuizzesResult.data.length === 0)) {
        setPreQuizzes([
          { id: 'pre-1', title: 'AWS 기초 개념 이해도 평가', quizType: 'pre', questionCount: 10 }
        ] as Quiz[]);

        setPostQuizzes([
          { id: 'post-1', title: 'AWS 서비스 활용 이해도 평가', quizType: 'post', questionCount: 15 }
        ] as Quiz[]);

        setSurveys([
          { id: 'survey-1', title: '수강생 사전 경험 조사', surveyType: 'pre', questionCount: 5 }
        ] as Survey[]);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
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

      // LMS ID 생성 (자동 생성 또는 제공된 ID 사용)
      const generatedLmsId = lmsId || `course-\${uuidv4().substring(0, 8)}`;

      // 시작일 기반으로 종료일 계산
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + parseInt(duration) - 1);

      // 과정 데이터 준비
      const courseData: Partial<Course> = {
        lmsId: generatedLmsId,
        startDate,
        catalogId: selectedTemplate.value,
        title: customCourseName,
        duration: parseInt(duration),
        status: 'PENDING', // 또는 'SCHEDULED' 등 적절한 상태 코드
        customerId: useCustomCustomerName ? 'custom' : (selectedCustomer?.value || ''),
        instructor: selectedInstructor?.value,
        assessments: {
          ...(includePreQuiz && selectedPreQuiz ? { preQuiz: selectedPreQuiz.value } : {}),
          ...(includePostQuiz && selectedPostQuiz ? { postQuiz: selectedPostQuiz.value } : {}),
          ...(includeSurvey && selectedSurvey ? { preSurvey: selectedSurvey.value } : {})
        }
      };

      console.log('Creating course with data:', courseData);

      // DynamoDB API 호출
      const result = await createCourse(courseData as Course);

      setSuccess(true);
      setTimeout(() => navigate('/instructor/courses'), 2000);
    } catch (error) {
      console.error('Error creating course:', error);
      setError(t('course_creation.errors.creation_message'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
                    value: template.catalogId,
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
                    label: customer.customerName,
                    value: customer.customerId
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

            {includePreQuiz && preQuizzes.length > 0 && (
              <FormField
                label={t('course_creation.fields.pre_quiz')}
                constraintText={includePreQuiz ? t('common.required') : ''}
              >
                <Select
                  placeholder={tString('course_creation.placeholders.select_quiz')}
                  loadingText={tString('course_creation.loading.quizzes')}
                  statusType={loadingAssessments ? "loading" : "finished"}
                  options={preQuizzes.map(quiz => ({
                    label: quiz.title,
                    value: quiz.id,
                    description: `\${quiz.questionCount || 0} \${t('course_creation.questions')}`
                  }))}
                  selectedOption={selectedPreQuiz}
                  onChange={({ detail }) => setSelectedPreQuiz(detail.selectedOption)}
                />
              </FormField>
            )}

            <Checkbox
              checked={includePostQuiz}
              onChange={({ detail }) => setIncludePostQuiz(detail.checked)}
            >
              {t('course_creation.assessments.include_post_quiz')}
            </Checkbox>

            {includePostQuiz && postQuizzes.length > 0 && (
              <FormField
                label={t('course_creation.fields.post_quiz')}
                constraintText={includePostQuiz ? t('common.required') : ''}
              >
                <Select
                  placeholder={tString('course_creation.placeholders.select_quiz')}
                  loadingText={tString('course_creation.loading.quizzes')}
                  statusType={loadingAssessments ? "loading" : "finished"}
                  options={postQuizzes.map(quiz => ({
                    label: quiz.title,
                    value: quiz.id,
                    description: `\${quiz.questionCount || 0} \${t('course_creation.questions')}`
                  }))}
                  selectedOption={selectedPostQuiz}
                  onChange={({ detail }) => setSelectedPostQuiz(detail.selectedOption)}
                />
              </FormField>
            )}

            <Checkbox
              checked={includeSurvey}
              onChange={({ detail }) => setIncludeSurvey(detail.checked)}
            >
              {t('course_creation.assessments.include_survey')}
            </Checkbox>

            {includeSurvey && surveys.length > 0 && (
              <FormField
                label={t('course_creation.fields.survey')}
                constraintText={includeSurvey ? t('common.required') : ''}
              >
                <Select
                  placeholder={tString('course_creation.placeholders.select_survey')}
                  loadingText={tString('course_creation.loading.surveys')}
                  statusType={loadingAssessments ? "loading" : "finished"}
                  options={surveys.map(survey => ({
                    label: survey.title,
                    value: survey.id,
                    description: `\${survey.questionCount || 0} \${t('course_creation.questions')}`
                  }))}
                  selectedOption={selectedSurvey}
                  onChange={({ detail }) => setSelectedSurvey(detail.selectedOption)}
                />
              </FormField>
            )}
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Container>
  );
};

export default CourseCreate;