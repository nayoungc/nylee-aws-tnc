import React from 'react';
import {
  Container,
  Header,
  Cards,
  Box,
  SpaceBetween,
  Button,
  ColumnLayout
} from '@cloudscape-design/components';
import MainLayout from '../layouts/MainLayout';

const Dashboard: React.FC = () => {
  return (
    <MainLayout title="Instructor Dashboard">
      <SpaceBetween size="l">
        <Container
          header={
            <Header
              variant="h2"
              actions={<Button variant="primary">Create New Session</Button>}
            >
              Active Sessions
            </Header>
          }
        >
          <Cards
            cardDefinition={{
              header: item => item.title,
              sections: [
                {
                  id: 'description',
                  header: 'Description',
                  content: item => item.description
                },
                {
                  id: 'date',
                  header: 'Date',
                  content: item => item.date
                },
                {
                  id: 'participants',
                  header: 'Participants',
                  content: item => `\${item.participants} registered`
                }
              ]
            }}
            items={[
              {
                title: 'AWS Cloud Practitioner Essentials',
                description: 'Introduction to AWS services and cloud concepts',
                date: 'Apr 20, 2025 - Apr 21, 2025',
                participants: 25
              },
              {
                title: 'AWS Solutions Architect Associate',
                description: 'Design and deploy scalable AWS systems',
                date: 'May 5, 2025 - May 8, 2025',
                participants: 18
              }
            ]}
            empty={
              <Box textAlign="center" color="inherit">
                <b>No active sessions</b>
                <Box
                  padding={{ bottom: "s" }}
                  variant="p"
                  color="inherit"
                >
                  Create a new session to get started.
                </Box>
                <Button>Create Session</Button>
              </Box>
            }
          />
        </Container>

        <ColumnLayout columns={2}>
          <Container
            header={
              <Header variant="h2">Quick Actions</Header>
            }
          >
            <SpaceBetween size="m">
                <Button iconName="add">Create New Course</Button>
                <Button iconName="file">Generate Quiz</Button>
                <Button iconName="download">View Reports</Button>
            </SpaceBetween>

          </Container>
          
          <Container
            header={
              <Header variant="h2">Recent Activity</Header>
            }
          >
            <ul>
              <li>Pre-quiz completed for "AWS Cloud Practitioner" (15 participants)</li>
              <li>New questions generated for "Solutions Architect" session</li>
              <li>Post-quiz results ready for "DevOps Engineer" session</li>
            </ul>
          </Container>
        </ColumnLayout>
      </SpaceBetween>
    </MainLayout>
  );
};

export default Dashboard;