// src/graphql/courseCatalog/queries.ts

/**
 * 모든 코스 카탈로그 목록 조회
 * @param limit - 한 번에 가져올 항목 수
 * @param nextToken - 페이지네이션 토큰
 */
export const listCourseCatalogs = /* GraphQL */ `
  query ListCourseCatalog(\$limit: Int, \$nextToken: String) {
    listCourseCatalog(limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        course_id
        course_name
        level
        duration
        delivery_method
        description
        objectives
        target_audience
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 특정 코스 카탈로그 상세 조회
 * @param id - 조회할 카탈로그 항목의 ID
 */
export const getCourseCatalog = /* GraphQL */ `
  query GetCourseCatalog(\$id: ID!) {
    getCourseCatalog(id: \$id) {
      id
      course_id
      course_name
      level
      duration
      delivery_method
      description
      objectives
      target_audience
      createdAt
      updatedAt
    }
  }
`;

/**
 * 카테고리별 코스 카탈로그 조회
 * @param category - 조회할 카테고리 이름
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
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;