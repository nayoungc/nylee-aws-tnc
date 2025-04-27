// src/graphql/surveyQuestionBank/mutations.ts
/**
 * 설문 문항 생성
 */
export const createSurveyQuestionBankItem = /* GraphQL */ `
  mutation CreateSurveyQuestionBankItem(\$input: CreateSurveyQuestionBankItemInput!) {
    createSurveyQuestionBankItem(input: \$input) {
      questionId
      content
      type
      options {
        optionId
        content
      }
      required
      tags
      createdAt
      updatedAt
      createdBy
    }
  }
`;

/**
 * 설문 문항 수정
 */
export const updateSurveyQuestionBankItem = /* GraphQL */ `
  mutation UpdateSurveyQuestionBankItem(\$input: UpdateSurveyQuestionBankItemInput!) {
    updateSurveyQuestionBankItem(input: \$input) {
      questionId
      content
      type
      options {
        optionId
        content
      }
      required
      tags
      createdAt
      updatedAt
      createdBy
    }
  }
`;

/**
 * 설문 문항 삭제
 */
export const deleteSurveyQuestionBankItem = /* GraphQL */ `
  mutation DeleteSurveyQuestionBankItem(\$input: DeleteSurveyQuestionBankItemInput!) {
    deleteSurveyQuestionBankItem(input: \$input) {
      questionId
    }
  }
`;