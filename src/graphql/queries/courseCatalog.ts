// src/graphql/queries/courseCatalog.ts
import { graphql } from '../../api';

export const getCourseCatalog = graphql(`
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
      deliveryMethod
      createdAt
      updatedAt
    }
  }
`);

export const listCourseCatalogs = graphql(`
  query ListCourseCatalogs(\$limit: Int, \$nextToken: String) {
    listCourseCatalogs(limit: \$limit, nextToken: \$nextToken) {
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
`);

export const courseCatalogsByTitle = graphql(`
  query CourseCatalogsByTitle(\$title: String!, \$version: String, \$limit: Int, \$nextToken: String) {
    courseCatalogsByTitle(title: \$title, version: \$version, limit: \$limit, nextToken: \$nextToken) {
      items {
        catalogId
        version
        title
        awsCode
        status
        category
        level
        createdAt
      }
      nextToken
    }
  }
`);

export const courseCatalogsByAwsCode = graphql(`
  query CourseCatalogsByAwsCode(\$awsCode: String!, \$version: String, \$limit: Int, \$nextToken: String) {
    courseCatalogsByAwsCode(awsCode: \$awsCode, version: \$version, limit: \$limit, nextToken: \$nextToken) {
      items {
        catalogId
        version
        title
        status
        category
        level
      }
      nextToken
    }
  }
`);
