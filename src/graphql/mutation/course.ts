// src/graphql/mutations/course.ts
import { graphql } from '../api';

export const createCourse = graphql(`
  mutation CreateCourse(\$input: CreateCourseInput!) {
    createCourse(input: \$input) {
      courseId
      startDate
      endDate
      catalogId
      title
      description
      shareCode
      instructor
      customerId
      status
      maxStudents
      enrolledStudents
      createdAt
      updatedAt
    }
  }
`);

export const updateCourse = graphql(`
  mutation UpdateCourse(\$input: UpdateCourseInput!) {
    updateCourse(input: \$input) {
      courseId
      startDate
      endDate
      catalogId
      title
      description
      shareCode
      instructor
      customerId
      status
      maxStudents
      enrolledStudents
      createdAt
      updatedAt
    }
  }
`);

export const deleteCourse = graphql(`
  mutation DeleteCourse(\$input: DeleteCourseInput!) {
    deleteCourse(input: \$input) {
      courseId
      startDate
      title
    }
  }
`);