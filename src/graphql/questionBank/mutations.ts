// src/graphql/questionBank/mutations.ts
/**
 * 문항 생성
 */
export const createQuestionBankItem = /* GraphQL */ `
  mutation CreateQuestionBankItem(\$input: CreateQuestionBankItemInput!) {
    createQuestionBankItem(input: \$input) {
      questionId
      content
      type
      options {
        optionId
        content
        isCorrect
      }
      correctAnswer
      explanation
      difficulty
      tags
      points
      createdAt
      updatedAt
      createdBy
    }
  }
`;

/**
 * 문항 수정
 */
export const updateQuestionBankItem = /* GraphQL */ `
  mutation UpdateQuestionBankItem(\$input: UpdateQuestionBankItemInput!) {
    updateQuestionBankItem(input: \$input) {
      questionId
      content
      type
      options {
        optionId
        content
        isCorrect
      }
      correctAnswer
      explanation
      difficulty
      tags
      points
      createdAt
      updatedAt
      createdBy
    }
  }
`;

/**
 * 문항 삭제
 */
export const deleteQuestionBankItem = /* GraphQL */ `
  mutation DeleteQuestionBankItem(\$input: DeleteQuestionBankItemInput!) {
    deleteQuestionBankItem(input: \$input) {
      questionId
    }
  }
`;