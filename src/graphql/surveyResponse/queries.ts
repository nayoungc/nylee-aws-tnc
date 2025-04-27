// src/graphql/surveyResponse/queries.ts
/**
 * 모든 설문조사 응답 조회
 */
export const listSurveyResponses = /* GraphQL */ `
  query ListSurveyResponses(\$filter: ModelSurveyResponseFilterInput, \$limit: Int, \$nextToken: String) {
    listSurveyResponses(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        responseId
        courseSurveyId
        studentId
        answers {
          questionId
          answer
        }
        submittedAt
        completionTime
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 특정 설문조사 응답 조회
 */
export const getSurveyResponse = /* GraphQL */ `
  query GetSurveyResponse(\$responseId: ID!) {
    getSurveyResponse(responseId: \$responseId) {
      responseId
      courseSurveyId
      studentId
      answers {
        questionId
        answer
      }
      submittedAt
      completionTime
      createdAt
      updatedAt
    }
  }
`;

/**
 * 특정 코스-설문조사의 모든 응답 조회
 */
export const getSurveyResponsesByCourseSurveyId = /* GraphQL */ `
  query GetSurveyResponsesByCourseSurveyId(\$courseSurveyId: ID!, \$limit: Int, \$nextToken: String) {
    getSurveyResponsesByCourseSurveyId(courseSurveyId: \$courseSurveyId, limit: \$limit, nextToken: \$nextToken) {
      items {
        responseId
        courseSurveyId
        studentId
        submittedAt
        completionTime
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 특정 학생의 설문조사 응답 조회
 */
export const getSurveyResponsesByStudentId = /* GraphQL */ `
  query GetSurveyResponsesByStudentId(\$studentId: ID!, \$limit: Int, \$nextToken: String) {
    getSurveyResponsesByStudentId(studentId: \$studentId, limit: \$limit, nextToken: \$nextToken) {
      items {
        responseId
        courseSurveyId
        studentId
        submittedAt
        completionTime
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 설문조사 응답 통계 조회
 */
export const getSurveyResponseStatistics = /* GraphQL */ `
  query GetSurveyResponseStatistics(\$courseSurveyId: ID!) {
    getSurveyResponseStatistics(courseSurveyId: \$courseSurveyId) {
      courseSurveyId
      totalResponses
      completionRate
      questionStatistics {
        questionId
        responseCounts
        averageRating
        textResponses
      }
    }
  }
`;