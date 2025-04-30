export const createSurveyQuestionBankItem = /* GraphQL */ `
  mutation CreateSurveyQuestionBankItem(\$input: CreateSurveyQuestionBankItemInput!) {
    createSurveyQuestionBankItem(input: \$input) {
      questionId
      text
      type
      options
      tags
      category
      metadata
      createdAt
      updatedAt
      createdBy
    }
  }
`;

export const updateSurveyQuestionBankItem = /* GraphQL */ `
  mutation UpdateSurveyQuestionBankItem(\$input: UpdateSurveyQuestionBankItemInput!) {
    updateSurveyQuestionBankItem(input: \$input) {
      questionId
      text
      type
      options
      tags
      category
      metadata
      createdAt
      updatedAt
      createdBy
    }
  }
`;

export const deleteSurveyQuestionBankItem = /* GraphQL */ `
  mutation DeleteSurveyQuestionBankItem(\$questionId: ID!) {
    deleteSurveyQuestionBankItem(questionId: \$questionId) {
      questionId
    }
  }
`;
