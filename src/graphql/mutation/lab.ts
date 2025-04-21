// src/graphql/mutations/lab.ts
import { graphql } from '../../api';

export const createLab = graphql(`
  mutation CreateLab(\$input: CreateLabInput!) {
    createLab(input: \$input) {
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

export const updateLab = graphql(`
  mutation UpdateLab(\$input: UpdateLabInput!) {
    updateLab(input: \$input) {
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

export const deleteLab = graphql(`
  mutation DeleteLab(\$input: DeleteLabInput!) {
    deleteLab(input: \$input) {
      labId
      catalogId
      moduleId
      labNumber
    }
  }
`);