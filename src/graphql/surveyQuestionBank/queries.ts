// src/graphql/surveyQuestionBank/queries.ts
/**
 * 모든 설문 문항 조회
 */
export const listSurveyQuestionBankItems = /* GraphQL */ `
  query ListSurveyQuestionBankItems(\$filter: ModelSurveyQuestionBankFilterInput, \$limit: Int, \$nextToken: String) {
    listSurveyQuestionBankItems(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
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
      nextToken
    }
  }
`;

/**
 * 특정 설문 문항 조회
 */
export const getSurveyQuestionBankItem = /* GraphQL */ `
  query GetSurveyQuestionBankItem(\$questionId: ID!) {
    getSurveyQuestionBankItem(questionId: \$questionId) {
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
 * 설문 문항 검색
 */
export const searchSurveyQuestionBankItems = /* GraphQL */ `
  query SearchSurveyQuestionBankItems(\$filter: SearchableSurveyQuestionBankFilterInput, \$limit: Int, \$nextToken: String) {
    searchSurveyQuestionBankItems(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        questionId
        content
        type
        required
        tags
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 태그별 설문 문항 조회
 */
export const getSurveyQuestionBankItemsByTag = /* GraphQL */ `
  query GetSurveyQuestionBankItemsByTag(\$tag: String!, \$limit: Int, \$nextToken: String) {
    getSurveyQuestionBankItemsByTag(tag: \$tag, limit: \$limit, nextToken: \$nextToken) {
      items {
        questionId
        content
        type
        required
        tags
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 유형별 설문 문항 조회
 */
export const getSurveyQuestionBankItemsByType = /* GraphQL */ `
  query GetSurveyQuestionBankItemsByType(\$type: String!, \$limit: Int, \$nextToken: String) {
    getSurveyQuestionBankItemsByType(type: \$type, limit: \$limit, nextToken: \$nextToken) {
      items {
        questionId
        content
        type
        required
        tags
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;