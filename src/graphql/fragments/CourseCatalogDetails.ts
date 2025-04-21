// src/graphql/fragments/courseCatalogDetails.ts
import { graphql } from '../api';

export const CourseCatalogDetailsFragment = graphql(`
  fragment CourseDetails on CourseCatalog {
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
`);