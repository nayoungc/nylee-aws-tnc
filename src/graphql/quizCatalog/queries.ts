// src/graphql/quizCatalog/queries.ts
/**
 * 모든 퀴즈 카탈로그 조회
 */
export const listQuizCatalogs = /* GraphQL */ `
  query ListQuizCatalogs(\$filter: QuizCatalogFilterInput, \$limit: Int, \$nextToken: String) {
    listQuizCatalogs(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
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
        metadata
        createdAt
        updatedAt
        createdBy
        courseId
        courseName
      }
      nextToken
    }
  }
`;

/**
 * 특정 퀴즈 카탈로그 조회
 */
export const getQuizCatalog = /* GraphQL */ `
  query GetQuizCatalog(\$quizCatalogId: ID!) {
    getQuizCatalog(quizCatalogId: \$quizCatalogId) {
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
      metadata
      createdAt
      updatedAt
      createdBy
      courseId
      courseName
    }
  }
`;

/**
 * 카테고리별 퀴즈 카탈로그 조회
 */
export const getQuizCatalogsByCategory = /* GraphQL */ `
  query GetQuizCatalogsByCategory(\$category: String!, \$limit: Int, \$nextToken: String) {
    getQuizCatalogsByCategory(category: \$category, limit: \$limit, nextToken: \$nextToken) {
      items {
        quizCatalogId
        title
        description
        totalPoints
        defaultTimeLimit
        category
        difficulty
        tags
        isActive
        metadata
        createdAt
        updatedAt
        createdBy
        courseId
        courseName
      }
      nextToken
    }
  }
`;

/**
 * 난이도별 퀴즈 카탈로그 조회
 */
export const getQuizCatalogsByDifficulty = /* GraphQL */ `
  query GetQuizCatalogsByDifficulty(\$difficulty: Difficulty!, \$limit: Int, \$nextToken: String) {
    getQuizCatalogsByDifficulty(difficulty: \$difficulty, limit: \$limit, nextToken: \$nextToken) {
      items {
        quizCatalogId
        title
        description
        totalPoints
        defaultTimeLimit
        category
        difficulty
        tags
        isActive
        metadata
        createdAt
        updatedAt
        createdBy
        courseId
        courseName
      }
      nextToken
    }
  }
`;

/**
 * 작성자별 퀴즈 카탈로그 조회
 */
export const getQuizCatalogsByCreator = /* GraphQL */ `
  query GetQuizCatalogsByCreator(\$createdBy: String!, \$limit: Int, \$nextToken: String) {
    getQuizCatalogsByCreator(createdBy: \$createdBy, limit: \$limit, nextToken: \$nextToken) {
      items {
        quizCatalogId
        title
        description
        totalPoints
        defaultTimeLimit
        category
        difficulty
        tags
        isActive
        metadata
        createdAt
        updatedAt
        createdBy
        courseId
        courseName
      }
      nextToken
    }
  }
`;

/**
 * 코스별 퀴즈 카탈로그 조회
 */
export const getQuizCatalogsByCourse = /* GraphQL */ `
  query GetQuizCatalogsByCourse(\$courseId: String!, \$limit: Int, \$nextToken: String) {
    getQuizCatalogsByCourse(courseId: \$courseId, limit: \$limit, nextToken: \$nextToken) {
      items {
        quizCatalogId
        title
        description
        totalPoints
        defaultTimeLimit
        category
        difficulty
        tags
        isActive
        metadata
        createdAt
        updatedAt
        createdBy
        courseId
        courseName
      }
      nextToken
    }
  }
`;

/**
 * 태그로 퀴즈 카탈로그 검색
 */
export const searchQuizCatalogsByTags = /* GraphQL */ `
  query SearchQuizCatalogsByTags(\$tags: [String!]!, \$limit: Int, \$nextToken: String) {
    searchQuizCatalogsByTags(tags: \$tags, limit: \$limit, nextToken: \$nextToken) {
      items {
        quizCatalogId
        title
        description
        totalPoints
        category
        difficulty
        tags
        isActive
        metadata
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;