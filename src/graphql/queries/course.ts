// src/graphql/queries/course.ts
import { graphql } from '../../api';

export const getCourse = graphql(`
  query GetCourse(\$courseId: ID!, \$startDate: String!) {
    getCourse(courseId: \$courseId, startDate: \$startDate) {
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

export const listCourses = graphql(`
  query ListCourses(\$limit: Int, \$nextToken: String) {
    listCourses(limit: \$limit, nextToken: \$nextToken) {
      items {
        courseId
        startDate
        endDate
        catalogId
        title
        status
        instructor
        customerId
        enrolledStudents
        createdAt
      }
      nextToken
    }
  }
`);

export const coursesByCatalog = graphql(`
  query CoursesByCatalog(\$catalogId: ID!, \$startDate: ModelStringKeyConditionInput, \$limit: Int, \$nextToken: String) {
    coursesByCatalog(catalogId: \$catalogId, startDate: \$startDate, limit: \$limit, nextToken: \$nextToken) {
      items {
        courseId
        startDate
        endDate
        title
        status
        instructor
        customerId
      }
      nextToken
    }
  }
`);

export const courseByShareCode = graphql(`
  query CourseByShareCode(\$shareCode: String!) {
    courseByShareCode(shareCode: \$shareCode) {
      courseId
      startDate
      title
      instructor
      status
    }
  }
`);

export const coursesByInstructor = graphql(`
  query CoursesByInstructor(\$instructor: ID!, \$startDate: ModelStringKeyConditionInput, \$limit: Int, \$nextToken: String) {
    coursesByInstructor(instructor: \$instructor, startDate: \$startDate, limit: \$limit, nextToken: \$nextToken) {
      items {
        courseId
        startDate
        endDate
        title
        status
        customerId
        enrolledStudents
      }
      nextToken
    }
  }
`);

export const coursesByCustomer = graphql(`
  query CoursesByCustomer(\$customerId: ID!, \$startDate: ModelStringKeyConditionInput, \$limit: Int, \$nextToken: String) {
    coursesByCustomer(customerId: \$customerId, startDate: \$startDate, limit: \$limit, nextToken: \$nextToken) {
      items {
        courseId
        startDate
        endDate
        title
        status
        instructor
        enrolledStudents
      }
      nextToken
    }
  }
`);