// src/graphql/queries.ts
import { graphql } from './api';
export const listCourseCatalog = /* GraphQL */ `
  query ListCourseCatalog(\$limit: Int, \$nextToken: String) {
    listCourseCatalog(limit: \$limit, nextToken: \$nextToken) {
      items {
        catalogId
        version
        title
        awsCode
        description
        category
        level
        duration
        status
        objectives
        targetAudience
        deliveryMethod
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getCourseCatalogById = /* GraphQL */ `
  query GetCourseCatalogById(\$catalogId: ID!, \$version: String!) {
    getCourseCatalog(catalogId: \$catalogId, version: \$version) {
      catalogId
      version
      title
      awsCode
      description
      category
      level
      duration
      status
      objectives
      targetAudience
      deliveryMethod
      createdAt
      updatedAt
    }
  }
`;

export const getCourseCatalog = /* GraphQL */ `
  query GetCourseCatalog(\$catalogId: ID!, \$version: String!) {
    getCourseCatalog(catalogId: \$catalogId, version: \$version) {
      catalogId
      version
      title
      awsCode
      description
      category
      level
      duration
      status
      objectives
      targetAudience
      prerequisites
      deliveryMethod
      createdAt
      updatedAt
    }
  }
`;

export const listCourseCatalogs = /* GraphQL */ `
  query ListCourseCatalogs(
    \$filter: ModelCourseCatalogFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listCourseCatalogs(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        catalogId
        version
        title
        awsCode
        description
        category
        level
        duration
        status
        objectives
        targetAudience
        prerequisites
        deliveryMethod
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// 인덱스를 사용한 쿼리
export const courseCatalogsByTitle = /* GraphQL */ `
  query CourseCatalogsByTitle(
    \$title: String!
    \$version: ModelStringKeyConditionInput
    \$limit: Int
    \$nextToken: String
    \$sortDirection: ModelSortDirection
  ) {
    courseCatalogsByTitle(
      title: \$title
      version: \$version
      limit: \$limit
      nextToken: \$nextToken
      sortDirection: \$sortDirection
    ) {
      items {
        catalogId
        version
        title
        awsCode
        description
        category
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
