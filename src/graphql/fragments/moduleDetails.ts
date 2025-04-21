// src/graphql/fragments/moduleDetails.ts
import { graphql } from '../api';

export const ModuleDetailsFragment = graphql(`
  fragment ModuleDetails on Module {
    moduleId
    catalogId
    moduleNumber
    title
    description
    duration
    createdAt
    updatedAt
  }
`);