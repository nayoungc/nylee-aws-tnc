// src/graphql/courseCatalog/queries.ts

/**
 * 코스 카탈로그 목록 가져오기
 */
export const listCourseCatalogs = /* GraphQL */ `
  query ListCourseCatalogs(\$filter: ModelCourseCatalogFilterInput, \$limit: Int, \$nextToken: String) {
    listCourseCatalogs(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        course_name
        course_id
        level
        duration
        delivery_method
        description
        objectives
        target_audience
        status
        createdAt
        updatedAt
        createdBy
      }
      nextToken
    }
  }
`;

/**
 * 특정 코스 카탈로그 조회
 */
export const getCourseCatalog = /* GraphQL */ `
  query GetCourseCatalog(\$id: ID!) {
    getCourseCatalog(id: \$id) {
      id
      course_name
      course_id
      level
      duration
      delivery_method
      description
      objectives
      target_audience
      status
      createdAt
      updatedAt
      createdBy
    }
  }
`;

/**
 * 카테고리별 코스 카탈로그 조회
 */
export const getCourseCatalogsByCategory = /* GraphQL */ `
  query GetCourseCatalogsByCategory(\$category: String!) {
    getCourseCatalogsByCategory(category: \$category) {
      items {
        id
        course_name
        course_id
        level
        duration
        delivery_method
        description
        objectives
        target_audience
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
