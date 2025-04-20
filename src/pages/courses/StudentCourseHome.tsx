// pages/student/CourseHome
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Header,
  SpaceBetween,
  Box,
  Button,
  Cards,
  ColumnLayout,
  Alert,
  Modal,
  FormField,
  Input,
  Spinner,
  Grid,
  Badge,
  ExpandableSection,
  Link
} from '@cloudscape-design/components';
import MainLayout from '../../layouts/MainLayout';

// 타입 정의
interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  date: string;
  isImportant: boolean;
}

interface Assessment {
  id: string;
  title: string;
  type: 'survey' | 'pre-quiz' | 'post-quiz';
  description: string;
  isActive: boolean;
  dueDate?: string;
  estimatedTime: string;
}

interface Instructor {
  name: string;
  title: string;
  imageUrl?: string;
}

interface Session {
  title: string;
  date: string;
  time: string;
  topics: string[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructors: Instructor[];
  sessions: Session[];
  materials: { title: string; url: string }[];
}

const StudentCourseHome: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeAssessments, setActiveAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 학생 이름 관리
  const [studentName, setStudentName] = useState<string>('');
  const [studentEmail, setStudentEmail] = useState<string>('');
  const [showNameInput, setShowNameInput] = useState(false);
  
  useEffect(() => {
    // 이름이 저장되어 있는지 확인
    const savedName = localStorage.getItem(`student_name_\${courseId}`);
    const savedEmail = localStorage.getItem(`student_email_\${courseId}`);
    
    if (savedName) {
      setStudentName(savedName);
      if (savedEmail) setStudentEmail(savedEmail);
    } else {
      setShowNameInput(true);
    }
    
    // 과정 데이터 로드
    loadCourseData();
  }, [courseId]);
  
