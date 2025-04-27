// src/graphql/courseCatalog/queries.ts

// src/graphql/courseCatalog/queries.ts
/**
 * 모든 코스 카탈로그 목록 조회
 * @param filter - 필터링 조건
 * @param limit - 한 번에 가져올 항목 수
 * @param nextToken - 페이지네이션 토큰
 */
export const listCourseCatalogs = /* GraphQL */ `
  query ListCourseCatalogs(\$filter: ModelCourseCatalogFilterInput, \$limit: Int, \$nextToken: String) {
    listCourseCatalogs(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        title
        awsCode
        version
        durations
        level
        description
        category
        tags
        objectives
        createdAt
        updatedAt
        createdBy
        status
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
      title
      awsCode
      version
      durations
      level
      description
      category
      tags
      objectives
      createdAt
      updatedAt
      createdBy
      status
    }
  }
`;

/**
 * 텍스트 검색 및 필터링
 * @param filter - 검색 필터링 조건
 */
export const searchCourseCatalogs = /* GraphQL */ `
  query SearchCourseCatalogs(\$filter: SearchableCourseCatalogFilterInput) {
    searchCourseCatalogs(filter: \$filter) {
      items {
        id
        title
        awsCode
        version
        durations
        level
        description
        category
        tags
        objectives
        createdAt
        updatedAt
        createdBy
        status
      }
      nextToken
    }
  }
`;

/**
 * 카테고리별 조회
 * @param category - 조회할 카테고리 이름
 */
export const getCourseCatalogsByCategory = /* GraphQL */ `
  query GetCourseCatalogsByCategory(\$category: String!) {
    getCourseCatalogsByCategory(category: \$category) {
      items {
        id
        title
        awsCode
        version
        durations
        level
        description
        category
        tags
        objectives
        createdAt
        updatedAt
        createdBy
        status
      }
      nextToken
    }
  }
`;

/**
 * 레벨별 조회
 * @param level - 조회할 난이도 레벨
 */
export const getCourseCatalogsByLevel = /* GraphQL */ `
  query GetCourseCatalogsByLevel(\$level: String!) {
    getCourseCatalogsByLevel(level: \$level) {
      items {
        id
        title
        awsCode
        version
        durations
        level
        description
        category
        tags
        objectives
        createdAt
        updatedAt
        createdBy
        status
      }
      nextToken
    }
  }
`;