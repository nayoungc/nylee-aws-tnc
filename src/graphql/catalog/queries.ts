// src/graphql/catalog/queries.ts
export const listCatalogs = /* GraphQL */ `
  query ListCatalogs(\$filter: CatalogFilterInput, \$limit: Int, \$nextToken: String) {
    listCatalogs(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
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

// 모든 카탈로그 목록 조회
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

// 특정 카탈로그 상세 조회
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

// 텍스트 검색 및 필터링
export const searchCatalog = /* GraphQL */ `
  query SearchCatalog(\$filter: CatalogFilterInput) {
    searchCatalog(filter: \$filter) {
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

// 카테고리별 조회
export const getCatalogByCategory = /* GraphQL */ `
  query GetCatalogByCategory(\$category: String!) {
    getCatalogByCategory(category: \$category) {
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

// 레벨별 조회
export const getCatalogByLevel = /* GraphQL */ `
  query GetCatalogByLevel(\$level: String!) {
    getCatalogByLevel(level: \$level) {
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

// 태그별 조회
export const getCatalogsByTag = /* GraphQL */ `
  query GetCatalogsByTag(\$tag: String!) {
    getCatalogsByTag(tag: \$tag) {
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

// 최근 업데이트된 카탈로그 조회
export const getRecentlyUpdatedCatalogs = /* GraphQL */ `
  query GetRecentlyUpdatedCatalogs(\$limit: Int) {
    getRecentlyUpdatedCatalogs(limit: \$limit) {
      id
      title
      awsCode
      version
      durations
      level
      description
      category
      tags
      updatedAt
      status
    }
  }
`;