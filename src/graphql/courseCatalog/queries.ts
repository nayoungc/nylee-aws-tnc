// src/graphql/courseCatalog/queries.ts

/**
 * 모든 코스 카탈로그 목록 조회
 */
export const listCourseCatalogs = /* GraphQL */ `
  query ListCourseCatalogs {
    listCourseCatalogs {
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

/**
 * 특정 코스 카탈로그 상세 조회
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
