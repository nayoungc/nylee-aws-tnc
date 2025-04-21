// src/graphql/queries/modules.ts
import { graphql } from '../../api';

export const getModule = graphql(`
  query GetModule(\$catalogId: ID!, \$moduleNumber: String!) {
    getModule(catalogId: \$catalogId, moduleNumber: \$moduleNumber) {
      moduleId
      catalogId
      moduleNumber
      title
      description
      duration
      createdAt
      updatedAt
    }
  }
`);

export const listModules = graphql(`
  query ListModules(\$catalogId: ID!, \$limit: Int, \$nextToken: String) {
    listModules(catalogId: \$catalogId, limit: \$limit, nextToken: \$nextToken) {
      items {
        moduleId
        catalogId
        moduleNumber
        title
        description
        duration
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`);

export const getModuleById = graphql(`
  query GetModuleById(\$moduleId: ID!) {
    getModuleById(moduleId: \$moduleId) {
      moduleId
      catalogId
      moduleNumber
      title
      description
      duration
    }
  }
`);
