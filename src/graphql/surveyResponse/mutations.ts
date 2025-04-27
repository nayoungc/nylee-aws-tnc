// src/graphql/surveyResponse/mutations.ts
/**
 * 설문조사 응답 생성
 */
export const createSurveyResponse = /* GraphQL */ `
  mutation CreateSurveyResponse(\$input: CreateSurveyResponseInput!) {
    createSurveyResponse(input: \$input) {
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
 * 설문조사 응답 수정
 */
export const updateSurveyResponse = /* GraphQL */ `
  mutation UpdateSurveyResponse(\$input: UpdateSurveyResponseInput!) {
    updateSurveyResponse(input: \$input) {
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
 * 설문조사 응답 삭제
 */
export const deleteSurveyResponse = /* GraphQL */ `
  mutation DeleteSurveyResponse(\$input: DeleteSurveyResponseInput!) {
    deleteSurveyResponse(input: \$input) {
      responseId
    }
  }
`;