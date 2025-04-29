// src/graphql/course/queries.ts
/**
 * 모든 과정 목록 조회
 * @param filter - 필터링 조건
 * @param limit - 한 번에 가져올 항목 수
 * @param nextToken - 페이지네이션 토큰
 */
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

/**
 * 특정 과정 조회
 * @param courseId - 조회할 과정의 ID
 */
export const listCourses = /* GraphQL */ `
  query ListCourses(\$filter: CourseFilterInput, \$limit: Int, \$nextToken: String) {
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

/**
 * 강사별 과정 조회
 * @param instructor - 강사 ID
 * @param limit - 한 번에 가져올 항목 수
 * @param nextToken - 페이지네이션 토큰
 */
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
        isAddedToCalendar
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 고객사별 과정 조회
 * @param customerId - 고객사 ID
 * @param limit - 한 번에 가져올 항목 수
 * @param nextToken - 페이지네이션 토큰
 */
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
        isAddedToCalendar
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 과정 검색
 * @param filter - 검색 필터링 조건
 * @param limit - 한 번에 가져올 항목 수
 * @param nextToken - 페이지네이션 토큰
 */
export const searchCourses = /* GraphQL */ `
  query SearchCourses(\$filter: SearchableCourseFilterInput, \$limit: Int, \$nextToken: String) {
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
        isAddedToCalendar
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 특정 과정에 연결된 퀴즈 조회
 * @param courseId - 과정 ID
 * @param quizType - 퀴즈 유형 (pre/post)
 */
export const getQuizzesByCourse = /* GraphQL */ `
  query GetQuizzesByCourse(\$courseId: ID!, \$quizType: String) {
    getQuizzesByCourse(courseId: \$courseId, quizType: \$quizType) {
      items {
        quizId
        title
        courseId
        quizType
        questions
        timeLimit
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 특정 과정에 연결된 설문조사 조회
 * @param courseId - 과정 ID
 */
export const getSurveysByCourse = /* GraphQL */ `
  query GetSurveysByCourse(\$courseId: ID!) {
    getSurveysByCourse(courseId: \$courseId) {
      items {
        surveyId
        title
        courseId
        description
        questions
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
