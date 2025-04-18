import React from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  Table,
  Box,
  Button,
  Select,
  FormField
} from '@cloudscape-design/components';
import MainLayout from '../../layouts/MainLayout';

const PostQuizManagement: React.FC = () => {
  return (
    <MainLayout title="Post-Quiz Management">
      <SpaceBetween size="l">
        <Container
          header={
            <Header
              variant="h2"
              description="Create and manage post-course quizzes with detailed results"
              actions={<Button variant="primary">Create New Quiz</Button>}
            >
              Post-Quiz Management
            </Header>
          }
        >
          <SpaceBetween size="l">
            <FormField label="Select Course Session">
              <Select
                options={[
                  { label: 'AWS Cloud Practitioner - April Cohort', value: '1' },
                  { label: 'AWS Solutions Architect - May Cohort', value: '2' }
                ]}
                selectedOption={null}
                placeholder="Choose a session"
              />
            </FormField>
            
            <Table
              columnDefinitions={[
                {
                  id: "questionNumber",
                  header: "#",
                  cell: item => item.id 
                },
                {
                  id: "question",
                  header: "Question",
                  cell: item => item.question
                },
                {
                  id: "type",
                  header: "Type",
                  cell: item => item.type
                },
                {
                  id: "difficulty",
                  header: "Difficulty",
                  cell: item => item.difficulty
                },
                {
                  id: "actions",
                  header: "Actions",
                  cell: () => (
                    <SpaceBetween size="xs" direction="horizontal">
                      <Button variant="link">Edit</Button>
                      <Button variant="link">Delete</Button>
                    </SpaceBetween>
                  )
                }
              ]}
              items={[
                { id: '1', number: 1, question: 'Design a multi-region architecture for high availability', type: 'Essay', difficulty: 'Hard' },
                { id: '2', number: 2, question: 'What are the benefits of using AWS CloudFront?', type: 'Multiple Choice', difficulty: 'Medium' },
                { id: '3', number: 3, question: 'How would you secure an API Gateway endpoint?', type: 'Short Answer', difficulty: 'Medium' },
                { id: '4', number: 4, question: 'Explain the shared responsibility model', type: 'Essay', difficulty: 'Medium' }
              ]}
              loadingText="Loading questions"
              empty={
                <Box textAlign="center" color="inherit">
                  <b>No questions found</b>
                  <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                    Select a session or create a new quiz to get started.
                  </Box>
                </Box>
              }
            />
          </SpaceBetween>
        </Container>

        <Container
          header={
            <Header variant="h2">Quiz Settings</Header>
          }
        >
          <SpaceBetween size="m">
            <FormField label="Time Limit">
              <Select
                options={[
                  { label: 'No time limit', value: '0' },
                  { label: '15 minutes', value: '15' },
                  { label: '30 minutes', value: '30' },
                  { label: '45 minutes', value: '45' },
                  { label: '60 minutes', value: '60' }
                ]}
                selectedOption={{ label: '45 minutes', value: '45' }}
              />
            </FormField>

            <FormField label="Question Order">
              <Select
                options={[
                  { label: 'Sequential', value: 'sequential' },
                  { label: 'Random', value: 'random' }
                ]}
                selectedOption={{ label: 'Sequential', value: 'sequential' }}
              />
            </FormField>

            <FormField label="Results Display">
              <Select
                options={[
                  { label: 'No results shown', value: 'none' },
                  { label: 'Show score only', value: 'score' },
                  { label: 'Show answers and explanations', value: 'full' }
                ]}
                selectedOption={{ label: 'Show answers and explanations', value: 'full' }}
              />
            </FormField>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </MainLayout>
  );
};

export default PostQuizManagement;