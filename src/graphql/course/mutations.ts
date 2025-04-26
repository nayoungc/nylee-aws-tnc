
// src/graphql/course/mutations.ts

// 과정 생성
export const createCourse = /* GraphQL */ `
  mutation CreateCourse(\$input: CreateCourseInput!) {
    createCourse(input: \$input) {
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

// 과정 수정
export const updateCourse = /* GraphQL */ `
  mutation UpdateCourse(\$input: UpdateCourseInput!) {
    updateCourse(input: \$input) {
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

// 과정 삭제
export const deleteCourse = /* GraphQL */ `
  mutation DeleteCourse(\$input: DeleteCourseInput!) {
    deleteCourse(input: \$input) {
      courseId
    }
  }
`;

// 과정 상태 변경
export const updateCourseStatus = /* GraphQL */ `
  mutation UpdateCourseStatus(\$courseId: ID!, \$status: CourseStatus!) {
    updateCourseStatus(courseId: \$courseId, status: \$status) {
      courseId
      status
      updatedAt
    }
  }
`;