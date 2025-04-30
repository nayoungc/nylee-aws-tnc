export const listSurveyQuestionBankItems = /* GraphQL */ `
  query ListSurveyQuestionBankItems(
    \$filter: ModelSurveyQuestionBankFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listSurveyQuestionBankItems(
      filter: \$filter
      limit: \$limit
      nextToken: \$nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;

export const getSurveyQuestionBankItem = /* GraphQL */ `
  query GetSurveyQuestionBankItem(\$questionId: ID!) {
    getSurveyQuestionBankItem(questionId: \$questionId) {
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

export const getSurveyQuestionBankItemsByTag = /* GraphQL */ `
  query GetSurveyQuestionBankItemsByTag(
    \$tag: String!
    \$limit: Int
    \$nextToken: String
  ) {
    getSurveyQuestionBankItemsByTag(
      tag: \$tag
      limit: \$limit
      nextToken: \$nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;

export const getSurveyQuestionBankItemsByType = /* GraphQL */ `
  query GetSurveyQuestionBankItemsByType(
    \$type: String!
    \$limit: Int
    \$nextToken: String
  ) {
    getSurveyQuestionBankItemsByType(
      type: \$type
      limit: \$limit
      nextToken: \$nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;

export const searchSurveyQuestionBankItems = /* GraphQL */ `
  query SearchSurveyQuestionBankItems(
    \$text: String!
    \$limit: Int
    \$nextToken: String
  ) {
    searchSurveyQuestionBankItems(
      text: \$text
      limit: \$limit
      nextToken: \$nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;