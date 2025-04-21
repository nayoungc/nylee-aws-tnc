// src/graphql/queries/lab.ts
import { graphql } from '../api';

export const getLab = graphql(`
  query GetLab(\$catalogId: ID!, \$labId: String!) {
    getLab(catalogId: \$catalogId, labId: \$labId) {
      labId
      catalogId
      moduleId
      labNumber
      title
      description
      duration
      instructions
      createdAt
      updatedAt
    }
  }
`);

export const listLabs = graphql(`
  query ListLabs(\$catalogId: ID!, \$limit: Int, \$nextToken: String) {
    listLabs(catalogId: \$catalogId, limit: \$limit, nextToken: \$nextToken) {
      items {
        labId
        catalogId
        moduleId
        labNumber
        title
        description
        duration
        createdAt
      }
      nextToken
    }
  }
`);

export const labsByModule = graphql(`
  query LabsByModule(\$moduleId: ID!, \$labNumber: ModelStringKeyConditionInput, \$limit: Int, \$nextToken: String) {
    labsByModule(moduleId: \$moduleId, labNumber: \$labNumber, limit: \$limit, nextToken: \$nextToken) {
      items {
        labId
        catalogId
        moduleId
        labNumber
        title
        description
        duration
      }
      nextToken
    }
  }
`);