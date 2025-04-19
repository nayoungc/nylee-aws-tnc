// src/pages/CourseCreation.tsx
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
import { generateClient } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';
import { useTypedTranslation } from '../../utils/i18n-utils';

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

const CourseCreation: React.FC = () => {
  const { t, tString } = useTypedTranslation();
  const navigate = useNavigate();
  const [client] = useState(() => generateClient());
  
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

  // 페이지 로드 시 데이터 가져오기
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

  // 과정 템플릿 가져오기
  const fetchCourseTemplates = async () => {
    setLoadingTemplates(true);
    
    try {
      // 실제 구현에서는 GraphQL API 호출
      // 테스트용 샘플 데이터
      setTimeout(() => {
        setCourseTemplates([
          { id: 'template-1', title: 'AWS Cloud Practitioner', level: 'Foundational' },
          { id: 'template-2', title: 'AWS Solutions Architect Associate', level: 'Associate' },
          { id: 'template-3', title: 'AWS Developer Associate', level: 'Associate' }
        ]);
        setLoadingTemplates(false);
      }, 500);
    } catch (error) {
      console.error(t('course_creation.errors.template_load'), error);
      setCourseTemplates([]);
      setLoadingTemplates(false);
    }
  };

  // 강사 목록 가져오기
  const fetchInstructors = async () => {
    setLoadingInstructors(true);
    
    try {
      // 실제 구현에서는 GraphQL API 호출
      // 테스트용 샘플 데이터
      setTimeout(() => {
        setInstructors([
          { id: 'inst-1', name: 'John Doe', email: 'john@example.com' },
          { id: 'inst-2', name: 'Jane Smith', email: 'jane@example.com' }
        ]);
        setLoadingInstructors(false);
      }, 500);
    } catch (error) {
      console.error(t('course_creation.errors.instructor_load'), error);
      setInstructors([]);
      setLoadingInstructors(false);
    }
  };

  // 고객사 목록 가져오기
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    
    try {
      // 실제 구현에서는 GraphQL API 호출
      // 테스트용 샘플 데이터
      setTimeout(() => {
        setCustomers([
          { id: 'cust-1', name: '한국 AWS' },
          { id: 'cust-2', name: '삼성전자' },
          { id: 'cust-3', name: 'SK하이닉스' },
          { id: 'cust-4', name: 'LG전자' }
        ]);
        setLoadingCustomers(false);
      }, 500);
    } catch (error) {
      console.error(t('course_creation.errors.customer_load'), error);
      setCustomers([]);
      setLoadingCustomers(false);
    }
  };

  // 평가 도구 가져오기
  const fetchAssessments = async (courseId: string) => {
    setLoadingAssessments(true);
    
    try {
      // 실제 구현에서는 GraphQL API 호출
      // 테스트용 샘플 데이터
      setTimeout(() => {
        const sampleQuizzes = [
          { id: 'pre-1', title: 'AWS 기초 개념 이해도 평가', type: 'pre', questionCount: 10, courseId },
          { id: 'post-1', title: 'AWS 서비스 활용 이해도 평가', type: 'post', questionCount: 15, courseId },
          { id: 'survey-1', title: '수강생 사전 경험 조사', type: 'survey', questionCount: 5, courseId }
        ];
        
        setPreQuizzes(sampleQuizzes.filter(quiz => quiz.type === 'pre'));
        setPostQuizzes(sampleQuizzes.filter(quiz => quiz.type === 'post'));
        setSurveys(sampleQuizzes.filter(quiz => quiz.type === 'survey'));
        setLoadingAssessments(false);
      }, 500);
    } catch (error) {
      console.error(t('course_creation.errors.assessment_load'), error);
      setPreQuizzes([]);
      setPostQuizzes([]);
      setSurveys([]);
      setLoadingAssessments(false);
    }
  };

  // 평가 도구 미리보기
  const openPreview = async (quizId: string, type: 'pre' | 'post' | 'survey') => {
    setPreviewType(type);
    setLoadingPreview(true);
    setPreviewModalVisible(true);
    
    try {
      // 실제 구현에서는 GraphQL API 호출
      // 테스트용 샘플 데이터
      setTimeout(() => {
        const sampleQuestions = [
          {
            id: 'q1',
            questionText: 'AWS의 주요 컴퓨팅 서비스는 무엇인가요?',
            options: ['Amazon EC2', 'Amazon RDS', 'Amazon S3', 'Amazon VPC'],
            correctAnswer: 0
          },
          {
            id: 'q2',
            questionText: 'AWS에서 서버리스 컴퓨팅을 제공하는 서비스는?',
            options: ['AWS Lambda', 'Amazon EC2', 'Amazon ECS', 'Amazon EBS'],
            correctAnswer: 0
          }
        ];
        setPreviewQuestions(sampleQuestions);
        setLoadingPreview(false);
      }, 700);
    } catch (error) {
      console.error(t('course_creation.errors.preview_load'), error);
      setPreviewQuestions([]);
      setLoadingPreview(false);
    }
  };

  // 숫자 입력 검증
  const handleNumberInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    ({ detail }: { detail: { value: string } }) => {
      const numValue = parseInt(detail.value);
      if (isNaN(numValue) || numValue < 0) {
        setter("0");
      } else {
        setter(detail.value);
      }
    };

  // 과정 생성 처리
  const handleCreateCourse = async () => {
    if (!selectedTemplate || !startDate || !duration || !customCourseName) {
      setError(t('course_creation.errors.required_fields'));
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // 시작일 기반으로 종료일 계산
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + parseInt(duration) - 1);
      
      // 새 과정 생성 데이터
      const courseData = {
        id: uuidv4(),
        lmsId,
        title: customCourseName,
        courseTemplateId: selectedTemplate.value,
        instructorId: selectedInstructor?.value || null,
        instructorName: selectedInstructor?.label || '',
        customerId: useCustomCustomerName ? null : selectedCustomer?.value,
        customerName: useCustomCustomerName ? customerName : selectedCustomer?.label,
        startDate,
        endDate: end.toISOString().split('T')[0],
        duration: parseInt(duration),
        location: isVirtual ? 'vILT' : location,
        isVirtual,
        labCount: parseInt(labCount || '0'),
        studentCount: parseInt(studentCount || '0'),
        includePreQuiz,
        includePostQuiz,
        includeSurvey,
        preQuizId: selectedPreQuiz?.value || null,
        postQuizId: selectedPostQuiz?.value || null,
        surveyId: selectedSurvey?.value || null,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      
      // 실제 구현에서는 GraphQL API 호출
      console.log(t('course_creation.logs.create_data'), courseData);
      
      // 제출 시뮬레이션
      setTimeout(() => {
        setSuccess(true);
        
        // 잠시 후 목록 페이지로 이동
        setTimeout(() => {
          navigate('/instructor/courses');
        }, 2000);
        
        setSubmitting(false);
      }, 1000);
      
    } catch (error) {
      console.error(t('course_creation.errors.creation_failed'), error);
      setError(t('course_creation.errors.creation_message'));
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
        
        {/* 기본 정보 섹션 */}
        <Container header={<Header variant="h3">{t('course_creation.sections.basic_info')}</Header>}>
          <ColumnLayout columns={2}>
            <SpaceBetween size="l">
              {/* LMS ID */}
              <FormField label={t('course_creation.fields.lms_id')}>
                <Input
                  value={lmsId}
                  onChange={({ detail }) => setLmsId(detail.value)}
                  placeholder={tString('course_creation.placeholders.lms_id')}
                />
              </FormField>
              
              {/* 과정 */}
              <FormField 
                label={t('course_creation.fields.course_name')} 
                description={t('course_creation.descriptions.select_course')} 
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
              
              {/* 강사 선택 */}
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
            
            <SpaceBetween size="l">
              {/* 고객사 정보 */}
              <FormField 
                label={t('course_creation.fields.customer_name')} 
                constraintText={useCustomCustomerName ? 
                  t('course_creation.constraints.direct_input') : 
                  t('course_creation.constraints.select_from_list')}
              >
                <SpaceBetween size="s">
                  <Toggle
                    checked={useCustomCustomerName}
                    onChange={({ detail }) => setUseCustomCustomerName(detail.checked)}
                  >
                    {t('course_creation.fields.direct_input')}
                  </Toggle>
                  
                  {useCustomCustomerName ? (
                    <Input
                      value={customerName}
                      onChange={({ detail }) => setCustomerName(detail.value)}
                      placeholder={tString('course_creation.placeholders.customer_name_direct')}
                    />
                  ) : (
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
                  )}
                </SpaceBetween>
              </FormField>
              
              {/* 강의 시작 날짜 */}
              <FormField 
                label={t('course_creation.fields.start_date')} 
                constraintText={t('common.required')}
              >
                <DatePicker
                  onChange={({ detail }) => setStartDate(detail.value)}
                  value={startDate}
                  openCalendarAriaLabel={(selectedDate: string | null) => 
                    selectedDate ? 
                      t('course_creation.aria.open_calendar_selected', { date: selectedDate }) : 
                      t('course_creation.aria.open_calendar')
                  }
                  placeholder="YYYY/MM/DD"
                  i18nStrings={{
                    previousMonthAriaLabel: tString('date_picker.previous_month'),
                    nextMonthAriaLabel: tString('date_picker.next_month'),
                    todayAriaLabel: tString('date_picker.today')
                  }}
                />
              </FormField>
              
              {/* 강의실 위치 */}
              <FormField 
                label={t('course_creation.fields.location')}
              >
                <SpaceBetween size="s">
                  <Checkbox
                    checked={isVirtual}
                    onChange={({ detail }) => setIsVirtual(detail.checked)}
                  >
                    {t('course_creation.fields.virtual_training')}
                  </Checkbox>
                  
                  {!isVirtual && (
                    <Input
                      value={location}
                      onChange={({ detail }) => setLocation(detail.value)}
                      placeholder={tString('course_creation.placeholders.location')}
                      disabled={isVirtual}
                    />
                  )}
                </SpaceBetween>
              </FormField>
              
              {/* 교육 관련 수치 정보 */}
              <ColumnLayout columns={3}>
                <FormField label={t('course_creation.fields.duration')}>
                  <Input
                    type="number"
                    value={duration}
                    onChange={handleNumberInputChange(setDuration)}
                    placeholder="1"
                  />
                </FormField>
                
                <FormField label={t('course_creation.fields.lab_count')}>
                  <Input
                    type="number"
                    value={labCount}
                    onChange={handleNumberInputChange(setLabCount)}
                    placeholder="0"
                  />
                </FormField>
                
                <FormField label={t('course_creation.fields.student_count')}>
                  <Input
                    type="number"
                    value={studentCount}
                    onChange={handleNumberInputChange(setStudentCount)}
                    placeholder="0"
                  />
                </FormField>
              </ColumnLayout>
            </SpaceBetween>
          </ColumnLayout>
        </Container>
        
        {/* 평가 옵션 섹션 */}
        <Container header={<Header variant="h3">{t('course_creation.sections.assessment')}</Header>}>
          <SpaceBetween size="l">
            {/* 사전 퀴즈 섹션 */}
            <ExpandableSection 
              headerText={t('course_creation.assessments.pre_quiz')}
              variant="container"
              expanded={includePreQuiz}
            >
              <SpaceBetween size="m">
                <Checkbox
                  checked={includePreQuiz}
                  onChange={({ detail }) => setIncludePreQuiz(detail.checked)}
                >
                  {t('course_creation.assessments.include_pre_quiz')}
                </Checkbox>
                
                {includePreQuiz && (
                  <>
                    <FormField 
                      label={t('course_creation.assessments.select_pre_quiz')} 
                      description={t('course_creation.descriptions.select_pre_quiz')}
                    >
                      <Select
                        placeholder={tString('course_creation.placeholders.select_pre_quiz')}
                        loadingText={tString('course_creation.loading.quizzes')}
                        statusType={loadingAssessments ? "loading" : "finished"}
                        options={preQuizzes.map(quiz => ({
                          label: quiz.title,
                          value: quiz.id,
                          description: tString('course_creation.assessments.question_count', { count: quiz.questionCount })
                        }))}
                        selectedOption={selectedPreQuiz}
                        onChange={({ detail }) => setSelectedPreQuiz(detail.selectedOption)}
                        empty={tString('course_creation.assessments.no_pre_quiz')}
                      />
                    </FormField>
                    
                    {selectedPreQuiz && (
                      <Button 
                        iconName="external" 
                        onClick={() => openPreview(selectedPreQuiz.value, 'pre')}
                      >
                        {t('course_creation.assessments.preview_pre_quiz')}
                      </Button>
                    )}
                  </>
                )}
              </SpaceBetween>
            </ExpandableSection>
            
            {/* 사후 퀴즈 섹션 */}
            <ExpandableSection 
              headerText={t('course_creation.assessments.post_quiz')}
              variant="container"
              expanded={includePostQuiz}
            >
              <SpaceBetween size="m">
                <Checkbox
                  checked={includePostQuiz}
                  onChange={({ detail }) => setIncludePostQuiz(detail.checked)}
                >
                  {t('course_creation.assessments.include_post_quiz')}
                </Checkbox>
                
                {includePostQuiz && (
                  <>
                    <FormField 
                      label={t('course_creation.assessments.select_post_quiz')} 
                      description={t('course_creation.descriptions.select_post_quiz')}
                    >
                     <Select
                        placeholder={tString('course_creation.placeholders.select_post_quiz')}
                        loadingText={tString('course_creation.loading.quizzes')}
                        statusType={loadingAssessments ? "loading" : "finished"}
                        options={postQuizzes.map(quiz => ({
                          label: quiz.title,
                          value: quiz.id,
                          description: tString('course_creation.assessments.question_count', { count: quiz.questionCount })
                        }))}
                        selectedOption={selectedPostQuiz}
                        onChange={({ detail }) => setSelectedPostQuiz(detail.selectedOption)}
                        empty={tString('course_creation.assessments.no_post_quiz')}
                      />
                    </FormField>
                    
                    {selectedPostQuiz && (
                      <Button 
                        iconName="external" 
                        onClick={() => openPreview(selectedPostQuiz.value, 'post')}
                      >
                        {t('course_creation.assessments.preview_post_quiz')}
                      </Button>
                    )}
                  </>
                )}
              </SpaceBetween>
            </ExpandableSection>
            
            {/* 사전 설문조사 섹션 */}
            <ExpandableSection 
              headerText={t('course_creation.assessments.survey')}
              variant="container"
              expanded={includeSurvey}
            >
              <SpaceBetween size="m">
                <Checkbox
                  checked={includeSurvey}
                  onChange={({ detail }) => setIncludeSurvey(detail.checked)}
                >
                  {t('course_creation.assessments.include_survey')}
                </Checkbox>
                
                {includeSurvey && (
                  <>
                    <FormField 
                      label={t('course_creation.assessments.select_survey')} 
                      description={t('course_creation.descriptions.select_survey')}
                    >
                      <Select
                        placeholder={tString('course_creation.placeholders.select_survey')}
                        loadingText={tString('course_creation.loading.surveys')}
                        statusType={loadingAssessments ? "loading" : "finished"}
                        options={surveys.map(survey => ({
                          label: survey.title,
                          value: survey.id,
                          description: tString('course_creation.assessments.question_count', { count: survey.questionCount })
                        }))}
                        selectedOption={selectedSurvey}
                        onChange={({ detail }) => setSelectedSurvey(detail.selectedOption)}
                        empty={tString('course_creation.assessments.no_survey')}
                      />
                    </FormField>
                    
                    {selectedSurvey && (
                      <Button 
                        iconName="external" 
                        onClick={() => openPreview(selectedSurvey.value, 'survey')}
                      >
                        {t('course_creation.assessments.preview_survey')}
                      </Button>
                    )}
                  </>
                )}
              </SpaceBetween>
            </ExpandableSection>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
      
      {/* 미리보기 모달 */}
      <Modal
        visible={previewModalVisible}
        onDismiss={() => setPreviewModalVisible(false)}
        header={
          previewType === 'pre' ? t('course_creation.previews.pre_quiz_title') : 
          previewType === 'post' ? t('course_creation.previews.post_quiz_title') : 
          t('course_creation.previews.survey_title')
        }
        size="large"
        footer={
          <Box float="right">
            <Button onClick={() => setPreviewModalVisible(false)}>
              {t('common.close')}
            </Button>
          </Box>
        }
      >
        {loadingPreview ? (
          <Box textAlign="center" padding="l">
            <Spinner />
            <Box padding="s">{t('course_creation.loading.questions')}</Box>
          </Box>
        ) : (
          <SpaceBetween size="l">
            {previewQuestions.length > 0 ? (
              <Table
                columnDefinitions={[
                  {
                    id: "number",
                    header: t('course_creation.previews.question_number'),
                    cell: (item) => item.rowIndex
                  },
                  {
                    id: "question",
                    header: t('course_creation.previews.question'),
                    cell: item => item.questionText
                  },
                  {
                    id: "options",
                    header: t('course_creation.previews.options'),
                    cell: item => (
                      <Box>
                        {item.options.map((option: string, index: number) => (
                          <div key={index}>
                            {String.fromCharCode(65 + index)}. {option}
                            {previewType !== 'survey' && item.correctAnswer === index && 
                              <span style={{ color: 'green', marginLeft: '5px' }}>
                                ({t('course_creation.previews.correct_answer')})
                              </span>
                            }
                          </div>
                        ))}
                      </Box>
                    )
                  }
                ]}
                items={previewQuestions.map((q, index) => ({
                  ...q,
                  rowIndex: index + 1 // 각 항목에 행 번호 추가
                }))}
                trackBy="id"
                empty={
                  <Box textAlign="center" color="inherit">
                    <b>{t('course_creation.previews.no_questions')}</b>
                    <Box padding={{ bottom: "s" }}>
                      {t('course_creation.previews.no_questions_description')}
                    </Box>
                  </Box>
                }
              />
            ) : (
              <Box textAlign="center" color="inherit">
                <b>{t('course_creation.previews.no_questions')}</b>
                <Box padding={{ bottom: "s" }}>
                  {t('course_creation.previews.load_failed')}
                </Box>
              </Box>
            )}
          </SpaceBetween>
        )}
      </Modal>
    </Container>
  );
};

export default CourseCreation;