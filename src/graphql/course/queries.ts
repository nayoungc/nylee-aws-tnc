// src/graphql/course/queries.ts

// 모든 과정 목록 조회
export const listCourses = /* GraphQL */ `
  query ListCourses(\$filter: ModelCourseFilterInput, \$limit: Int, \$nextToken: String) {
    listCourses(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        courseId
        startDate
        catalogId
        shareCode
        instructor
        customerId
        durations
        location
        attendance
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// 특정 과정 조회
export const getCourse = /* GraphQL */ `
  query GetCourse(\$courseId: ID!) {
    getCourse(courseId: \$courseId) {
      courseId
      startDate
      catalogId
      shareCode
      instructor
      customerId
      durations
      location
      attendance
      status
      createdAt
      updatedAt
    }
  }
`;

// 강사별 과정 조회
export const getCoursesByInstructor = /* GraphQL */ `
  query GetCoursesByInstructor(\$instructor: ID!, \$limit: Int, \$nextToken: String) {
    getCoursesByInstructor(instructor: \$instructor, limit: \$limit, nextToken: \$nextToken) {
      items {
        courseId
        startDate
        catalogId
        shareCode
        instructor
        customerId
        durations
        location
        attendance
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// 고객사별 과정 조회
export const getCoursesByCustomer = /* GraphQL */ `
  query GetCoursesByCustomer(\$customerId: ID!, \$limit: Int, \$nextToken: String) {
    getCoursesByCustomer(customerId: \$customerId, limit: \$limit, nextToken: \$nextToken) {
      items {
        courseId
        startDate
        catalogId
        shareCode
        instructor
        customerId
        durations
        location
        attendance
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// 과정 검색
export const searchCourses = /* GraphQL */ `
  query SearchCourses(\$filter: CourseSearchFilterInput, \$limit: Int, \$nextToken: String) {
    searchCourses(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        courseId
        startDate
        catalogId
        shareCode
        instructor
        customerId
        durations
        location
        attendance
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;