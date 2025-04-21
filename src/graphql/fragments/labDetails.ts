// src/graphql/fragments/labDetails.ts
import { graphql } from '../api';

export const LabDetailsFragment = graphql(`
  fragment LabDetails on CourseCatalogLab {
    catalogId
    labId
    moduleId
    labNumber
    title
    description
    duration
    instructions
    # 필요한 다른 필드들 추가
  }
`);