import React, { useState } from 'react';
import {
  Container,
  Header,
  Table,
  SpaceBetween,
  Box,
  Button,
  Pagination,
  ColumnLayout,
  StatusIndicator,
  Tabs
} from '@cloudscape-design/components';
import MainLayout from '../../layouts/MainLayout';

const SessionManagement: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  
  const sessions = [
    { 
      id: '1', 
      title: 'Cloud Practitioner - April Cohort', 
      course: 'AWS Cloud Practitioner Essentials',
      startDate: '2025-04-20', 
      endDate: '2025-04-21',
      participants: 25,
      status: 'Upcoming'
    },
    { 
      id: '2', 
      title: 'Solutions Architect - May Cohort', 
      course: 'AWS Solutions Architect - Associate',
      startDate: '2025-05-05', 
      endDate: '2025-05-08',
      participants: 18,
      status: 'Upcoming'
    },
    { 
      id: '3', 
      title: 'DevOps Engineer - March Cohort', 
      course: 'AWS DevOps Engineer Professional',
      startDate: '2025-03-10', 
      endDate: '2025-03-15',
      participants: 15,
      status: 'Completed'
    }
  ];

  const getStatusType = (status: string): 'success' | 'warning' | 'error' | 'info' | 'pending' | 'in-progress' | 'stopped' => {
    switch (status) {
      case 'Active': return 'success';
      case 'Upcoming': return 'info';
      case 'Completed': return 'success'; // 'normal' 대신 'success' 사용
      case 'Cancelled': return 'error';
      default: return 'pending'; // 'normal' 대신 'pending' 사용
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (activeTabId === 'upcoming') return session.status === 'Upcoming';
    if (activeTabId === 'active') return session.status === 'Active';
    if (activeTabId === 'completed') return session.status === 'Completed';
    return true; // All tab
  });

  return (
    <MainLayout title="Session Management">
      <Container
        header={
          <Header
            variant="h2"
            description="Manage your training sessions"
            actions={<Button variant="primary">Create New Session</Button>}
          >
            Session Management
          </Header>
        }
      >
        <SpaceBetween size="l">
          <Tabs
            activeTabId={activeTabId}
            onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
            tabs={[
              {
                id: 'all',
                label: 'All',
                content: (
                  <Table
                    columnDefinitions={[
                      {
                        id: "title",
                        header: "Session Title",
                        cell: item => item.title,
                        sortingField: "title"
                      },
                      {
                        id: "course",
                        header: "Course",
                        cell: item => item.course
                      },
                      {
                        id: "dates",
                        header: "Dates",
                        cell: item => `\${new Date(item.startDate).toLocaleDateString()} - \${new Date(item.endDate).toLocaleDateString()}`
                      },
                      {
                        id: "participants",
                        header: "Participants",
                        cell: item => item.participants
                      },
                      {
                        id: "status",
                        header: "Status",
                        cell: item => (
                          <StatusIndicator type={getStatusType(item.status)}>
                            {item.status}
                          </StatusIndicator>
                        )
                      },
                      {
                        id: "actions",
                        header: "Actions",
                        cell: item => (
                          <SpaceBetween size="xs" direction="horizontal">
                            <Button variant="link">View</Button>
                            <Button variant="link">Edit</Button>
                          </SpaceBetween>
                        )
                      }
                    ]}
                    items={filteredSessions}
                    loadingText="Loading sessions"
                    selectionType="single"
                    trackBy="id"
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No sessions found</b>
                        <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                          Create a new session to get started.
                        </Box>
                      </Box>
                    }
                    pagination={
                      <Pagination
                        currentPageIndex={currentPage}
                        onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                        pagesCount={1}
                      />
                    }
                  />
                )
              },
              {
                id: 'upcoming',
                label: 'Upcoming',
                content: (
                  <Table
                    columnDefinitions={[
                      {
                        id: "title",
                        header: "Session Title",
                        cell: item => item.title,
                        sortingField: "title"
                      },
                      {
                        id: "course",
                        header: "Course",
                        cell: item => item.course
                      },
                      {
                        id: "dates",
                        header: "Dates",
                        cell: item => `\${new Date(item.startDate).toLocaleDateString()} - \${new Date(item.endDate).toLocaleDateString()}`
                      },
                      {
                        id: "participants",
                        header: "Participants",
                        cell: item => item.participants
                      },
                      {
                        id: "actions",
                        header: "Actions",
                        cell: item => (
                          <SpaceBetween size="xs" direction="horizontal">
                            <Button variant="link">View</Button>
                            <Button variant="link">Edit</Button>
                          </SpaceBetween>
                        )
                      }
                    ]}
                    items={filteredSessions}
                    loadingText="Loading sessions"
                    selectionType="single"
                    trackBy="id"
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No upcoming sessions</b>
                        <Box variant="p" color="inherit">
                          You don't have any upcoming sessions.
                        </Box>
                      </Box>
                    }
                    pagination={
                      <Pagination
                        currentPageIndex={currentPage}
                        onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
                        pagesCount={1}
                      />
                    }
                  />
                )
              },
              {
                id: 'active',
                label: 'Active',
                content: (
                  <Box padding="l">Content for active tab</Box>
                )
              },
              {
                id: 'completed',
                label: 'Completed',
                content: (
                  <Box padding="l">Content for completed tab</Box>
                )
              }
            ]}
          />
        </SpaceBetween>
      </Container>
    </MainLayout>
  );
};

export default SessionManagement;