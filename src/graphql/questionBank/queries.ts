// src/graphql/questionBank/queries.ts
/**
 * 모든 문항 조회
 */
export const listQuestionBankItems = /* GraphQL */ `
  query ListQuestionBankItems(\$filter: ModelQuestionBankFilterInput, \$limit: Int, \$nextToken: String) {
    listQuestionBankItems(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
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
      nextToken
    }
  }
`;

/**
 * 특정 문항 조회
 */
export const getQuestionBankItem = /* GraphQL */ `
  query GetQuestionBankItem(\$questionId: ID!) {
    getQuestionBankItem(questionId: \$questionId) {
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
 * 문항 검색
 */
export const searchQuestionBankItems = /* GraphQL */ `
  query SearchQuestionBankItems(\$filter: SearchableQuestionBankFilterInput, \$limit: Int, \$nextToken: String) {
    searchQuestionBankItems(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        questionId
        content
        type
        difficulty
        tags
        points
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 태그별 문항 조회
 */
export const getQuestionBankItemsByTag = /* GraphQL */ `
  query GetQuestionBankItemsByTag(\$tag: String!, \$limit: Int, \$nextToken: String) {
    getQuestionBankItemsByTag(tag: \$tag, limit: \$limit, nextToken: \$nextToken) {
      items {
        questionId
        content
        type
        difficulty
        tags
        points
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 난이도별 문항 조회
 */
export const getQuestionBankItemsByDifficulty = /* GraphQL */ `
  query GetQuestionBankItemsByDifficulty(\$difficulty: String!, \$limit: Int, \$nextToken: String) {
    getQuestionBankItemsByDifficulty(difficulty: \$difficulty, limit: \$limit, nextToken: \$nextToken) {
      items {
        questionId
        content
        type
        difficulty
        tags
        points
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 문항 유형별 조회
 */
export const getQuestionBankItemsByType = /* GraphQL */ `
  query GetQuestionBankItemsByType(\$type: String!, \$limit: Int, \$nextToken: String) {
    getQuestionBankItemsByType(type: \$type, limit: \$limit, nextToken: \$nextToken) {
      items {
        questionId
        content
        type
        difficulty
        tags
        points
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;