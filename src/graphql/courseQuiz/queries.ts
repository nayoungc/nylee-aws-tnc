// src/graphql/courseQuiz/queries.ts
/**
 * 모든 코스-퀴즈 연결 조회
 */
export const listCourseQuizzes = /* GraphQL */ `
  query ListCourseQuizzes(\$filter: ModelCourseQuizFilterInput, \$limit: Int, \$nextToken: String) {
    listCourseQuizzes(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        courseQuizId
        courseId
        quizCatalogId
        quizType
        title
        description
        timeLimit
        startDate
        endDate
        passingScore
        weight
        maxAttempts
        showAnswers
        randomizeQuestions
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 특정 코스-퀴즈 조회
 */
export const getCourseQuiz = /* GraphQL */ `
  query GetCourseQuiz(\$courseQuizId: ID!) {
    getCourseQuiz(courseQuizId: \$courseQuizId) {
      courseQuizId
      courseId
      quizCatalogId
      quizType
      title
      description
      timeLimit
      startDate
      endDate
      passingScore
      weight
      maxAttempts
      showAnswers
      randomizeQuestions
      isActive
      createdAt
      updatedAt
    }
  }
`;

/**
 * 코스별 퀴즈 조회
 */
export const getCourseQuizzesByCourseId = /* GraphQL */ `
  query GetCourseQuizzesByCourseId(\$courseId: ID!, \$limit: Int, \$nextToken: String) {
    getCourseQuizzesByCourseId(courseId: \$courseId, limit: \$limit, nextToken: \$nextToken) {
      items {
        courseQuizId
        courseId
        quizCatalogId
        quizType
        title
        description
        timeLimit
        startDate
        endDate
        passingScore
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 퀴즈 유형별 조회
 */
export const getCourseQuizzesByType = /* GraphQL */ `
  query GetCourseQuizzesByType(\$courseId: ID!, \$quizType: String!, \$limit: Int, \$nextToken: String) {
    getCourseQuizzesByType(courseId: \$courseId, quizType: \$quizType, limit: \$limit, nextToken: \$nextToken) {
      items {
        courseQuizId
        courseId
        quizCatalogId
        quizType
        title
        description
        timeLimit
        startDate
        endDate
        passingScore
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 활성화된 퀴즈만 조회
 */
export const getActiveCourseQuizzes = /* GraphQL */ `
  query GetActiveCourseQuizzes(\$courseId: ID!, \$limit: Int, \$nextToken: String) {
    getActiveCourseQuizzes(courseId: \$courseId, limit: \$limit, nextToken: \$nextToken) {
      items {
        courseQuizId
        courseId
        quizCatalogId
        quizType
        title
        description
        timeLimit
        startDate
        endDate
        passingScore
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;