
// src/graphql/surveyCatalog/queries.ts
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
      nextToken
    }
  }
`;

export const getSurveyCatalogsByCategory = /* GraphQL */ `
  query GetSurveyCatalogsByCategory(\$category: String!, \$limit: Int, \$nextToken: String) {
    getSurveyCatalogsByCategory(category: \$category, limit: \$limit, nextToken: \$nextToken) {
      items {
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
      nextToken
    }
  }
`;

/**
 * 생성자별 설문조사 템플릿 조회 쿼리
 */
export const getSurveyCatalogsByCreator = /* GraphQL */ `
  query GetSurveyCatalogsByCreator(\$createdBy: String!, \$limit: Int, \$nextToken: String) {
    getSurveyCatalogsByCreator(createdBy: \$createdBy, limit: \$limit, nextToken: \$nextToken) {
      items {
        surveyCatalogId
        title
        description
        questionItems {
          id
          type
          content
          required
        }
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
 * 과정별 설문조사 템플릿 조회 쿼리
 */
export const getSurveyCatalogsByCourse = /* GraphQL */ `
  query GetSurveyCatalogsByCourse(\$courseId: ID!, \$limit: Int, \$nextToken: String) {
    getSurveyCatalogsByCourse(courseId: \$courseId, limit: \$limit, nextToken: \$nextToken) {
      items {
        surveyCatalogId
        title
        description
        questionItems {
          id
          type
          content
          required
        }
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
 * 태그로 설문조사 템플릿 검색 쿼리
 */
export const searchSurveyCatalogsByTags = /* GraphQL */ `
  query SearchSurveyCatalogsByTags(\$tags: [String!]!, \$limit: Int, \$nextToken: String) {
    searchSurveyCatalogsByTags(tags: \$tags, limit: \$limit, nextToken: \$nextToken) {
      items {
        surveyCatalogId
        title
        description
        questionItems {
          id
          type
          content
          required
        }
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