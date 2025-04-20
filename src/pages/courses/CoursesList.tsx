// src/pages/courses/CoursesList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Header,
  Cards,
  Box,
  SpaceBetween,
  Button,
  TextFilter,
  Grid,
  Badge,
} from '@cloudscape-design/components';
import { useTypedTranslation } from '@/utils/i18n-utils';

const COURSES = [
  {
    id: 'aws-cloud-essentials',
    title: 'AWS Cloud Essentials',
    description: 'Learn the fundamentals of AWS Cloud services and concepts',
    level: 'Foundational',
    duration: '1 day',
    startDate: '2023-12-05',
    location: 'Online',
    price: '₩150,000',
    featured: true,
    category: 'Cloud Fundamentals'
  },
  {
    id: 'aws-solutions-architect',
    title: 'AWS Solutions Architect',
    description: 'Design highly available, cost-efficient solutions on AWS',
    level: 'Advanced',
    duration: '3 days',
    startDate: '2023-12-12',
    location: 'Seoul',
    price: '₩450,000',
    featured: true,
    category: 'Architecture'
  },
  {
    id: 'aws-devops',
    title: 'DevOps on AWS',
    description: 'Implement CI/CD practices using AWS Developer Tools',
    level: 'Intermediate',
    duration: '2 days',
    startDate: '2023-12-19',
    location: 'Online',
    price: '₩350,000',
    featured: false,
    category: 'DevOps'
  }
];

const CoursesList: React.FC = () => {
  const { t } = useTypedTranslation();
  const [filterText, setFilterText] = useState('');

  // 필터링된 과정 목록
  const filteredCourses = COURSES.filter(course => {
    return course.title.toLowerCase().includes(filterText.toLowerCase()) ||
           course.description.toLowerCase().includes(filterText.toLowerCase());
  });

  return (
    <SpaceBetween size="l">
      <Container
        header={
          <Header
            variant="h1"
            description={t('course.list.description') || "Browse and enroll in our available training courses"}
          >
            {t('course_catalog.title') || "Course Catalog"}
          </Header>
        }
      >
        <Grid gridDefinition={[{ colspan: 12 }]}>
          <TextFilter
            filteringText={filterText}
            filteringPlaceholder={t('course.filter.find_courses') || "Find courses"}
            filteringAriaLabel={t('course.filter.search_aria') || "Filter courses"}
            onChange={({ detail }) => setFilterText(detail.filteringText)}
          />
        </Grid>
      </Container>
      
      <Container>
        {filteredCourses.length > 0 ? (
          <Cards
            cardDefinition={{
              header: item => (
                <div>
                  <h2>{item.title}</h2>
                  {item.featured && <Badge color="blue">{t('course.featured') || "Featured"}</Badge>}
                </div>
              ),
              sections: [
                {
                  id: "description",
                  header: t('course.description.title') || "Description",
                  content: item => item.description
                },
                {
                  id: "details",
                  header: t('course.details') || "Details",
                  content: item => (
                    <Grid gridDefinition={[{colspan: 6}, {colspan: 6}]}>
                      <SpaceBetween size="xs">
                        <div><strong>{t('course.level') || "Level"}:</strong> {item.level}</div>
                        <div><strong>{t('course.duration') || "Duration"}:</strong> {item.duration}</div>
                      </SpaceBetween>
                      <SpaceBetween size="xs">
                        <div><strong>{t('course.start_date') || "Start Date"}:</strong> {new Date(item.startDate).toLocaleDateString()}</div>
                        <div><strong>{t('course.location') || "Location"}:</strong> {item.location}</div>
                        <div><strong>{t('course.price') || "Price"}:</strong> {item.price}</div>
                      </SpaceBetween>
                    </Grid>
                  )
                },
                {
                  id: "action",
                  content: item => (
                    <Link to={`/courses/\${item.id}`}>
                      <Button 
                        variant="primary"
                      >
                        {t('course.view_details') || "View Course"}
                      </Button>
                    </Link>
                  )
                }
              ]
            }}
            items={filteredCourses}
            cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 2 }]}
          />
        ) : (
          <Box textAlign="center" padding="l">
            {t('course.list.no_courses_found') || "No courses match your search criteria."}
            <Box padding="m">
              <Button onClick={() => setFilterText('')}>
                {t('course.list.clear_filters') || "Clear Filters"}
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </SpaceBetween>
  );
};

export default CoursesList;