// src/graphql/courseCatalog/queries.ts

// 모든 코스 카탈로그 목록 조회 (표준 AppSync 네이밍으로 수정)
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
        prerequisites
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

// 특정 코스 카탈로그 상세 조회
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
      prerequisites
      objectives
      createdAt
      updatedAt
      createdBy
      status
    }
  }
`;

// 텍스트 검색 및 필터링 (사용자 지정 쿼리는 이름과 타입 수정)
export const searchCourseCatalog = /* GraphQL */ `
  query SearchCourseCatalogs(\$filter: SearchableCatalogFilterInput) {
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
        prerequisites
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

// 카테고리별 조회 (사용자 지정 쿼리/필드 수정)
export const getCatalogsByCategory = /* GraphQL */ `
  query GetCatalogsByCategory(\$category: String!) {
    getCatalogsByCategory(category: \$category) {
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
        prerequisites
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

// 카테고리별 조회 - 원래 이름으로 복원
export const getCourseCatalogByCategory = /* GraphQL */ `
  query GetCourseCatalogByCategory(\$category: String!) {
    getCourseCatalogByCategory(category: \$category) {
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
        prerequisites
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