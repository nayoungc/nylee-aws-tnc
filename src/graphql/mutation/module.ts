// src/graphql/mutations/module.ts
import { graphql } from '../api';

export const createModule = graphql(`
  mutation CreateModule(\$input: CreateModuleInput!) {
    createModule(input: \$input) {
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

export const updateModule = graphql(`
  mutation UpdateModule(\$input: UpdateModuleInput!) {
    updateModule(input: \$input) {
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

export const deleteModule = graphql(`
  mutation DeleteModule(\$input: DeleteModuleInput!) {
    deleteModule(input: \$input) {
      moduleId
      catalogId
      moduleNumber
    }
  }
`);
