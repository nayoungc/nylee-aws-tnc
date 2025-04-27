// src/graphql/surveyCatalog/queries.ts
/**
 * 모든 설문조사 카탈로그 조회
 */
export const listSurveyCatalogItems = /* GraphQL */ `
  query ListSurveyCatalogItems(\$filter: ModelSurveyCatalogFilterInput, \$limit: Int, \$nextToken: String) {
    listSurveyCatalogItems(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        surveyCatalogId
        title
        description
        questionItems {
          questionId
          order
          required
        }
        category
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
 * 특정 설문조사 카탈로그 조회
 */
export const getSurveyCatalogItem = /* GraphQL */ `
  query GetSurveyCatalogItem(\$surveyCatalogId: ID!) {
    getSurveyCatalogItem(surveyCatalogId: \$surveyCatalogId) {
      surveyCatalogId
      title
      description
      questionItems {
        questionId
        order
        required
      }
      category
      tags
      isActive
      createdAt
      updatedAt
      createdBy
    }
  }
`;

/**
 * 설문조사 카탈로그 검색
 */
export const searchSurveyCatalogItems = /* GraphQL */ `
  query SearchSurveyCatalogItems(\$filter: SearchableSurveyCatalogFilterInput, \$limit: Int, \$nextToken: String) {
    searchSurveyCatalogItems(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
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

/**
 * 태그별 설문조사 카탈로그 조회
 */
export const getSurveyCatalogItemsByTag = /* GraphQL */ `
  query GetSurveyCatalogItemsByTag(\$tag: String!, \$limit: Int, \$nextToken: String) {
    getSurveyCatalogItemsByTag(tag: \$tag, limit: \$limit, nextToken: \$nextToken) {
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

/**
 * 카테고리별 설문조사 카탈로그 조회
 */
export const getSurveyCatalogItemsByCategory = /* GraphQL */ `
  query GetSurveyCatalogItemsByCategory(\$category: String!, \$limit: Int, \$nextToken: String) {
    getSurveyCatalogItemsByCategory(category: \$category, limit: \$limit, nextToken: \$nextToken) {
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