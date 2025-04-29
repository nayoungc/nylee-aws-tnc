// src/graphql/surveyCatalog/queries.ts
/**
 * 특정 설문조사 카탈로그 조회
 */
export const getSurveyCatalog = /* GraphQL */ `
  query GetSurveyCatalog(\$surveyCatalogId: ID!) {
    getSurveyCatalog(surveyCatalogId: \$surveyCatalogId) {
      surveyCatalogId
      title
      description
      questionItems {
        id
        type
        content
        required
        options {
          value
          label
        }
        order
      }
      category
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
 * 모든 설문조사 카탈로그 조회
 */
export const listSurveyCatalogs = /* GraphQL */ `
  query ListSurveyCatalogs(\$filter: SurveyCatalogFilterInput, \$limit: Int, \$nextToken: String) {
    listSurveyCatalogs(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        surveyCatalogId
        title
        description
        questionItems {
          id
          type
          content
          required
          order
        }
        category
        tags
        isActive
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
 * 카테고리별 설문조사 카탈로그 조회
 */
export const getSurveyCatalogsByCategory = /* GraphQL */ `
  query GetSurveyCatalogsByCategory(\$category: String!, \$limit: Int, \$nextToken: String) {
    getSurveyCatalogsByCategory(category: \$category, limit: \$limit, nextToken: \$nextToken) {
      items {
        surveyCatalogId
        title
        description
        category
        tags
        isActive
        createdAt
        updatedAt
        courseId
        courseName
      }
      nextToken
    }
  }
`;

/**
 * 작성자별 설문조사 카탈로그 조회
 */
export const getSurveyCatalogsByCreator = /* GraphQL */ `
  query GetSurveyCatalogsByCreator(\$createdBy: String!, \$limit: Int, \$nextToken: String) {
    getSurveyCatalogsByCreator(createdBy: \$createdBy, limit: \$limit, nextToken: \$nextToken) {
      items {
        surveyCatalogId
        title
        description
        category
        tags
        isActive
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
 * 과정별 설문조사 카탈로그 조회
 */
export const getSurveyCatalogsByCourse = /* GraphQL */ `
  query GetSurveyCatalogsByCourse(\$courseId: ID!, \$limit: Int, \$nextToken: String) {
    getSurveyCatalogsByCourse(courseId: \$courseId, limit: \$limit, nextToken: \$nextToken) {
      items {
        surveyCatalogId
        title
        description
        category
        tags
        isActive
        createdAt
        updatedAt
        courseId
        courseName
      }
      nextToken
    }
  }
`;

/**
 * 태그로 설문조사 카탈로그 검색
 */
export const searchSurveyCatalogsByTags = /* GraphQL */ `
  query SearchSurveyCatalogsByTags(\$tags: [String!]!, \$limit: Int, \$nextToken: String) {
    searchSurveyCatalogsByTags(tags: \$tags, limit: \$limit, nextToken: \$nextToken) {
      items {
        surveyCatalogId
        title
        description
        category
        tags
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
