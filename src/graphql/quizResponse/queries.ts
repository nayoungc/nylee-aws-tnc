// src/graphql/quizResponse/queries.ts
/**
 * 모든 퀴즈 응답 조회
 */
export const listQuizResponses = /* GraphQL */ `
  query ListQuizResponses(\$filter: ModelQuizResponseFilterInput, \$limit: Int, \$nextToken: String) {
    listQuizResponses(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        responseId
        courseQuizId
        studentId
        attempt
        answers {
          questionId
          answer
        }
        score
        scoredAnswers {
          questionId
          score
          isCorrect
          feedback
        }
        submittedAt
        completionTime
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 특정 퀴즈 응답 조회
 */
export const getQuizResponse = /* GraphQL */ `
  query GetQuizResponse(\$responseId: ID!) {
    getQuizResponse(responseId: \$responseId) {
      responseId
      courseQuizId
      studentId
      attempt
      answers {
        questionId
        answer
      }
      score
      scoredAnswers {
        questionId
        score
        isCorrect
        feedback
      }
      submittedAt
      completionTime
      status
      createdAt
      updatedAt
    }
  }
`;

/**
 * 특정 코스-퀴즈의 모든 응답 조회
 */
export const getQuizResponsesByCourseQuizId = /* GraphQL */ `
  query GetQuizResponsesByCourseQuizId(\$courseQuizId: ID!, \$limit: Int, \$nextToken: String) {
    getQuizResponsesByCourseQuizId(courseQuizId: \$courseQuizId, limit: \$limit, nextToken: \$nextToken) {
      items {
        responseId
        courseQuizId
        studentId
        attempt
        score
        submittedAt
        completionTime
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 특정 학생의 퀴즈 응답 조회
 */
export const getQuizResponsesByStudentId = /* GraphQL */ `
  query GetQuizResponsesByStudentId(\$studentId: ID!, \$limit: Int, \$nextToken: String) {
    getQuizResponsesByStudentId(studentId: \$studentId, limit: \$limit, nextToken: \$nextToken) {
      items {
        responseId
        courseQuizId
        studentId
        attempt
        score
        submittedAt
        completionTime
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 퀴즈 응답 통계 조회
 */
export const getQuizResponseStatistics = /* GraphQL */ `
  query GetQuizResponseStatistics(\$courseQuizId: ID!) {
    getQuizResponseStatistics(courseQuizId: \$courseQuizId) {
      courseQuizId
      totalResponses
      averageScore
      highestScore
      lowestScore
      completionRate
      questionStatistics {
        questionId
        correctRate
        avgScore
      }
    }
  }
`;