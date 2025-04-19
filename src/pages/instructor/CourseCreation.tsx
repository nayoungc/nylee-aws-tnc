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
  ExpandableSection,
  RadioGroup
} from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';

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
      console.error('과정 템플릿 로드 오류:', error);
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
      console.error('강사 로드 오류:', error);
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
      console.error('고객사 로드 오류:', error);
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
      console.error('평가 도구 로드 오류:', error);
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
      console.error('문제 로드 오류:', error);
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
      setError('필수 항목을 모두 입력해주세요.');
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
      console.log('생성할 과정 데이터:', courseData);
      
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
      console.error('과정 생성 오류:', error);
      setError('과정 생성에 실패했습니다. 다시 시도해 주세요.');
      setSubmitting(false);
    }
  };

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="새로운 교육 과정을 개설합니다"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => navigate('/instructor/courses')}>
                취소
              </Button>
              <Button 
                variant="primary" 
                onClick={handleCreateCourse} 
                loading={submitting}
                disabled={submitting || !selectedTemplate || !startDate || !customCourseName}
              >
                과정 생성
              </Button>
            </SpaceBetween>
          }
        >
          새 과정 개설
        </Header>
      }
    >
      <SpaceBetween size="l">
        {success && (
          <Alert type="success" header="과정이 성공적으로 생성되었습니다">
            과정 목록 페이지로 이동합니다...
          </Alert>
        )}
        
        {error && (
          <Alert type="error" header="오류">
            {error}
          </Alert>
        )}
        
        {/* 기본 정보 섹션 */}
        <Container header={<Header variant="h3">기본 정보</Header>}>
          <ColumnLayout columns={2}>
            <SpaceBetween size="l">
              {/* LMS ID */}
              <FormField label="LMS ID">
                <Input
                  value={lmsId}
                  onChange={({ detail }) => setLmsId(detail.value)}
                  placeholder="LMS ID 입력"
                />
              </FormField>
              
              {/* 과정 템플릿 */}
              <FormField 
                label="과정 템플릿" 
                description="기본 과정 템플릿을 선택하세요" 
                constraintText="필수 항목"
              >
                <Select
                  placeholder="과정 템플릿 선택"
                  loadingText="과정 목록을 불러오는 중..."
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
              
              {/* 과정명 */}
              <FormField 
                label="과정명" 
                constraintText="필수 항목"
              >
                <Input
                  value={customCourseName}
                  onChange={({ detail }) => setCustomCourseName(detail.value)}
                  placeholder="과정명 입력"
                />
              </FormField>
              
              {/* 강사 선택 */}
              <FormField 
                label="강사 이름" 
              >
                <Select
                  placeholder="강사 선택"
                  loadingText="강사 목록을 불러오는 중..."
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
                label="고객 이름" 
                constraintText={useCustomCustomerName ? "직접 입력" : "목록에서 선택"}
              >
                <SpaceBetween size="s">
                  <RadioGroup
                    items={[
                      { value: "select", label: "목록에서 선택" },
                      { value: "custom", label: "직접 입력" }
                    ]}
                    value={useCustomCustomerName ? "custom" : "select"}
                    onChange={({ detail }) => 
                      setUseCustomCustomerName(detail.value === "custom")
                    }
                  />
                  
                  {useCustomCustomerName ? (
                    <Input
                      value={customerName}
                      onChange={({ detail }) => setCustomerName(detail.value)}
                      placeholder="고객사 이름 직접 입력"
                    />
                  ) : (
                    <Select
                      placeholder="고객사 선택"
                      loadingText="고객사 목록을 불러오는 중..."
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
                label="강의 시작 날짜" 
                constraintText="필수 항목"
              >
                <DatePicker
                  onChange={({ detail }) => setStartDate(detail.value)}
                  value={startDate}
                  openCalendarAriaLabel={(selectedDate: string | null) => 
                    selectedDate ? `날짜 선택, 선택된 날짜: \${selectedDate}` : '날짜 선택'
                  }
                  placeholder="YYYY/MM/DD"
                  i18nStrings={{
                    previousMonthAriaLabel: '이전 달',
                    nextMonthAriaLabel: '다음 달',
                    todayAriaLabel: '오늘'
                  }}
                />
              </FormField>
              
              {/* 강의실 위치 */}
              <FormField 
                label="강의실 위치"
              >
                <SpaceBetween size="s">
                  <Checkbox
                    checked={isVirtual}
                    onChange={({ detail }) => setIsVirtual(detail.checked)}
                  >
                    vILT (가상 교육)
                  </Checkbox>
                  
                  {!isVirtual && (
                    <Input
                      value={location}
                      onChange={({ detail }) => setLocation(detail.value)}
                      placeholder="강의실 위치 입력"
                      disabled={isVirtual}
                    />
                  )}
                </SpaceBetween>
              </FormField>
              
              {/* 교육 관련 수치 정보 */}
              <ColumnLayout columns={3}>
                <FormField label="수업 일수">
                  <Input
                    type="number"
                    value={duration}
                    onChange={handleNumberInputChange(setDuration)}
                    placeholder="1"
                  />
                </FormField>
                
                <FormField label="실습 개수">
                  <Input
                    type="number"
                    value={labCount}
                    onChange={handleNumberInputChange(setLabCount)}
                    placeholder="0"
                  />
                </FormField>
                
                <FormField label="수강생 수">
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
        <Container header={<Header variant="h3">평가 옵션</Header>}>
          <SpaceBetween size="l">
            {/* 사전 퀴즈 섹션 */}
            <ExpandableSection 
              headerText="사전 퀴즈"
              variant="container"
              expanded={includePreQuiz}
            >
              <SpaceBetween size="m">
                <Checkbox
                  checked={includePreQuiz}
                  onChange={({ detail }) => setIncludePreQuiz(detail.checked)}
                >
                  사전 퀴즈 포함
                </Checkbox>
                
                {includePreQuiz && (
                  <>
                    <FormField 
                      label="사전 퀴즈 선택" 
                      description="이 과정에 포함할 사전 퀴즈를 선택하세요."
                    >
                      <Select
                        placeholder="사전 퀴즈 선택"
                        loadingText="퀴즈 목록을 불러오는 중..."
                        statusType={loadingAssessments ? "loading" : "finished"}
                        options={preQuizzes.map(quiz => ({
                          label: quiz.title,
                          value: quiz.id,
                          description: `\${quiz.questionCount}개 문항`
                        }))}
                        selectedOption={selectedPreQuiz}
                        onChange={({ detail }) => setSelectedPreQuiz(detail.selectedOption)}
                        empty="사용 가능한 사전 퀴즈가 없습니다."
                      />
                    </FormField>
                    
                    {selectedPreQuiz && (
                      <Button 
                        iconName="external" 
                        onClick={() => openPreview(selectedPreQuiz.value, 'pre')}
                      >
                        사전 퀴즈 미리보기
                      </Button>
                    )}
                  </>
                )}
              </SpaceBetween>
            </ExpandableSection>
            
            {/* 사후 퀴즈 섹션 */}
            <ExpandableSection 
              headerText="사후 퀴즈"
              variant="container"
              expanded={includePostQuiz}
            >
              <SpaceBetween size="m">
                <Checkbox
                  checked={includePostQuiz}
                  onChange={({ detail }) => setIncludePostQuiz(detail.checked)}
                >
                  사후 퀴즈 포함
                </Checkbox>
                
                {includePostQuiz && (
                  <>
                    <FormField 
                      label="사후 퀴즈 선택" 
                      description="이 과정에 포함할 사후 퀴즈를 선택하세요."
                    >
                      <Select
                        placeholder="사후 퀴즈 선택"
                        loadingText="퀴즈 목록을 불러오는 중..."
                        statusType={loadingAssessments ? "loading" : "finished"}
                        options={postQuizzes.map(quiz => ({
                          label: quiz.title,
                          value: quiz.id,
                          description: `\${quiz.questionCount}개 문항`
                        }))}
                        selectedOption={selectedPostQuiz}
                        onChange={({ detail }) => setSelectedPostQuiz(detail.selectedOption)}
                        empty="사용 가능한 사후 퀴즈가 없습니다."
                      />
                    </FormField>
                    
                    {selectedPostQuiz && (
                      <Button 
                        iconName="external" 
                        onClick={() => openPreview(selectedPostQuiz.value, 'post')}
                      >
                        사후 퀴즈 미리보기
                      </Button>
                    )}
                  </>
                )}
              </SpaceBetween>
            </ExpandableSection>
            
            {/* 사전 설문조사 섹션 */}
            <ExpandableSection 
              headerText="사전 설문조사"
              variant="container"
              expanded={includeSurvey}
            >
              <SpaceBetween size="m">
                <Checkbox
                  checked={includeSurvey}
                  onChange={({ detail }) => setIncludeSurvey(detail.checked)}
                >
                  사전 설문조사 포함
                </Checkbox>
                
                {includeSurvey && (
                  <>
                    <FormField 
                      label="설문조사 선택" 
                      description="이 과정에 포함할 사전 설문조사를 선택하세요."
                    >
                      <Select
                        placeholder="설문조사 선택"
                        loadingText="설문조사 목록을 불러오는 중..."
                        statusType={loadingAssessments ? "loading" : "finished"}
                        options={surveys.map(survey => ({
                          label: survey.title,
                          value: survey.id,
                          description: `\${survey.questionCount}개 문항`
                        }))}
                        selectedOption={selectedSurvey}
                        onChange={({ detail }) => setSelectedSurvey(detail.selectedOption)}
                        empty="사용 가능한 설문조사가 없습니다."
                      />
                    </FormField>
                    
                    {selectedSurvey && (
                      <Button 
                        iconName="external" 
                        onClick={() => openPreview(selectedSurvey.value, 'survey')}
                      >
                        설문조사 미리보기
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
          previewType === 'pre' ? '사전 퀴즈 미리보기' : 
          previewType === 'post' ? '사후 퀴즈 미리보기' : 
          '사전 설문조사 미리보기'
        }
        size="large"
        footer={
          <Box float="right">
            <Button onClick={() => setPreviewModalVisible(false)}>닫기</Button>
          </Box>
        }
      >
        {loadingPreview ? (
          <Box textAlign="center" padding="l">
            <Spinner />
            <Box padding="s">문항을 불러오는 중...</Box>
          </Box>
        ) : (
          <SpaceBetween size="l">
            {previewQuestions.length > 0 ? (
              <Table
                columnDefinitions={[
                  {
                    id: "number",
                    header: "번호",
                    cell: (item) => {
                      // 각 항목의 인덱스는 내부적으로 추적됨
                      // 미리 항목에 인덱스를 추가하는 방식으로 수정
                      return item.rowIndex;
                    }
                  },
                  {
                    id: "question",
                    header: "문항",
                    cell: item => item.questionText
                  },
                  {
                    id: "options",
                    header: "보기",
                    cell: item => (
                      <Box>
                        {item.options.map((option: string, index: number) => (
                          <div key={index}>
                            {String.fromCharCode(65 + index)}. {option}
                            {previewType !== 'survey' && item.correctAnswer === index && 
                              <span style={{ color: 'green', marginLeft: '5px' }}>(정답)</span>
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
                    <b>문항이 없습니다</b>
                    <Box padding={{ bottom: "s" }}>
                      선택한 평가 도구에 문항이 없습니다.
                    </Box>
                  </Box>
                }
              />
            ) : (
              <Box textAlign="center" color="inherit">
                <b>문항이 없습니다</b>
                <Box padding={{ bottom: "s" }}>
                  선택한 평가 도구에 문항이 없거나 불러오는데 실패했습니다.
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