import React from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  Box,
  Button,
  Alert,
  StatusIndicator,
  Table
} from '@cloudscape-design/components';
import MainLayout from '../layouts/MainLayout';

// StatusIndicator의 허용된 타입 정의 추가
type StatusIndicatorType = "success" | "warning" | "error" | "info" | "stopped" | "in-progress" | "loading";

// 아이템 타입 정의 추가
interface AssessmentItem {
  name: string;
  status: string;
  statusType: StatusIndicatorType;
  action: string;
  actionEnabled: boolean;
}

const StudentHome: React.FC = () => {
  return (
    <MainLayout title="Welcome to AWS Training & Certification">
      <SpaceBetween size="l">
        <Alert
          header="Active Assessment"
          type="info"
        >
          Pre-quiz for "AWS Cloud Practitioner" is now active. Please complete before the session starts.
          <Box padding={{ top: 's' }}>
            <Button variant="primary">Start Pre-Quiz</Button>
          </Box>
        </Alert>

        <Container
          header={
            <Header variant="h2">Course Information</Header>
          }
        >
          <SpaceBetween size="l">
            <div>
              <h3>AWS Cloud Practitioner Essentials</h3>
              <p>This introductory course provides an overview of AWS Cloud concepts, services and security.</p>
              
              <Box padding={{ top: 'm' }}>
                <b>Instructor:</b> Jane Smith<br />
                <b>Date:</b> Apr 20, 2025 - Apr 21, 2025<br />
                <b>Location:</b> Online<br />
              </Box>
            </div>

            <Container
              header={
                <Header variant="h3">Announcements</Header>
              }
            >
              <SpaceBetween size="m">
                <Box>
                  <h4>Welcome to the Course!</h4>
                  <p>Please complete the pre-quiz by April 19th. It will help us assess your current knowledge level.</p>
                </Box>
                
                <Box>
                  <h4>Required Materials</h4>
                  <p>All course materials will be provided digitally. Please ensure you have access to a computer with a stable internet connection.</p>
                </Box>
              </SpaceBetween>
            </Container>
          </SpaceBetween>
        </Container>

        <Container
          header={
            <Header variant="h2">Assessment Status</Header>
          }
        >
          <Table
            columnDefinitions={[
              {
                id: "assessment",
                header: "Assessment",
                cell: item => item.name
              },
              {
                id: "status",
                header: "Status",
                cell: item => (
                  <StatusIndicator type={item.statusType}>
                    {item.status}
                  </StatusIndicator>
                )
              },
              {
                id: "action",
                header: "Action",
                cell: item => (
                  item.actionEnabled ? 
                  <Button disabled={!item.actionEnabled}>
                    {item.action}
                  </Button> : 
                  "-"
                )
              }
            ]}
            items={[
              { 
                name: "Pre-Course Survey", 
                status: "Active", 
                statusType: "success", 
                action: "Start",
                actionEnabled: true
              },
              { 
                name: "Pre-Quiz", 
                status: "Active", 
                statusType: "success", 
                action: "Start", 
                actionEnabled: true
              },
              { 
                name: "Post-Quiz", 
                status: "Coming Soon", 
                statusType: "in-progress", 
                action: "Start", 
                actionEnabled: false
              }
            ] as AssessmentItem[]}
          />
        </Container>
      </SpaceBetween>
    </MainLayout>
  );
};

export default StudentHome;