// src/graphql/courseCatalog/queries.ts

// 모든 코스 카탈로그 목록 조회
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

// 텍스트 검색 및 필터링
export const searchCourseCatalog = /* GraphQL */ `
  query SearchCourseCatalog(\$filter: CourseCatalogFilterInput) {
    searchCourseCatalog(filter: \$filter) {
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
export const getCourseCatalogByCategory = /* GraphQL */ `
  query GetCourseCatalogByCategory(\$category: String!) {
    getCourseCatalogByCategory(category: \$category) {
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