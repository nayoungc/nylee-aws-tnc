// PostQuizPage.tsx - 사후 퀴즈 페이지
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
  Alert,
  ProgressBar,
  Modal,
  Spinner,
  StatusIndicator,
  ColumnLayout,
  Pagination,
  Badge,
  ExpandableSection
} from '@cloudscape-design/components';
import MainLayout from '../../layouts/MainLayout';

// 타입 정의
interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
  correctAnswerId: string;
  explanation: string;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentageScore: number;
  feedbackMessage: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  instructions: string;
  timeLimit: string | null;
  passingScore: number;
  totalQuestions: number;
  questions: QuizQuestion[];
}

interface CourseBasicInfo {
  id: string;
  title: string;
}

const PostQuizPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [courseInfo, setCourseInfo] = useState<CourseBasicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { id } = useParams<{ id: string }>();
  console.log('Post Quiz ID from URL:', id);

  // 퀴즈 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(3);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);


  // 학생 이름 가져오기
  const [studentName, setStudentName] = useState<string>('');

  useEffect(() => {
    // 로컬 스토리지에서 학생 이름 가져오기
    const savedName = localStorage.getItem(`student_name_\${courseId}`);
    if (savedName) {
      setStudentName(savedName);
    }

    // 퀴즈 데이터 로드
    loadQuizData();
  }, [courseId]);

  const loadQuizData = async () => {
    setLoading(true);

    try {
      // 실제 구현에서는 API 호출로 대체
      // 예시 데이터
      setTimeout(() => {
        setCourseInfo({
          id: courseId || 'unknown',
          title: 'AWS Cloud Practitioner Essentials'
        });

        setQuiz({
          id: 'post-quiz-1',
          title: 'Post-Course Knowledge Assessment',
          description: 'This quiz assesses what you have learned during the course.',
          instructions: 'Answer all questions to demonstrate your understanding. A score of 70% or higher is required to pass.',
          timeLimit: '20 minutes',
          passingScore: 70,
          totalQuestions: 10,
          questions: [
            {
              id: 'q1',
              questionText: 'Which AWS service provides resizable compute capacity in the cloud?',
              options: [
                { id: 'a', text: 'Amazon S3' },
                { id: 'b', text: 'Amazon EC2' },
                { id: 'c', text: 'Amazon RDS' },
                { id: 'd', text: 'Amazon DynamoDB' }
              ],
              correctAnswerId: 'b',
              explanation: 'Amazon EC2 (Elastic Compute Cloud) provides resizable compute capacity in the cloud, allowing you to quickly scale computing resources.'
            },
            {
              id: 'q2',
              questionText: 'Which AWS service is primarily used for storing objects?',
              options: [
                { id: 'a', text: 'Amazon EC2' },
                { id: 'b', text: 'Amazon EBS' },
                { id: 'c', text: 'Amazon S3' },
                { id: 'd', text: 'Amazon RDS' }
              ],
              correctAnswerId: 'c',
              explanation: 'Amazon S3 (Simple Storage Service) is an object storage service that offers industry-leading scalability, data availability, security, and performance.'
            },
            {
              id: 'q3',
              questionText: 'Which of the following is NOT an AWS region?',
              options: [
                { id: 'a', text: 'us-east-1' },
                { id: 'b', text: 'eu-west-1' },
                { id: 'c', text: 'ap-southeast-1' },
                { id: 'd', text: 'af-central-1' }
              ],
              correctAnswerId: 'd',
              explanation: 'af-central-1 is not a valid AWS region as of now. The others are valid AWS regions: us-east-1 (N. Virginia), eu-west-1 (Ireland), and ap-southeast-1 (Singapore).'
            },
            {
              id: 'q4',
              questionText: 'What is the AWS service that provides a fully managed NoSQL database?',
              options: [
                { id: 'a', text: 'Amazon RDS' },
                { id: 'b', text: 'Amazon Redshift' },
                { id: 'c', text: 'Amazon DynamoDB' },
                { id: 'd', text: 'Amazon Neptune' }
              ],
              correctAnswerId: 'c',
              explanation: 'Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability.'
            },
            {
              id: 'q5',
              questionText: 'Which AWS service allows you to run code without provisioning or managing servers?',
              options: [
                { id: 'a', text: 'AWS Lambda' },
                { id: 'b', text: 'Amazon EC2' },
                { id: 'c', text: 'AWS Elastic Beanstalk' },
                { id: 'd', text: 'Amazon ECS' }
              ],
              correctAnswerId: 'a',
              explanation: 'AWS Lambda lets you run code without provisioning or managing servers. You pay only for the compute time you consume.'
            },
            {
              id: 'q6',
              questionText: 'Which of the following is a principle of the AWS shared responsibility model?',
              options: [
                { id: 'a', text: 'AWS is responsible for security in the cloud' },
                { id: 'b', text: 'Customers are responsible for security of the cloud' },
                { id: 'c', text: 'AWS is responsible for patching guest OS' },
                { id: 'd', text: 'Customers have no security responsibilities' }
              ],
              correctAnswerId: 'a',
              explanation: 'In the AWS shared responsibility model, AWS is responsible for "security of the cloud" (infrastructure), while customers are responsible for "security in the cloud" (data, applications, etc.).'
            },
            {
              id: 'q7',
              questionText: 'Which AWS service provides a virtual network dedicated to your AWS account?',
              options: [
                { id: 'a', text: 'AWS Direct Connect' },
                { id: 'b', text: 'Amazon CloudFront' },
                { id: 'c', text: 'Amazon VPC' },
                { id: 'd', text: 'AWS Global Accelerator' }
              ],
              correctAnswerId: 'c',
              explanation: 'Amazon VPC (Virtual Private Cloud) lets you provision a logically isolated section of AWS Cloud where you can launch AWS resources in a virtual network that you define.'
            },
            {
              id: 'q8',
              questionText: 'Which AWS service is used for creating and managing databases?',
              options: [
                { id: 'a', text: 'Amazon EC2' },
                { id: 'b', text: 'Amazon RDS' },
                { id: 'c', text: 'Amazon S3' },
                { id: 'd', text: 'Amazon SQS' }
              ],
              correctAnswerId: 'b',
              explanation: 'Amazon RDS (Relational Database Service) makes it easy to set up, operate, and scale a relational database in the cloud.'
            },
            {
              id: 'q9',
              questionText: 'What does the "S" in AWS S3 stand for?',
              options: [
                { id: 'a', text: 'Simple' },
                { id: 'b', text: 'Storage' },
                { id: 'c', text: 'Service' },
                { id: 'd', text: 'Secure' }
              ],
              correctAnswerId: 'a',
              explanation: 'S3 stands for Simple Storage Service. It provides object storage through a web service interface.'
            },
            {
              id: 'q10',
              questionText: 'Which AWS service provides a managed Kubernetes service?',
              options: [
                { id: 'a', text: 'Amazon ECS' },
                { id: 'b', text: 'Amazon EC2' },
                { id: 'c', text: 'AWS Fargate' },
                { id: 'd', text: 'Amazon EKS' }
              ],
              correctAnswerId: 'd',
              explanation: 'Amazon EKS (Elastic Kubernetes Service) is a managed Kubernetes service that makes it easy to run Kubernetes on AWS without needing to install and operate your own Kubernetes clusters.'
            }
          ]
        });

        setLoading(false);
      }, 1000);

    } catch (err) {
      setError('Failed to load quiz data. Please try again later.');
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const isQuizComplete = () => {
    if (!quiz) return false;
    return Object.keys(answers).length === quiz.questions.length;
  };

  const getCompletionPercentage = () => {
    if (!quiz) return 0;
    return Math.round((Object.keys(answers).length / quiz.questions.length) * 100);
  };

  const getCurrentPageQuestions = () => {
    if (!quiz) return [];

    const indexOfLastQuestion = currentPage * questionsPerPage;
    const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;

    return quiz.questions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  };

  const calculateResult = () => {
    if (!quiz) return null;

    let correctCount = 0;
    quiz.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswerId) {
        correctCount++;
      }
    });

    const percentageScore = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = percentageScore >= quiz.passingScore;

    let feedbackMessage = '';
    if (percentageScore >= 90) {
      feedbackMessage = 'Excellent! You have demonstrated a thorough understanding of the course material.';
    } else if (percentageScore >= 70) {
      feedbackMessage = 'Great job! You have a good understanding of the course material.';
    } else {
      feedbackMessage = 'You may want to review some topics to strengthen your understanding.';
    }

    return {
      score: percentageScore,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      percentageScore,
      passed,
      feedbackMessage
    };
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // 결과 계산
      const result = calculateResult();

      // 실제 구현에서는 API 호출로 제출
      setTimeout(() => {
        console.log('Post-Quiz submitted:', {
          quizId: quiz?.id,
          courseId,
          studentName,
          answers,
          result
        });

        setQuizResult(result);
        setSubmitting(false);
        setShowResults(true);
      }, 1500);

    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  const navigateBack = () => {
    navigate(`/student/\${courseId}`);
  };

  // 로딩 상태 처리
  if (loading) {
    return (
      <Box padding="l" textAlign="center">
        <Spinner size="large" />
        <Box padding="s">Loading quiz questions...</Box>
      </Box>
    );
  }
  
  // 오류 상태 처리
  if (error) {
    return (
      <Container>
        <Alert type="error" header="Failed to load quiz">
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
      <Box padding="xxl" textAlign="center">
        <Box variant="h1">Thank You!</Box>
        {/* ... */}
      </Box>
    );
  }
  
  // 메인 UI 반환
  return (
    <>
      {/* 퀴즈 탈출 확인 모달 */}
      <Modal
        visible={showConfirmExit}
        onDismiss={() => setShowConfirmExit(false)}
        header="Leave Quiz?"
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
  
      {/* 퀴즈 제출 확인 모달 */}
      <Modal
        visible={showSubmitConfirm}
        onDismiss={() => setShowSubmitConfirm(false)}
        header="Submit Quiz?"
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
        Are you sure you want to submit your answers? You won't be able to change them after submission.
        {
          !isQuizComplete() && (
            <Box padding={{ top: 's' }} color="text-status-warning">
              <strong>Warning:</strong> You have not answered all questions. Unanswered questions will be marked as incorrect.
            </Box>
          )
        }
      </Modal>
  
      <SpaceBetween size="l">
        {/* 헤더 컨테이너 */}
        <Container
          header={
            <Header
              variant="h1"
              description={quiz?.description}
              info={
                <SpaceBetween size="xs">
                  {quiz?.timeLimit && <Box>Estimated time: {quiz.timeLimit}</Box>}
                  {quiz?.passingScore && <Box>Passing score: {quiz.passingScore}%</Box>}
                </SpaceBetween>
              }
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button onClick={() => setShowConfirmExit(true)}>Cancel</Button>
                  <Button
                    variant="primary"
                    onClick={() => setShowSubmitConfirm(true)}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </SpaceBetween>
              }
            >
              {quiz?.title} - {courseInfo?.title}
            </Header>
          }
        >
          <SpaceBetween size="l">
            <Alert type="info">
              {quiz?.instructions}
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
                    description={`\${Object.keys(answers).length} of \${quiz?.questions.length} questions answered`}
                  />
                  <StatusIndicator type={isQuizComplete() ? "success" : "in-progress"}>
                    {isQuizComplete() ? "Ready to submit" : "Some questions are still unanswered"}
                  </StatusIndicator>
                </SpaceBetween>
              </div>
            </ColumnLayout>
          </SpaceBetween>
        </Container>
  
        {/* 퀴즈 질문 */}
        <Container
          header={
            <Header
              variant="h2"
              counter={`Page \${currentPage} of \${Math.ceil((quiz?.questions.length || 0) / questionsPerPage)}`}
            >
              Quiz Questions
            </Header>
          }
        >
          <SpaceBetween size="xl">
            {getCurrentPageQuestions().map((question, index) => (
              <FormField
                key={question.id}
                label={`\${(currentPage - 1) * questionsPerPage + index + 1}. \${question.questionText}`}
                errorText={!answers[question.id] && "This question is not answered yet"}
              >
                <RadioGroup
                  items={question.options.map(option => ({
                    value: option.id,
                    label: option.text
                  }))}
                  value={answers[question.id] || ''}
                  onChange={({ detail }) => handleAnswer(question.id, detail.value)}
                />
              </FormField>
            ))}
  
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Pagination
                currentPageIndex={currentPage}
                pagesCount={Math.ceil((quiz?.questions.length || 0) / questionsPerPage)}
                onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
              />
              {currentPage === Math.ceil((quiz?.questions.length || 0) / questionsPerPage) && (
                <Button
                  variant="primary"
                  disabled={submitting}
                  onClick={() => setShowSubmitConfirm(true)}
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              )}
            </SpaceBetween>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </>
  );
}
export default PostQuizPage;