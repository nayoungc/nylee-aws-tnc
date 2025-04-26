import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ContentLayout,
  Container,
  Header,
  Button,
  SpaceBetween,
  Box,
  Cards,
  Link,
  Icon
} from '@cloudscape-design/components';
import { useAuth } from '@hooks/useAuth';
import MainLayout from '@components/layout/MainLayout';

// IconProps에서 지원하는 Name 타입 지정
import { IconProps } from '@cloudscape-design/components/icon';
type IconName = IconProps['name'];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user, loading } = useAuth();

  const isAdmin = user?.attributes?.['custom:role'] === 'admin';
  const isInstructor = user?.attributes?.['custom:role'] === 'instructor';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const userRole = isAdmin ? '관리자' : (isInstructor ? '강사' : '사용자');

  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 관리 기능 카드 정의 - 아이콘 이름을 정확한 IconName 타입으로 지정
  const managementFeatures = [
    {
      id: 'courses',
      title: '과정 관리',
      description: '교육 과정을 생성하고 관리합니다.',
      icon: 'folders' as IconName,  // 'folder' 대신 'folders' 사용 
      href: '/courses'
    },
    {
      id: 'quizzes',
      title: '퀴즈 관리',
      description: '평가를 위한 퀴즈를 생성하고 관리합니다.',
      icon: 'status-info' as IconName,
      href: '/quizzes'
    },
    {
      id: 'surveys',
      title: '설문조사 관리',
      description: '교육 만족도 및 피드백을 수집합니다.',
      icon: 'file' as IconName,
      href: '/surveys'
    }
  ];
  
  // 관리자만 볼 수 있는 추가 기능
  if (isAdmin) {
    managementFeatures.push({
      id: 'users',
      title: '사용자 관리',
      description: '시스템 사용자 및 권한을 관리합니다.',
      icon: 'user-profile' as IconName,
      href: '/users'
    });
  }

  return (
    <MainLayout activeHref="/">
      <ContentLayout
        headerBackgroundStyle="linear-gradient(135deg, rgb(0, 94, 166) 3%, rgb(25, 119, 181) 44%, rgb(51, 140, 204) 69%, rgb(95, 171, 232) 94%)"
        headerVariant="high-contrast"
        maxContentWidth={1200}
        header={
          <SpaceBetween size="m">
            <Header
              variant="h1"
              actions={
                <Button variant="primary" onClick={handleLogout} iconName="remove">
                  로그아웃
                </Button>
              }
            >
              AWS T&C 교육 정보 대시보드
            </Header>
            <Box color="text-status-info" textAlign="right">
              <strong>{user?.attributes?.name || user?.username}</strong>님 환영합니다! ({userRole})
            </Box>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          {/* 환영 메시지와 상태 요약 */}
          <Container 
            header={<Header variant="h2">대시보드</Header>}
            footer={
              <Box textAlign="center">
                <Link href="/tnc">T&C 프로그램 소개 보기</Link>
              </Box>
            }
          >
            <SpaceBetween size="l">
              <Box variant="p">
                AWS T&C 교육 프로그램에 오신 것을 환영합니다. 이 대시보드에서 교육 과정 관리, 평가 도구 설정, 
                학습자 진행 상황을 확인할 수 있습니다.
              </Box>
              
              <SpaceBetween direction="horizontal" size="xs">
                <Box>
                  <Box variant="awsui-key-label">등록 과정</Box>
                  <Box variant="h3">12</Box>
                </Box>
                <Box>
                  <Box variant="awsui-key-label">진행 중 교육</Box>
                  <Box variant="h3">3</Box>
                </Box>
                <Box>
                  <Box variant="awsui-key-label">예정 교육</Box>
                  <Box variant="h3">5</Box>
                </Box>
                <Box>
                  <Box variant="awsui-key-label">최근 업데이트</Box>
                  <Box variant="h3">2025-04-10</Box>
                </Box>
              </SpaceBetween>
            </SpaceBetween>
          </Container>
          
          {/* 관리 기능 카드 */}
          <Container 
            header={
              <Header 
                variant="h2" 
                description="AWS T&C 교육 프로그램 관리에 필요한 기능에 접근하세요"
              >
                관리 기능
              </Header>
            }
          >
            <Cards
              items={managementFeatures}
              cardDefinition={{
                header: item => (
                  <Link fontSize="heading-m" href={item.href}>
                    <Icon name={item.icon} /> {item.title}
                  </Link>
                ),
                sections: [
                  {
                    id: "description",
                    content: item => item.description
                  },
                  {
                    id: "action",
                    content: item => (
                      <Button
                        iconAlign="right"
                        iconName="arrow-right"
                        onClick={() => navigate(item.href)}
                      >
                        바로가기
                      </Button>
                    )
                  }
                ]
              }}
              cardsPerRow={[
                { cards: 1 },
                { minWidth: 500, cards: 2 },
                { minWidth: 992, cards: 4 }
              ]}
            />
          </Container>
          
          {/* 최근 활동 섹션 */}
          <Container header={<Header variant="h2">최근 활동</Header>}>
            <Box>
              <ul>
                <li>2025-04-10: 새로운 AWS 교육 과정이 추가되었습니다</li>
                <li>2025-04-08: 12월 교육 일정이 등록되었습니다</li>
                <li>2025-04-05: 시스템이 업데이트되었습니다</li>
              </ul>
            </Box>
          </Container>
        </SpaceBetween>
      </ContentLayout>
    </MainLayout>
  );
};

export default HomePage;