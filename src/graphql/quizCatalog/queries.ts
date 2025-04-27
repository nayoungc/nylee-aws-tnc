// src/graphql/quizCatalog/queries.ts
/**
 * 모든 퀴즈 카탈로그 조회
 */
export const listQuizCatalogItems = /* GraphQL */ `
  query ListQuizCatalogItems(\$filter: ModelQuizCatalogFilterInput, \$limit: Int, \$nextToken: String) {
    listQuizCatalogItems(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        quizCatalogId
        title
        description
        questionItems {
          questionId
          order
          points
        }
        totalPoints
        defaultTimeLimit
        category
        difficulty
        tags
        isActive
        createdAt
        updatedAt
        createdBy
      }
      nextToken
    }
  }
`;

/**
 * 특정 퀴즈 카탈로그 조회
 */
export const getQuizCatalogItem = /* GraphQL */ `
  query GetQuizCatalogItem(\$quizCatalogId: ID!) {
    getQuizCatalogItem(quizCatalogId: \$quizCatalogId) {
      quizCatalogId
      title
      description
      questionItems {
        questionId
        order
        points
      }
      totalPoints
      defaultTimeLimit
      category
      difficulty
      tags
      isActive
      createdAt
      updatedAt
      createdBy
    }
  }
`;

/**
 * 퀴즈 카탈로그 검색
 */
export const searchQuizCatalogItems = /* GraphQL */ `
  query SearchQuizCatalogItems(\$filter: SearchableQuizCatalogFilterInput, \$limit: Int, \$nextToken: String) {
    searchQuizCatalogItems(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        quizCatalogId
        title
        description
        totalPoints
        category
        difficulty
        tags
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 태그별 퀴즈 카탈로그 조회
 */
export const getQuizCatalogItemsByTag = /* GraphQL */ `
  query GetQuizCatalogItemsByTag(\$tag: String!, \$limit: Int, \$nextToken: String) {
    getQuizCatalogItemsByTag(tag: \$tag, limit: \$limit, nextToken: \$nextToken) {
      items {
        quizCatalogId
        title
        description
        totalPoints
        category
        difficulty
        tags
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 카테고리별 퀴즈 카탈로그 조회
 */
export const getQuizCatalogItemsByCategory = /* GraphQL */ `
  query GetQuizCatalogItemsByCategory(\$category: String!, \$limit: Int, \$nextToken: String) {
    getQuizCatalogItemsByCategory(category: \$category, limit: \$limit, nextToken: \$nextToken) {
      items {
        quizCatalogId
        title
        description
        totalPoints
        category
        difficulty
        tags
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 난이도별 퀴즈 카탈로그 조회
 */
export const getQuizCatalogItemsByDifficulty = /* GraphQL */ `
  query GetQuizCatalogItemsByDifficulty(\$difficulty: String!, \$limit: Int, \$nextToken: String) {
    getQuizCatalogItemsByDifficulty(difficulty: \$difficulty, limit: \$limit, nextToken: \$nextToken) {
      items {
        quizCatalogId
        title
        description
        totalPoints
        category
        difficulty
        tags
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;