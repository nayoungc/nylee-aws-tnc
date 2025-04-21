// src/graphql/fragments/courseDetails.ts
import { graphql } from '../api';

export const CourseDetailsFragment = graphql(`
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