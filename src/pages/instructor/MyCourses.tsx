import React from 'react';
import {
  Container,
  Header,
  Cards,
  SpaceBetween,
  Box,
  Button,
  Badge
} from '@cloudscape-design/components';
import MainLayout from '../../layouts/MainLayout';

const MyCourses: React.FC = () => {
  const myCourses = [
    { id: '1', title: 'AWS Cloud Practitioner Essentials', activeSessions: 2, totalSessions: 5, status: 'Active' },
    { id: '2', title: 'AWS Solutions Architect - Associate', activeSessions: 1, totalSessions: 3, status: 'Active' },
    { id: '3', title: 'AWS Developer - Associate', activeSessions: 0, totalSessions: 4, status: 'Inactive' }
  ];

  return (
    <MainLayout title="My Courses">
      <Container
        header={
          <Header
            variant="h2"
            description="Courses you are assigned to teach"
          >
            My Courses
          </Header>
        }
      >
        <SpaceBetween size="l">
          {/* Cards 컴포넌트에서 footer 속성 제거 */}
          <Cards
            cardDefinition={{
              header: item => (
                <SpaceBetween size="xxs">
                  <div>{item.title}</div>
                  <Badge color={item.status === 'Active' ? 'green' : 'grey'}>
                    {item.status}
                  </Badge>
                </SpaceBetween>
              ),
              sections: [
                {
                  id: "sessions",
                  header: "Active Sessions",
                  content: item => `\${item.activeSessions} active / \${item.totalSessions} total`
                }
              ]
            }}
            cardsPerRow={[
              { cards: 1 },
              { minWidth: 500, cards: 2 }
            ]}
            items={myCourses}
            loadingText="Loading courses"
            empty={
              <Box textAlign="center" color="inherit">
                <b>No courses assigned</b>
                <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                  You don't have any assigned courses yet.
                </Box>
              </Box>
            }
          />
          
          {/* 푸터를 Cards 밖으로 이동하여 별도 컴포넌트로 표시 */}
          <SpaceBetween direction="horizontal" size="xs" alignItems="center">
            <Button>View All Courses</Button>
            <Button variant="primary">Create New Session</Button>
          </SpaceBetween>
        </SpaceBetween>
      </Container>
    </MainLayout>
  );
};

export default MyCourses;