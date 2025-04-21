// src/graphql/mutations/courseCatalog.ts
import { graphql } from '../../api';

export const createCourseCatalog = graphql(`
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
      deliveryMethod
      createdAt
      updatedAt
    }
  }
`);

export const updateCourseCatalog = graphql(`
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
      deliveryMethod
      createdAt
      updatedAt
    }
  }
`);

export const deleteCourseCatalog = graphql(`
  mutation DeleteCourseCatalog(\$input: DeleteCourseCatalogInput!) {
    deleteCourseCatalog(input: \$input) {
      catalogId
      version
      title
    }
  }
`);