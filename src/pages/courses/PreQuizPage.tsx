// PreQuizPage.tsx - 사전 퀴즈 페이지
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  SpaceBetween,
  Box,
  Button,
  Alert,
  Modal,
  Spinner,
} from '@cloudscape-design/components';

// 타입 정의
interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
  correctAnswerId?: string; // 사전 퀴즈에서는 정답을 보여주지 않음
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  instructions: string;
  timeLimit: string | null;
  totalQuestions: number;
  questions: QuizQuestion[];
}

interface CourseBasicInfo {
  id: string;
  title: string;
}

const PreQuizPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [courseInfo, setCourseInfo] = useState<CourseBasicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const { id } = useParams<{ id: string }>();


  // 퀴즈 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(3);
  const [answers, setAnswers] = useState<Record<string, string>>({});

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
    console.log('Loading quiz data for ID:', id);


    try {
      // 실제 구현에서는 API 호출로 대체
      // 예시 데이터
      setTimeout(() => {
        setCourseInfo({
          id: courseId || 'unknown',
          title: 'AWS Cloud Practitioner Essentials'
        });

        setQuiz({
          id: 'pre-quiz-1',
          title: 'Pre-Course Knowledge Assessment',
          description: 'This quiz assesses your current knowledge of AWS services and concepts.',
          instructions: 'Answer all questions to the best of your ability. Your results will help us tailor the course to your needs. This pre-quiz is for assessment only - your score will not affect your course completion.',
          timeLimit: '15 minutes',
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
              ]
            },
            {
              id: 'q2',
              questionText: 'Which AWS service is primarily used for storing objects?',
              options: [
                { id: 'a', text: 'Amazon EC2' },
                { id: 'b', text: 'Amazon EBS' },
                { id: 'c', text: 'Amazon S3' },
                { id: 'd', text: 'Amazon RDS' }
              ]
            },
            {
              id: 'q3',
              questionText: 'Which of the following is NOT an AWS region?',
              options: [
                { id: 'a', text: 'us-east-1' },
                { id: 'b', text: 'eu-west-1' },
                { id: 'c', text: 'ap-southeast-1' },
                { id: 'd', text: 'af-central-1' }
              ]
            },
            {
              id: 'q4',
              questionText: 'What is the AWS service that provides a fully managed NoSQL database?',
              options: [
                { id: 'a', text: 'Amazon RDS' },
                { id: 'b', text: 'Amazon Redshift' },
                { id: 'c', text: 'Amazon DynamoDB' },
                { id: 'd', text: 'Amazon Neptune' }
              ]
            },
            {
              id: 'q5',
              questionText: 'Which AWS service allows you to run code without provisioning or managing servers?',
              options: [
                { id: 'a', text: 'AWS Lambda' },
                { id: 'b', text: 'Amazon EC2' },
                { id: 'c', text: 'AWS Elastic Beanstalk' },
                { id: 'd', text: 'Amazon ECS' }
              ]
            },
            {
              id: 'q6',
              questionText: 'Which of the following is a principle of the AWS shared responsibility model?',
              options: [
                { id: 'a', text: 'AWS is responsible for security in the cloud' },
                { id: 'b', text: 'Customers are responsible for security of the cloud' },
                { id: 'c', text: 'AWS is responsible for patching guest OS' },
                { id: 'd', text: 'Customers have no security responsibilities' }
              ]
            },
            {
              id: 'q7',
              questionText: 'Which AWS service provides a virtual network dedicated to your AWS account?',
              options: [
                { id: 'a', text: 'AWS Direct Connect' },
                { id: 'b', text: 'Amazon CloudFront' },
                { id: 'c', text: 'Amazon VPC' },
                { id: 'd', text: 'AWS Global Accelerator' }
              ]
            },
            {
              id: 'q8',
              questionText: 'Which AWS service is used for creating and managing databases?',
              options: [
                { id: 'a', text: 'Amazon EC2' },
                { id: 'b', text: 'Amazon RDS' },
                { id: 'c', text: 'Amazon S3' },
                { id: 'd', text: 'Amazon SQS' }
              ]
            },
            {
              id: 'q9',
              questionText: 'What does the "S" in AWS S3 stand for?',
              options: [
                { id: 'a', text: 'Simple' },
                { id: 'b', text: 'Storage' },
                { id: 'c', text: 'Service' },
                { id: 'd', text: 'Secure' }
              ]
            },
            {
              id: 'q10',
              questionText: 'Which AWS service provides a managed Kubernetes service?',
              options: [
                { id: 'a', text: 'Amazon ECS' },
                { id: 'b', text: 'Amazon EC2' },
                { id: 'c', text: 'AWS Fargate' },
                { id: 'd', text: 'Amazon EKS' }
              ]
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

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // 실제 구현에서는 API 호출로 대체
      // 예시 데이터 제출 시뮬레이션
      setTimeout(() => {
        console.log('Pre-Quiz submitted:', {
          quizId: quiz?.id,
          courseId,
          studentName,
          answers
        });

        setSubmitting(false);
        setShowThankYou(true);
      }, 1500);

    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
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
        <Box padding="s">Loading quiz questions...</Box>
      </Box>
    );
  }

  // 오류 표시
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
      <Container>
        <Box padding="xxl" textAlign="center">
          <Box variant="h1">Thank You!</Box>
          <Box variant="p" padding="l">
            Your pre-course assessment has been recorded. This information will help us
            understand your current knowledge level and tailor the course accordingly.
          </Box>
          <Box variant="p" padding="l">
            <i>Note: For this pre-course assessment, we do not provide the answers or scores immediately.
              This allows us to get an unbiased measure of your current knowledge level.</i>
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
    </Modal>

      <SpaceBetween size="l">
        {/* 나머지 내용 */}
        {/* ... */}
      </SpaceBetween>
    </>
  );
}
  export default PreQuizPage;