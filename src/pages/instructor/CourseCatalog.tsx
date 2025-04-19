import React, { useState } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  Table,
  Box,
  Button,
  Pagination,
  TextFilter
} from '@cloudscape-design/components';
import MainLayout from '../../components/MainLayout';

const CourseCatalog: React.FC = () => {
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // 예시 데이터
  const courses = [
    { id: '1', title: 'AWS Cloud Practitioner Essentials', category: 'Fundamental', level: 'Beginner', duration: '6 hours' },
    { id: '2', title: 'AWS Solutions Architect - Associate', category: 'Architecture', level: 'Intermediate', duration: '24 hours' },
    { id: '3', title: 'AWS Developer - Associate', category: 'Development', level: 'Intermediate', duration: '20 hours' },
    { id: '4', title: 'AWS SysOps Administrator - Associate', category: 'Operations', level: 'Intermediate', duration: '16 hours' },
    { id: '5', title: 'AWS Security Specialty', category: 'Security', level: 'Advanced', duration: '30 hours' }
  ];

  return (
    <MainLayout title="Course Catalog">
      <Container
        header={
          <Header
            variant="h2"
            description="Browse available AWS training courses"
            actions={<Button variant="primary">Create New Course</Button>}
          >
            Course Catalog
          </Header>
        }
      >
        <SpaceBetween size="m">
          <TextFilter
            filteringText={filterText}
            filteringPlaceholder="Find a course"
            filteringAriaLabel="Filter courses"
            onChange={({ detail }) => setFilterText(detail.filteringText)}
          />
          
          <Table
            columnDefinitions={[
              {
                id: "title",
                header: "Course Title",
                cell: item => item.title,
                sortingField: "title"
              },
              {
                id: "category",
                header: "Category",
                cell: item => item.category,
                sortingField: "category"
              },
              {
                id: "level",
                header: "Level",
                cell: item => item.level,
                sortingField: "level"
              },
              {
                id: "duration",
                header: "Duration",
                cell: item => item.duration
              },
              {
                id: "actions",
                header: "Actions",
                cell: item => (
                  <SpaceBetween size="xs" direction="horizontal">
                    <Button variant="link">View</Button>
                    <Button variant="link">Create Session</Button>
                  </SpaceBetween>
                )
              }
            ]}
            items={courses}
            loadingText="Loading courses"
            selectionType="single"
            trackBy="id"
            empty={
              <Box textAlign="center" color="inherit">
                <b>No courses</b>
                <Box padding={{ bottom: "s" }} variant="p" color="inherit">
                  No courses match the filter criteria.
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
        </SpaceBetween>
      </Container>
    </MainLayout>
  );
};

export default CourseCatalog;
