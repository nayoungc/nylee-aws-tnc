// pages/CourseHome.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '@utils/i18n-utils';

import {
  Container,
  Header,
  SpaceBetween,
  Box,
  Button,
  Grid,
  Alert,
  Spinner,
  Badge,
  Link,
  ColumnLayout,
  Cards,
  StatusIndicator
} from '@cloudscape-design/components';

// Types
interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  date: string;
  time: string;
  location: string;
  materials: { title: string; url: string; type: string }[];
}

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
  status: 'completed' | 'pending' | 'overdue';
}

const CourseHome: React.FC = () => {
  const navigate = useNavigate();
  const { t, tString, i18n } = useTypedTranslation();
  
  // State management
  const [course, setCourse] = useState<Course | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Initial loading
    loadCourseData();
  }, []);
  
  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      setTimeout(() => {
        // Sample course data - this would come from your API
        setCourse({
          id: 'aws-cloud-essentials',
          title: 'AWS Cloud Essentials Workshop',
          description: 'A hands-on introduction to core AWS services and best practices.',
          instructor: 'Sarah Johnson',
          date: '2023년 10월 18일',
          time: '09:00 - 17:00',
          location: '서울 강남구 테헤란로 231, 캠퍼스 3층',
          materials: [
            { title: '워크샵 슬라이드', url: '/materials/slides.pdf', type: 'pdf' },
            { title: '실습 가이드', url: '/materials/lab-guide.pdf', type: 'pdf' },
            { title: '참고 자료', url: '/materials/references.zip', type: 'zip' },
            { title: 'AWS 계정 생성 가이드', url: '/materials/account-setup.pdf', type: 'pdf' }
          ]
        });
        
        // Sample announcements
        setAnnouncements([
          {
            id: '1',
            title: '워크샵 사전 준비 안내',
            message: '워크샵에 참여하시는 모든 분들은 개인 노트북을 지참해주세요. 실습을 위한 AWS 계정은 현장에서 제공됩니다.',
            type: 'info',
            date: '2023-10-16',
            isImportant: true
          },
          {
            id: '2',
            title: '주차 안내',
            message: '건물 내 주차는 4시간까지 무료입니다. 주차권은 접수처에서 받으실 수 있습니다.',
            type: 'info',
            date: '2023-10-17',
            isImportant: false
          },
          {
            id: '3',
            title: '점심 식사 안내',
            message: '점심 식사는 12시부터 13시까지 제공됩니다. 식이 제한이 있으신 분들은 진행자에게 미리 알려주세요.',
            type: 'success',
            date: '2023-10-17',
            isImportant: false
          }
        ]);
        
        // Sample assessments
        setAssessments([
          {
            id: '1',
            title: '사전 설문조사',
            type: 'survey',
            description: '워크샵 참여자의 경험과 기대를 파악하기 위한 간단한 설문조사입니다.',
            isActive: true,
            estimatedTime: '5분',
            status: 'pending'
          },
          {
            id: '2',
            title: '사전 지식 테스트',
            type: 'pre-quiz',
            description: 'AWS 기본 개념에 대한 이해도를 측정하는 짧은 퀴즈입니다.',
            isActive: true,
            dueDate: '2023-10-18',
            estimatedTime: '10분',
            status: 'pending'
          },
          {
            id: '3',
            title: '사후 평가',
            type: 'post-quiz',
            description: '워크샵 이후 지식 습득을 확인하기 위한 평가입니다.',
            isActive: false,
            estimatedTime: '15분',
            status: 'pending'
          }
        ]);
        
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError('과정 데이터를 불러오는데 실패했습니다. 나중에 다시 시도해주세요.');
      setLoading(false);
    }
  };
  
  const navigateToAssessment = (assessment: Assessment) => {
    if (assessment.isActive) {
      navigate(`/assessment/\${assessment.type}/\${assessment.id}`);
    }
  };
  
  // Loading indicator
  if (loading) {
    return (
      <Box padding="l" textAlign="center">
        <Spinner size="large" />
        <Box padding="s">과정 정보를 불러오는 중...</Box>
      </Box>
    );
  }
  
  // Error display
  if (error || !course) {
    return (
      <Container>
        <Alert type="error" header="과정을 불러올 수 없습니다">
          {error || "과정 정보가 없습니다."}
        </Alert>
      </Container>
    );
  }
  
  // Course detail page rendering
  return (
    <SpaceBetween size="l">
      {/* Course header section */}
      <Container
        header={
          <Header
            variant="h1"
            description={course.description}
          >
            {course.title}
          </Header>
        }
      >
        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          <SpaceBetween size="m">
            <Box variant="awsui-key-label">일시</Box>
            <Box variant="p">{course.date}, {course.time}</Box>
            
            <Box variant="awsui-key-label">장소</Box>
            <Box variant="p">{course.location}</Box>
          </SpaceBetween>
          
          <SpaceBetween size="m">
            <Box variant="awsui-key-label">강사</Box>
            <Box variant="p">{course.instructor}</Box>
            
            <Alert type="info" header="오늘의 과정">
              이 페이지에서는 오늘 진행되는 과정에 관한 모든 정보와 자료를 확인하실 수 있습니다.
            </Alert>
          </SpaceBetween>
        </Grid>
      </Container>
      
      {/* Announcements section */}
      <Container
        header={<Header variant="h2">공지사항</Header>}
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
                      <Badge color="red">중요</Badge>
                    )}
                  </>
                }
              >
                <Box variant="p">{announcement.message}</Box>
                <Box variant="small" color="text-body-secondary">
                  작성일: {new Date(announcement.date).toLocaleDateString()}
                </Box>
              </Alert>
            ))}
          </SpaceBetween>
        ) : (
          <Box textAlign="center" padding="l">
            현재 공지사항이 없습니다.
          </Box>
        )}
      </Container>
      
      {/* Assessments section */}
      <Container
        header={<Header variant="h2">퀴즈 및 설문조사</Header>}
      >
        <Cards
          cardDefinition={{
            header: item => (
              <Box>
                {item.title}
                {getAssessmentStatusBadge(item.status, item.isActive)}
              </Box>
            ),
            sections: [
              {
                id: "description",
                content: item => (
                  <>
                    <Box variant="p">{item.description}</Box>
                    <Box variant="small" padding={{ top: "s" }}>
                      예상 소요시간: {item.estimatedTime}
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
                    disabled={!item.isActive}
                  >
                    {item.status === 'completed' ? '결과 보기' : '시작하기'}
                  </Button>
                )
              }
            ]
          }}
          items={assessments}
          cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 3 }]}
        />
      </Container>
      
      {/* Materials section */}
      <Container 
        header={<Header variant="h2">과정 자료</Header>}
      >
        <ColumnLayout columns={2} variant="text-grid">
          {course.materials.map((material, index) => (
            <Box key={index} padding="s">
              <Link href={material.url} external target="_blank">
                <SpaceBetween direction="horizontal" size="xs">
                  {getFileIcon(material.type)}
                  {material.title}
                </SpaceBetween>
              </Link>
            </Box>
          ))}
        </ColumnLayout>
      </Container>
      
      {/* Schedule section */}
      <Container
        header={<Header variant="h2">일정 안내</Header>}
      >
        <Box padding="m">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eaeded' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>시간</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>내용</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eaeded' }}>
                <td style={{ padding: '10px' }}>09:00 - 09:30</td>
                <td style={{ padding: '10px' }}>등록 및 오리엔테이션</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eaeded' }}>
                <td style={{ padding: '10px' }}>09:30 - 10:30</td>
                <td style={{ padding: '10px' }}>AWS 소개 및 기본 개념</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eaeded' }}>
                <td style={{ padding: '10px' }}>10:30 - 10:45</td>
                <td style={{ padding: '10px' }}>휴식</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eaeded' }}>
                <td style={{ padding: '10px' }}>10:45 - 12:00</td>
                <td style={{ padding: '10px' }}>실습 1: EC2 인스턴스 생성</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eaeded' }}>
                <td style={{ padding: '10px' }}>12:00 - 13:00</td>
                <td style={{ padding: '10px' }}>점심 식사</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eaeded' }}>
                <td style={{ padding: '10px' }}>13:00 - 14:30</td>
                <td style={{ padding: '10px' }}>실습 2: S3 및 스토리지 서비스</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eaeded' }}>
                <td style={{ padding: '10px' }}>14:30 - 14:45</td>
                <td style={{ padding: '10px' }}>휴식</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eaeded' }}>
                <td style={{ padding: '10px' }}>14:45 - 16:30</td>
                <td style={{ padding: '10px' }}>실습 3: 데이터베이스 서비스</td>
              </tr>
              <tr>
                <td style={{ padding: '10px' }}>16:30 - 17:00</td>
                <td style={{ padding: '10px' }}>Q&A 및 마무리</td>
              </tr>
            </tbody>
          </table>
        </Box>
      </Container>
      
      {/* Support information */}
      <Container
        header={<Header variant="h2">문의 및 도움말</Header>}
      >
        <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
          <Box padding="m">
            <SpaceBetween size="m">
              <Box variant="h3">기술적 문의</Box>
              <Box variant="p">
                실습 중 기술적 문제가 있으신 경우 강사에게 문의하거나<br />
                <Link href="mailto:support@example.com">support@example.com</Link>으로 이메일을 보내주세요.
              </Box>
            </SpaceBetween>
          </Box>
          <Box padding="m">
            <SpaceBetween size="m">
              <Box variant="h3">과정 관련 문의</Box>
              <Box variant="p">
                과정 내용이나 일정에 대한 문의는<br />
                <Link href="mailto:training@example.com">training@example.com</Link>으로 연락해 주세요.
              </Box>
            </SpaceBetween>
          </Box>
        </Grid>
      </Container>
    </SpaceBetween>
  );
};

// Helper functions
function getAssessmentStatusBadge(status: string, isActive: boolean) {
  if (!isActive) {
    return <Badge color="grey">준비 중</Badge>;
  }
  
  switch (status) {
    case 'completed':
      return <StatusIndicator type="success">완료됨</StatusIndicator>;
    case 'overdue':
      return <StatusIndicator type="error">기한 초과</StatusIndicator>;
    default:
      return <StatusIndicator type="pending">대기 중</StatusIndicator>;
  }
}

function getFileIcon(type: string) {
  switch (type) {
    case 'pdf':
      return <Box color="text-status-error">📄</Box>;
    case 'zip':
      return <Box color="text-status-info">📦</Box>;
    default:
      return <Box color="text-status-info">📄</Box>;
  }
}

export default CourseHome;