  const loadCourseData = async () => {
    setLoading(true);
    
    try {
      // 실제 구현에서는 API 호출로 대체
      // 예시 데이터
      setTimeout(() => {
        // 예시 과정 데이터
        if (courseId) {
          setCourse({
            id: courseId,
            title: 'AWS Cloud Practitioner Essentials',
            description: 'This course is designed to help you understand AWS Cloud concepts, AWS services, security, architecture, pricing, and support.',
            instructors: [
              {
                name: 'Jane Smith',
                title: 'AWS Certified Trainer',
                imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
              },
              {
                name: 'Michael Johnson',
                title: 'Cloud Solutions Architect',
                imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
              }
            ],
            sessions: [
              {
                title: 'Day 1: Introduction to Cloud Computing and AWS',
                date: 'April 20, 2025',
                time: '9:00 AM - 5:00 PM',
                topics: ['Cloud Computing Concepts', 'AWS Global Infrastructure', 'Core AWS Services']
              },
              {
                title: 'Day 2: Security, Architecture, and Support',
                date: 'April 21, 2025',
                time: '9:00 AM - 5:00 PM',
                topics: ['AWS Security', 'AWS Architecture', 'Pricing and Support']
              }
            ],
            materials: [
              { title: 'Course Slides', url: '#slides' },
              { title: 'AWS Documentation', url: 'https://docs.aws.amazon.com' },
              { title: 'Practice Labs', url: '#labs' }
            ]
          });
          
          // 예시 공지사항
          setAnnouncements([
            {
              id: '1',
              title: 'Welcome to the course!',
              message: 'We\'re excited to have you join our AWS Cloud Practitioner course. Please complete the pre-course survey and quiz before our first session.',
              type: 'info',
              date: '2025-04-15',
              isImportant: true
            },
            {
              id: '2',
              title: 'Pre-course materials now available',
              message: 'Access your pre-course materials in the Materials section. These will help you prepare for our first session.',
              type: 'success',
              date: '2025-04-16',
              isImportant: false
            }
          ]);
          
          // 예시 활성화된 평가
          setActiveAssessments([
            {
              id: '1',
              title: 'Pre-Course Survey',
              type: 'survey',
              description: 'Please complete this brief survey to help us understand your experience level and expectations for the course.',
              isActive: true,
              estimatedTime: '5 minutes'
            },
            {
              id: '2',
              title: 'Pre-Course Knowledge Assessment',
              type: 'pre-quiz',
              description: 'This quiz helps us gauge your current knowledge of AWS services and adapt our teaching accordingly.',
              isActive: true,
              dueDate: '2025-04-19',
              estimatedTime: '15 minutes'
            }
          ]);
          
          setLoading(false);
        } else {
          setError('Course ID not provided');
          setLoading(false);
        }
      }, 1000);
      
    } catch (err) {
      setError('Failed to load course data. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleNameSubmit = () => {
    if (studentName.trim()) {
      localStorage.setItem(`student_name_\${courseId}`, studentName);
      if (studentEmail) {
        localStorage.setItem(`student_email_\${courseId}`, studentEmail);
      }
      setShowNameInput(false);
    }
  };
  
  const navigateToAssessment = (assessment: Assessment) => {
    navigate(`/student/\${courseId}/\${assessment.type}`);
  };
  
  // 로딩 중 표시
  if (loading) {
    return (
      <MainLayout title="Loading Course...">
        <Box padding="l" textAlign="center">
          <Spinner size="large" />
          <Box padding="s">Loading course information...</Box>
        </Box>
      </MainLayout>
    );
  }
  
  // 오류 표시
  if (error) {
    return (
      <MainLayout title="Error">
        <Container>
          <Alert type="error" header="Failed to load course">
            {error}
            <Box padding={{ top: 'm' }}>
              <Button onClick={() => navigate('/courses')}>
                Back to Courses
              </Button>
            </Box>
          </Alert>
        </Container>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout title={course?.title || "Course Home"}>
      {/* 이름 입력 모달 */}
      <Modal
        visible={showNameInput}
        closeAriaLabel="Close modal"
        onDismiss={() => {}} // 닫기 방지 (필수 입력)
        header="Welcome to the Course"
        footer={
          <Box float="right">
            <Button 
              variant="primary" 
              onClick={handleNameSubmit}
              disabled={!studentName.trim()}
            >
              Continue
            </Button>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box variant="p">
            Please provide your name so we can track your progress in this course.
          </Box>
          <FormField label="Your Name*" constraintText="Required">
            <Input 
              value={studentName}
              onChange={({ detail }) => setStudentName(detail.value)}
              placeholder="Enter your full name"
              autoFocus
            />
          </FormField>
          <FormField label="Email Address (Optional)" constraintText="We'll use this to send you course updates">
            <Input 
              value={studentEmail}
              onChange={({ detail }) => setStudentEmail(detail.value)}
              placeholder="Enter your email address"
              type="email"
            />
          </FormField>
        </SpaceBetween>
      </Modal>
      
      <SpaceBetween size="l">
        {/* 환영 섹션 */}
        <Container
          header={
            <Header
              variant="h1"
              description={course?.description}
              actions={
                <Button iconName="user-profile" variant="normal">
                  {studentName ? `Welcome, \${studentName}` : 'Update Profile'}
                </Button>
              }
            >
              {course?.title}
            </Header>
          }
        >
          <Box padding="m">
            <Alert type="info" header="Getting Started">
              <p>Welcome to your course home page! Here you can:</p>
              <ul>
                <li>View important announcements</li>
                <li>Access course materials</li>
                <li>Complete assessments when they become available</li>
                <li>Check the course schedule and details</li>
              </ul>
            </Alert>
          </Box>
        </Container>
        
        {/* 공지사항 섹션 */}
        <Container
          header={<Header variant="h2">Announcements</Header>}
        >
          {announcements.length > 0 ? (
            <SpaceBetween size="m">
              {announcements.map(announcement => (
                <Alert 
                  key={announcement.id}
                  type={announcement.type}
                  header={
                    <>
                      {announcement.title} 
                      {announcement.isImportant && (
                        <Badge color="red">Important</Badge>
                      )}
                    </>
                  }
                >
                  <Box variant="p">{announcement.message}</Box>
                  <Box variant="small" color="text-body-secondary">
                    Posted on: {new Date(announcement.date).toLocaleDateString()}
                  </Box>
                </Alert>
              ))}
            </SpaceBetween>
          ) : (
            <Box textAlign="center" padding="l">
              No announcements at this time.
            </Box>
          )}
        </Container>
        
        {/* 활성화된 평가 도구 */}
        <Container
          header={
            <Header 
              variant="h2"
              description="Complete these assessments when activated by your instructor"
            >
              Available Assessments
            </Header>
          }
        >
          {activeAssessments.length > 0 ? (
            <Cards
              cardDefinition={{
                header: item => (
                  <Box>
                    {item.title}
                    {item.dueDate && (
                      <Box float="right" color="text-body-secondary">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </Box>
                    )}
                  </Box>
                ),
                sections: [
                  {
                    id: "description",
                    content: item => (
                      <>
                        <Box variant="p">{item.description}</Box>
                        <Box variant="small" padding={{ top: "s" }}>
                          Estimated time: {item.estimatedTime}
                        </Box>
                      </>
                    )
                  },
                  {
                    id: "action",
                    content: item => (
                      <Button 
                        variant="primary"
                        onClick={() => navigateToAssessment(item)}
                      >
                        Start Now
                      </Button>
                    )
                  }
                ]
              }}
              items={activeAssessments}
              cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 2 }]}
            />
          ) : (
            <Box textAlign="center" padding="l">
              No assessments are currently available. 
              The instructor will activate them when ready.
            </Box>
          )}
        </Container>
        
        {/* 세션 및 일정 */}
        <Container
          header={<Header variant="h2">Course Schedule</Header>}
        >
          <SpaceBetween size="l">
            {course?.sessions.map((session, index) => (
              <Container
                key={index}
                header={<Header variant="h3">{session.title}</Header>}
              >
                <Grid gridDefinition={[{ colspan: 4 }, { colspan: 8 }]}>
                  <SpaceBetween size="s">
                    <Box variant="h4">Date & Time</Box>
                    <Box variant="p">{session.date}</Box>
                    <Box variant="p">{session.time}</Box>
                  </SpaceBetween>
                  
                  <SpaceBetween size="s">
                    <Box variant="h4">Topics</Box>
                    <ul>
                      {session.topics.map((topic, i) => (
                        <li key={i}>{topic}</li>
                      ))}
                    </ul>
                  </SpaceBetween>
                </Grid>
              </Container>
            ))}
          </SpaceBetween>
        </Container>
        
        {/* 강사 정보 */}
        <Container
          header={<Header variant="h2">Instructors</Header>}
        >
          <Grid
            gridDefinition={course?.instructors.map(() => ({ colspan: { default: 12, xxs: 6 } }))}
          >
            {course?.instructors.map((instructor, index) => (
              <Box key={index} padding="m" textAlign="center">
                {instructor.imageUrl && (
                  <Box padding="s">
                    <img
                      src={instructor.imageUrl}
                      alt={instructor.name}
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                )}
                <Box variant="h3" padding={{ top: 's' }}>{instructor.name}</Box>
                <Box variant="p">{instructor.title}</Box>
              </Box>
            ))}
          </Grid>
        </Container>
        
        {/* 학습 자료 */}
        <Container header={<Header variant="h2">Course Materials</Header>}>
          {course?.materials && course.materials.length > 0 ? (
            <SpaceBetween size="s">
              {course.materials.map((material, index) => (
                <Box key={index}>
                  <Link href={material.url} external target="_blank">
                    {material.title}
                  </Link>
                </Box>
              ))}
            </SpaceBetween>
          ) : (
            <Box textAlign="center" padding="l">
              No materials have been shared yet.
            </Box>
          )}
        </Container>
        
        {/* 도움말 섹션 */}
        <Container header={<Header variant="h2">Need Help?</Header>}>
          <ExpandableSection headerText="How to contact the instructors">
            <Box variant="p">
              If you have questions about the course content, please email your instructors at:
              <Box variant="code" padding="s">instructors@example.com</Box>
            </Box>
          </ExpandableSection>
          
          <ExpandableSection headerText="Technical support">
            <Box variant="p">
              For technical issues with the platform, please contact support at:
              <Box variant="code" padding="s">support@example.com</Box>
            </Box>
          </ExpandableSection>
        </Container>
      </SpaceBetween>
    </MainLayout>
  );
};

export default StudentCourseHome;