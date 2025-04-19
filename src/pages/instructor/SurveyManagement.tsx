import React from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  Table,
  Box,
  Button,
  Select,
  FormField,
  Tabs
} from '@cloudscape-design/components';
import MainLayout from '../../components/MainLayout';

const SurveyManagement: React.FC = () => {
  return (
    <MainLayout title="Survey Management">
      <Container
        header={
          <Header
            variant="h2"
            description="Create and manage pre-course surveys"
            actions={<Button variant="primary">Create New Survey</Button>}
          >
            Survey Management
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
          
          <Tabs
            tabs={[
              {
                id: 'questions',
                label: 'Survey Questions',
                content: (
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
                        id: "required",
                        header: "Required",
                        cell: item => item.required ? 'Yes' : 'No'
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
                      { id: '1', question: 'How many years of experience do you have with AWS?', type: 'Multiple Choice', required: true },
                      { id: '2', question: 'Which AWS services have you used before?', type: 'Checkbox', required: true },
                      { id: '3', question: 'What are your learning objectives for this course?', type: 'Text', required: true },
                      { id: '4', question: 'How would you rate your current knowledge of cloud computing?', type: 'Rating', required: false }
                    ]}
                    loadingText="Loading survey questions"
                    empty={
                      <Box textAlign="center" color="inherit">
                        <b>No survey questions found</b>
                        <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                          Create questions to build your survey.
                        </Box>
                      </Box>
                    }
                  />
                )
              },
              {
                id: 'results',
                label: 'Survey Results',
                content: (
                  <Box padding="l">
                    <p>Select a course session to view survey results.</p>
                  </Box>
                )
              },
              {
                id: 'settings',
                label: 'Survey Settings',
                content: (
                  <SpaceBetween size="m">
                    <FormField label="Survey Title">
                      <input type="text" value="Pre-course Knowledge Assessment" readOnly />
                    </FormField>

                    <FormField label="Introduction Text">
                      <textarea
                        rows={3}
                        value="This survey helps us understand your background and tailor the course to your needs. Your responses are confidential."
                        readOnly
                      />
                    </FormField>

                    <FormField label="Completion Message">
                      <textarea
                        rows={3}
                        value="Thank you for completing the survey! We look forward to seeing you in class."
                        readOnly
                      />
                    </FormField>
                  </SpaceBetween>
                )
              }
            ]}
          />
        </SpaceBetween>
      </Container>
    </MainLayout>
  );
};

export default SurveyManagement;