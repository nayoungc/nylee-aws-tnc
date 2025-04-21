// src/graphql/mutations/courseCatalog.ts
import { graphql } from '../api';
import { CourseDetailsFragment } from '../fragments/courseDetails';

export const createCourseCatalog = graphql(`
  mutation CreateCourseCatalog(\$input: CreateCourseCatalogInput!) {
    createCourseCatalog(input: \$input) {
      ...CourseDetails
    }
  }
  \${CourseDetailsFragment}
`);

export const updateCourseCatalog = graphql(`
  mutation UpdateCourseCatalog(\$input: UpdateCourseCatalogInput!) {
    updateCourseCatalog(input: \$input) {
      ...CourseDetails
    }
  }
  \${CourseDetailsFragment}
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