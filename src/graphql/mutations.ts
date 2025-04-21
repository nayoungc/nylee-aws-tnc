// src/graphql/mutations.ts
import { graphql } from './api';

export const createCourseCatalog = /* GraphQL */ `
  mutation CreateCourseCatalog(\$input: CreateCourseCatalogInput!) {
    createCourseCatalog(input: \$input) {
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

export const updateCourseCatalog = /* GraphQL */ `
  mutation UpdateCourseCatalog(\$input: UpdateCourseCatalogInput!) {
    updateCourseCatalog(input: \$input) {
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

export const deleteCourseCatalog = /* GraphQL */ `
  mutation DeleteCourseCatalog(\$input: DeleteCourseCatalogInput!) {
    deleteCourseCatalog(input: \$input) {
      catalogId
      version
      title
      createdAt
      updatedAt
    }
  }
`;