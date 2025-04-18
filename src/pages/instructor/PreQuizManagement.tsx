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

const PreQuizManagement: React.FC = () => {
  return (
    <MainLayout title="Pre-Quiz Management">
      <SpaceBetween size="l">
        <Container
          header={
            <Header
              variant="h2"
              description="Create and manage pre-course quizzes"
              actions={<Button variant="primary">Create New Quiz</Button>}
            >
              Pre-Quiz Management
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
                { id: '1', question: 'What is Amazon S3?', type: 'Multiple Choice', difficulty: 'Easy' },
                { id: '2', question: 'Explain the difference between EC2 and Lambda', type: 'Short Answer', difficulty: 'Medium' },
                { id: '3', question: 'Which AWS service would you use for serverless computing?', type: 'Multiple Choice', difficulty: 'Easy' }
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
                selectedOption={{ label: '30 minutes', value: '30' }}
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
                  { label: 'No results shown (pre-quiz)', value: 'none' },
                  { label: 'Show score only', value: 'score' },
                  { label: 'Show answers and explanations', value: 'full' }
                ]}
                selectedOption={{ label: 'No results shown (pre-quiz)', value: 'none' }}
              />
            </FormField>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </MainLayout>
  );
};

export default PreQuizManagement;