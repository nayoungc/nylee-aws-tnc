import React, { useState } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  FormField,
  Select,
  Button,
  Input,
  Textarea,
  ColumnLayout,
  Table,
  Box,
  Spinner,
  Alert
} from '@cloudscape-design/components';
import MainLayout from '../../layouts/MainLayout';

const Anyltics: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  
  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate AI generation with a timeout
    setTimeout(() => {
      setGeneratedQuestions([
        { id: '1', question: 'Which AWS service provides object storage?', type: 'Multiple Choice', difficulty: 'Easy' },
        { id: '2', question: 'What is the difference between Amazon EC2 and AWS Lambda?', type: 'Short Answer', difficulty: 'Medium' },
        { id: '3', question: 'Explain how AWS IAM policies work to control access to resources.', type: 'Essay', difficulty: 'Medium' },
        { id: '4', question: 'Which AWS service would you use for content delivery?', type: 'Multiple Choice', difficulty: 'Easy' },
        { id: '5', question: 'How would you design a highly available architecture using AWS services?', type: 'Essay', difficulty: 'Hard' }
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <MainLayout title="AI Question Generator">
      <SpaceBetween size="l">
        <Container
          header={
            <Header
              variant="h2"
              description="Generate assessment questions using AI"
            >
              AI Question Generator
            </Header>
          }
        >
          <SpaceBetween size="l">
            <ColumnLayout columns={2}>
              <SpaceBetween size="m">
                <FormField label="Select Course">
                  <Select
                    options={[
                      { label: 'AWS Cloud Practitioner Essentials', value: '1' },
                      { label: 'AWS Solutions Architect - Associate', value: '2' },
                      { label: 'AWS Developer - Associate', value: '3' }
                    ]}
                    selectedOption={{ label: 'AWS Cloud Practitioner Essentials', value: '1' }}
                    placeholder="Choose a course"
                  />
                </FormField>
                
                <FormField label="Assessment Type">
                  <Select
                    options={[
                      { label: 'Pre-Quiz', value: 'pre' },
                      { label: 'Post-Quiz', value: 'post' }
                    ]}
                    selectedOption={{ label: 'Pre-Quiz', value: 'pre' }}
                  />
                </FormField>
                
                <FormField label="Number of Questions">
                  <Select
                    options={[
                      { label: '5 questions', value: '5' },
                      { label: '10 questions', value: '10' },
                      { label: '15 questions', value: '15' },
                      { label: '20 questions', value: '20' }
                    ]}
                    selectedOption={{ label: '10 questions', value: '10' }}
                  />
                </FormField>
              </SpaceBetween>
              
              <SpaceBetween size="m">
                <FormField label="Difficulty Distribution">
                  <ColumnLayout columns={3}>
                    <FormField label="Easy">
                      <Input value="40%" type="number" />
                    </FormField>
                    <FormField label="Medium">
                      <Input value="40%" type="number" />
                    </FormField>
                    <FormField label="Hard">
                      <Input value="20%" type="number" />
                    </FormField>
                  </ColumnLayout>
                </FormField>
                
                <FormField label="Question Types">
                  <ColumnLayout columns={2}>
                    <div>
                      <input type="checkbox" id="multiple-choice" checked readOnly />
                      <label htmlFor="multiple-choice"> Multiple Choice</label>
                    </div>
                    <div>
                      <input type="checkbox" id="short-answer" checked readOnly />
                      <label htmlFor="short-answer"> Short Answer</label>
                    </div>
                    <div>
                      <input type="checkbox" id="essay" checked readOnly />
                      <label htmlFor="essay"> Essay</label>
                    </div>
                    <div>
                      <input type="checkbox" id="true-false" />
                      <label htmlFor="true-false"> True/False</label>
                    </div>
                  </ColumnLayout>
                </FormField>
              </SpaceBetween>
            </ColumnLayout>
            
            <FormField label="Additional Instructions (Optional)">
              <Textarea
                value=""
                placeholder="Provide any specific instructions for the AI question generator"
                rows={3}
              />
            </FormField>
            
            <div style={{ textAlign: 'center' }}>
              <Button
                variant="primary"
                onClick={handleGenerate}
                loading={isGenerating}
                loadingText="Generating questions..."
              >
                Generate Questions
              </Button>
            </div>
          </SpaceBetween>
        </Container>
        
        <Container
          header={
            <Header
              variant="h2"
              actions={
                generatedQuestions.length > 0 && (
                  <Button variant="primary">
                    Save All Questions
                  </Button>
                )
              }
            >
              Generated Questions
            </Header>
          }
        >
          {isGenerating ? (
            <Box textAlign="center" padding="l">
              <Spinner size="large" />
              <Box variant="h3" padding="s">
                Generating questions using AI...
              </Box>
              <Box variant="p">
                This may take a few moments as we create relevant questions based on your course content.
              </Box>
            </Box>
          ) : generatedQuestions.length > 0 ? (
            <Table
              columnDefinitions={[
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
                      <Button variant="link">Preview</Button>
                      <Button variant="link">Remove</Button>
                    </SpaceBetween>
                  )
                }
              ]}
              items={generatedQuestions}
              loadingText="Loading generated questions"
            />
          ) : (
            <Box textAlign="center" color="inherit" padding="l">
              <b>No questions generated yet</b>
              <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                Use the form above to generate assessment questions with AI.
              </Box>
            </Box>
          )}
        </Container>
        
        {generatedQuestions.length > 0 && (
          <Alert type="info">
            AI-generated questions should be reviewed and potentially edited before using them in assessments.
          </Alert>
        )}
      </SpaceBetween>
    </MainLayout>
  );
};

export default Anyltics;