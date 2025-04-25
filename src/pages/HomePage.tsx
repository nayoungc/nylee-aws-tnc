import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppLayout,
  ContentLayout,
  Container,
  Header,
  Button,
  SpaceBetween,
  Box,
} from '@cloudscape-design/components';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { logout, userInfo, isAdmin, isInstructor } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const userRole = isAdmin ? '관리자' : (isInstructor ? '강사' : '사용자');

  return (
    <AppLayout
      content={
        <ContentLayout
          header={
            <Header
              variant="h1"
              actions={
                <Button variant="primary" onClick={handleLogout}>
                  로그아웃
                </Button>
              }
            >
              AWS T&C 교육 정보 대시보드
            </Header>
          }
        >
          <SpaceBetween size="l">
            <Container
              header={
                <Header variant="h2">
                  환영합니다!
                </Header>
              }
            >
              <Box>
                <p><strong>사용자:</strong> {userInfo?.attributes?.name || userInfo?.user?.username}</p>
                <p><strong>권한:</strong> {userRole}</p>
              </Box>
            </Container>
            
            <Container
              header={
                <Header variant="h2">
                  관리 기능
                </Header>
              }
            >
              <SpaceBetween direction="horizontal" size="s">
                <Button onClick={() => navigate('/courses')}>과정 관리</Button>
                <Button onClick={() => navigate('/quizzes')}>퀴즈 관리</Button>
                <Button onClick={() => navigate('/surveys')}>설문조사 관리</Button>
                {isAdmin && (
                  <Button onClick={() => navigate('/users')}>사용자 관리</Button>
                )}
              </SpaceBetween>
            </Container>
          </SpaceBetween>
        </ContentLayout>
      }
      navigationHide
      toolsHide
    />
  );
};

export default Home;