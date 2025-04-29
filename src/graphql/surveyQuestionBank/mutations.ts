// src/graphql/surveyQuestionBank/mutations.ts
export const createSurveyQuestionBankItem = `
  mutation CreateSurveyQuestionBankItem(\$input: CreateSurveyQuestionBankItemInput!) {
    createSurveyQuestionBankItem(input: \$input) {
      questionId
      content
      questionType
      options {
        value
        label
      }
      required
      tags
      courseId
      courseName
      moduleId
      moduleName
      createdAt
      updatedAt
      createdBy
      metadata
    }
  }
`;

export const updateSurveyQuestionBankItem = `
  mutation UpdateSurveyQuestionBankItem(\$questionId: ID!, \$input: UpdateSurveyQuestionBankItemInput!) {
    updateSurveyQuestionBankItem(questionId: \$questionId, input: \$input) {
      questionId
      content
      questionType
      options {
        value
        label
      }
      required
      tags
      courseId
      courseName
      moduleId
      moduleName
      createdAt
      updatedAt
      createdBy
      metadata
    }
  }
`;

export const deleteSurveyQuestionBankItem = `
  mutation DeleteSurveyQuestionBankItem(\$questionId: ID!) {
    deleteSurveyQuestionBankItem(questionId: \$questionId) {
      questionId
    }
  }
`;