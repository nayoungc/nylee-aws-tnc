import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Header,
  SpaceBetween,
  Box,
  Button,
  FormField,
  RadioGroup,
  Textarea,
  Alert,
  ProgressBar,
  ColumnLayout,
  Cards,
  Modal,
  Select,
  Spinner,
  StatusIndicator
} from '@cloudscape-design/components';
import MainLayout from '../../layouts/MainLayout';

// 타입 정의
interface SurveyQuestion {
  id: string;
  questionText: string;
  type: 'radio' | 'text' | 'select';
  options?: { value: string; label: string }[];
  required: boolean;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  instructions: string;
  estimatedTime: string;
  questions: SurveyQuestion[];
}

interface CourseBasicInfo {
  id: string;
  title: string;
}

const SurveyPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [courseInfo, setCourseInfo] = useState<CourseBasicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const { id } = useParams<{ id: string }>();
  console.log('Loading survey data for ID:', id);



  // 답변 상태
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // 학생 이름 가져오기
  const [studentName, setStudentName] = useState<string>('');

  useEffect(() => {
    // 로컬 스토리지에서 학생 이름 가져오기
    const savedName = localStorage.getItem(`student_name_\${courseId}`);
    if (savedName) {
      setStudentName(savedName);
    }

    // 설문조사 데이터 로드
    loadSurveyData();
  }, [courseId]);

  const loadSurveyData = async () => {
    setLoading(true);


    try {
      // 실제 구현에서는 API 호출로 대체
      setTimeout(() => {
        setCourseInfo({
          id: courseId || 'unknown',
          title: 'AWS Cloud Practitioner Essentials'
        });

        setSurvey({
          id: 'pre-survey-1',
          title: 'Pre-Course Survey',
          description: 'Please complete this brief survey to help us tailor the course to your needs.',
          instructions: 'This survey should take about 5 minutes to complete. Your responses will be kept confidential and used only to improve your learning experience.',
          estimatedTime: '5 minutes',
          questions: [
            {
              id: 'q1',
              questionText: 'How would you rate your current knowledge of AWS services?',
              type: 'radio',
              options: [
                { value: '1', label: 'No knowledge' },
                { value: '2', label: 'Basic understanding' },
                { value: '3', label: 'Some experience' },
                { value: '4', label: 'Proficient' },
                { value: '5', label: 'Expert' }
              ],
              required: true
            },
            {
              id: 'q2',
              questionText: 'Which AWS services have you used before? (select all that apply)',
              type: 'select',
              options: [
                { value: 'none', label: 'None' },
                { value: 'ec2', label: 'Amazon EC2' },
                { value: 's3', label: 'Amazon S3' },
                { value: 'rds', label: 'Amazon RDS' },
                { value: 'lambda', label: 'AWS Lambda' },
                { value: 'dynamodb', label: 'Amazon DynamoDB' },
                { value: 'other', label: 'Others (please specify in comments)' }
              ],
              required: true
            },
            {
              id: 'q3',
              questionText: 'What specific topics or areas are you most interested in learning about?',
              type: 'text',
              required: false
            },
            {
              id: 'q4',
              questionText: 'What is your primary goal for taking this course?',
              type: 'radio',
              options: [
                { value: 'certification', label: 'Prepare for AWS certification' },
                { value: 'job', label: 'Improve job skills' },
                { value: 'project', label: 'Support specific project' },
                { value: 'general', label: 'General interest' },
                { value: 'other', label: 'Other' }
              ],
              required: true
            },
            {
              id: 'q5',
              questionText: 'Any additional comments or specific areas you would like the instructor to focus on?',
              type: 'text',
              required: false
            }
          ]
        });

        setLoading(false);
      }, 1000);

    } catch (err) {
      setError('Failed to load survey data. Please try again later.');
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isFormValid = () => {
    // 필수 질문이 모두 답변되었는지 확인
    if (!survey) return false;

    const requiredQuestions = survey.questions.filter(q => q.required);
    return requiredQuestions.every(q => answers[q.id] && answers[q.id].trim() !== '');
  };

  const getCompletionPercentage = () => {
    if (!survey) return 0;

    const answeredCount = Object.keys(answers).length;
    const totalRequired = survey.questions.filter(q => q.required).length;

    if (totalRequired === 0) return 100;

    // 답변된 필수 질문 수 계산
    const answeredRequired = survey.questions
      .filter(q => q.required && answers[q.id] && answers[q.id].trim() !== '')
      .length;

    return Math.round((answeredRequired / totalRequired) * 100);
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // 실제 구현에서는 API 호출로 대체
      // 예시 데이터 제출 시뮬레이션
      setTimeout(() => {
        console.log('Survey submitted:', {
          surveyId: survey?.id,
          courseId,
          studentName,
          answers
        });

        setSubmitting(false);
        setShowThankYou(true);
      }, 1500);

    } catch (err) {
      setError('Failed to submit survey. Please try again.');
      setSubmitting(false);
    }
  };

  const navigateBack = () => {
    navigate(`/student/\${courseId}`);
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <Box padding="l" textAlign="center">
        <Spinner size="large" />
        <Box padding="s">Loading survey questions...</Box>
      </Box>
    );
  }

  // 오류 표시
  if (error) {
    return (
      <Container>
        <Alert type="error" header="Failed to load survey">
          {error}
          <Box padding={{ top: 'm' }}>
            <Button onClick={() => navigate(`/student/\${courseId}`)}>
              Return to Course Home
            </Button>
          </Box>
        </Alert>
      </Container>
    );
  }

  // 감사 페이지 표시
  if (showThankYou) {
    return (
      <Container>
        <Box padding="xxl" textAlign="center">
          <Box variant="h1">Thank You!</Box>
          <Box variant="p" padding="l">
            Your responses have been recorded. This information will help us
            tailor the course to better meet your needs.
          </Box>
          <Button
            variant="primary"
            onClick={() => navigate(`/student/\${courseId}`)}
          >
            Return to Course Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      {/* 설문 탈출 확인 모달 */}
      <Modal
        visible={showConfirmExit}
        onDismiss={() => setShowConfirmExit(false)}
        header="Leave Survey?"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowConfirmExit(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={navigateBack}>
                Leave
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        Your progress will not be saved. Are you sure you want to leave?
      </Modal>

      {/* 설문 제출 확인 모달 */}
      <Modal
        visible={showSubmitConfirm}
        onDismiss={() => setShowSubmitConfirm(false)}
        header="Submit Survey?"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowSubmitConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleSubmit();
                }}
              >
                Submit
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        Are you sure you want to submit your responses? You won't be able to change them after submission.
      </Modal>

      <SpaceBetween size="l">
        {/* 헤더 컨테이너 */}
        <Container
          header={
            <Header
              variant="h1"
              description={survey?.description}
              info={<Box>Estimated time: {survey?.estimatedTime}</Box>}
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button onClick={() => setShowConfirmExit(true)}>Cancel</Button>
                  <Button
                    variant="primary"
                    disabled={!isFormValid() || submitting}
                    onClick={() => setShowSubmitConfirm(true)}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </SpaceBetween>
              }
            >
              {survey?.title} - {courseInfo?.title}
            </Header>
          }
        >
          <SpaceBetween size="l">
            <Alert type="info">
              {survey?.instructions}
            </Alert>

            <ColumnLayout columns={2} variant="text-grid">
              <div>
                <Box variant="h3">Completion Status:</Box>
              </div>
              <div>
                <SpaceBetween size="s">
                  <ProgressBar
                    value={getCompletionPercentage()}
                    label={`\${getCompletionPercentage()}% complete`}
                    description={`\${Object.keys(answers).filter(key => {
                      const question = survey?.questions.find(q => q.id === key);
                      return question?.required && answers[key] && answers[key].trim() !== '';
                    }).length} of \${survey?.questions.filter(q => q.required).length} required questions answered`}
                  />
                  <StatusIndicator type={isFormValid() ? "success" : "in-progress"}>
                    {isFormValid() ? "Ready to submit" : "Please answer all required questions"}
                  </StatusIndicator>
                </SpaceBetween>
              </div>
            </ColumnLayout>
          </SpaceBetween>
        </Container>

        {/* 설문 질문 */}
        <Container
          header={<Header variant="h2">Survey Questions</Header>}
        >
          <SpaceBetween size="xl">
            {survey?.questions.map((question, index) => (
              <FormField
                key={question.id}
                label={`\${index + 1}. \${question.questionText}`}
                constraintText={question.required ? "Required" : "Optional"}
                errorText={question.required && !answers[question.id] && "This question requires an answer"}
              >
                {question.type === 'radio' && question.options && (
                  <RadioGroup
                    items={question.options}
                    value={answers[question.id] || ''}
                    onChange={({ detail }) => handleAnswer(question.id, detail.value)}
                  />
                )}
                {question.type === 'text' && (
                  <Textarea
                    value={answers[question.id] || ''}
                    onChange={({ detail }) => handleAnswer(question.id, detail.value)}
                    placeholder="Enter your response here"
                  />
                )}
                {question.type === 'select' && question.options && (
                  <Select
                    selectedOption={
                      answers[question.id]
                        ? { value: answers[question.id], label: question.options.find(o => o.value === answers[question.id])?.label || '' }
                        : null
                    }
                    onChange={({ detail }) => {
                      if (detail.selectedOption) {
                        handleAnswer(question.id, detail.selectedOption.value || '');
                      }
                    }}
                    options={question.options}
                    placeholder="Select an option"
                  />
                )}
              </FormField>
            ))}

            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Button onClick={() => setShowConfirmExit(true)}>Cancel</Button>
              <Button
                variant="primary"
                disabled={!isFormValid() || submitting}
                onClick={() => setShowSubmitConfirm(true)}
              >
                {submitting ? 'Submitting...' : 'Submit Survey'}
              </Button>
            </SpaceBetween>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </>
  );
}

export default SurveyPage;