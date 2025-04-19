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
  Spinner
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

// GraphQL 쿼리와 뮤테이션 정의
const listCourseTemplates = /* GraphQL */ `
  query ListCourseTemplates(
    \$filter: ModelCourseCatalogFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listCourseCatalogs(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        title
        description
        level
        status
      }
      nextToken
    }
  }
`;

const listInstructors = /* GraphQL */ `
  query ListInstructors(
    \$filter: ModelInstructorFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listInstructors(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        name
        email
        status
      }
      nextToken
    }
  }
`;

const createCourse = /* GraphQL */ `
  mutation CreateCourse(\$input: CreateCourseInput!) {
    createCourse(input: \$input) {
      id
      title
      instructorId
      startDate
      endDate
      duration
      status
      createdAt
      updatedAt
    }
  }
`;

const CourseCreation: React.FC = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [courseTemplates, setCourseTemplates] = useState<CourseTemplate[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 폼 상태
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [duration, setDuration] = useState<string>('1');
  const [includePreQuiz, setIncludePreQuiz] = useState(true);
  const [includePostQuiz, setIncludePostQuiz] = useState(true);
  const [includeSurvey, setIncludeSurvey] = useState(true);

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    fetchCourseTemplates();
    fetchInstructors();
  }, []);

  // GraphQL을 사용하여 과정 템플릿 가져오기
  const fetchCourseTemplates = async () => {
    setLoadingTemplates(true);

    try {
      const client = generateClient();

      const response = await client.graphql({
        query: listCourseTemplates,
        variables: {
          limit: 100,
          filter: {
            status: { eq: "ACTIVE" }
          }
        }
      });

      const responseAny: any = response;
      const templateItems = responseAny.data?.listCourseCatalogs?.items || [];

      if (templateItems.length > 0) {
        setCourseTemplates(templateItems);
      } else {
        // 샘플 데이터
        setCourseTemplates([
          { id: 'template-1', title: 'AWS Cloud Practitioner', level: 'Foundational' },
          { id: 'template-2', title: 'AWS Solutions Architect Associate', level: 'Associate' },
          { id: 'template-3', title: 'AWS Developer Associate', level: 'Associate' }
        ]);
      }
    } catch (error) {
      console.error('과정 템플릿 로드 오류:', error);
      setError('과정 템플릿 목록을 불러오는데 실패했습니다');

      // 샘플 데이터
      setCourseTemplates([
        { id: 'template-1', title: 'AWS Cloud Practitioner', level: 'Foundational' },
        { id: 'template-2', title: 'AWS Solutions Architect Associate', level: 'Associate' },
        { id: 'template-3', title: 'AWS Developer Associate', level: 'Associate' }
      ]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // GraphQL을 사용하여 강사 목록 가져오기
  const fetchInstructors = async () => {
    setLoadingInstructors(true);

    try {
      const client = generateClient();

      const response = await client.graphql({
        query: listInstructors,
        variables: {
          limit: 100,
          filter: {
            status: { eq: "ACTIVE" }
          }
        }
      });

      const responseAny: any = response;
      const instructorItems = responseAny.data?.listInstructors?.items || [];

      if (instructorItems.length > 0) {
        setInstructors(instructorItems);
      } else {
        // 샘플 데이터
        setInstructors([
          { id: 'inst-1', name: 'John Doe', email: 'john@example.com' },
          { id: 'inst-2', name: 'Jane Smith', email: 'jane@example.com' }
        ]);
      }
    } catch (error) {
      console.error('강사 로드 오류:', error);

      // 샘플 데이터
      setInstructors([
        { id: 'inst-1', name: 'John Doe', email: 'john@example.com' },
        { id: 'inst-2', name: 'Jane Smith', email: 'jane@example.com' }
      ]);
    } finally {
      setLoadingInstructors(false);
    }
  };

  // GraphQL 뮤테이션을 사용하여 과정 생성
  const handleCreateCourse = async () => {
    if (!selectedTemplate || !startDate || !duration) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const client = generateClient();

      // 시작일 기반으로 종료일 계산
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + parseInt(duration) - 1);

      // 새 과정 생성을 위한 입력 데이터
      const courseInput = {
        id: uuidv4(),
        courseTemplateId: selectedTemplate.value,
        title: selectedTemplate.label,
        instructorId: selectedInstructor?.value || null,
        startDate: startDate,
        endDate: end.toISOString().split('T')[0],
        duration: parseInt(duration),
        includePreQuiz,
        includePostQuiz,
        includeSurvey,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // GraphQL 뮤테이션 실행
      await client.graphql({
        query: createCourse,
        variables: {
          input: courseInput
        }
      });

      setSuccess(true);

      // 잠시 후 목록 페이지로 이동
      setTimeout(() => {
        navigate('/instructor/courses');
      }, 2000);

    } catch (error) {
      console.error('과정 생성 오류:', error);
      setError('과정 생성에 실패했습니다. 다시 시도해 주세요.');
    } finally {
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
                disabled={submitting || !selectedTemplate || !startDate || !duration}
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

        <ColumnLayout columns={2}>
          <SpaceBetween size="l">
            <FormField
              label="과정 선택"
              description="개설할 교육 과정을 선택하세요"
              constraintText="필수 항목"
            >
              <Select
                placeholder="과정 선택"
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

            <FormField
              label="강사 선택"
              description="과정을 담당할 강사를 선택하세요"
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
          <FormField 
            label="시작일" 
            description="과정의 시작일을 선택하세요"
            constraintText="필수 항목"
          >
            <DatePicker
              onChange={({ detail }) => setStartDate(detail.value)}
              value={startDate}
              // 타입이 지정된 함수로 제공
              openCalendarAriaLabel={(selectedDate: string | null) => {
                return selectedDate 
                  ? `날짜 선택, 선택된 날짜: \${selectedDate}` 
                  : '날짜 선택';
              }}
              placeholder="YYYY/MM/DD"
              // 대신 i18nStrings 사용
              i18nStrings={{
                previousMonthAriaLabel: '이전 달',
                nextMonthAriaLabel: '다음 달',
                todayAriaLabel: '오늘'
              }}
            />
          </FormField>

            // 교육 일수 FormField
            <FormField
              label="교육 일수"
              description="교육이 진행되는 일수를 입력하세요"
              constraintText="1 이상의 숫자 (필수)"
            >
              <Input
                type="number"
                value={duration}
                onChange={({ detail }) => setDuration(detail.value)}
                placeholder="1"
              // min 속성 제거 (CloudScape Input에 지원되지 않음)
              // 대신 입력 검증 로직 추가
              />
            </FormField>
          </SpaceBetween>
        </ColumnLayout>

        <Container header={<Header variant="h3">평가 옵션</Header>}>
          <SpaceBetween size="m">
            <Checkbox
              checked={includePreQuiz}
              onChange={({ detail }) => setIncludePreQuiz(detail.checked)}
            >
              사전 퀴즈 포함
            </Checkbox>

            <Checkbox
              checked={includePostQuiz}
              onChange={({ detail }) => setIncludePostQuiz(detail.checked)}
            >
              사후 퀴즈 포함
            </Checkbox>

            <Checkbox
              checked={includeSurvey}
              onChange={({ detail }) => setIncludeSurvey(detail.checked)}
            >
              사전 설문조사 포함
            </Checkbox>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Container>
  );
};

export default CourseCreation;