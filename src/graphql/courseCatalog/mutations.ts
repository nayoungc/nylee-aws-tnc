// src/graphql/courseCatalog/mutations.ts

/**
 * 코스 카탈로그 생성
 */
export const createCourseCatalog = /* GraphQL */ `
  mutation CreateCourseCatalog(\$input: CreateCourseCatalogInput!) {
    createCourseCatalog(input: \$input) {
      id
      course_name
      course_id
      level
      duration
      delivery_method
      description
      objectives
      target_audience
      createdAt
      updatedAt
    }
  }
`;

/**
 * 코스 카탈로그 수정
 */
export const updateCourseCatalog = /* GraphQL */ `
  mutation UpdateCourseCatalog(\$input: UpdateCourseCatalogInput!) {
    updateCourseCatalog(input: \$input) {
      id
      course_name
      course_id
      level
      duration
      delivery_method
      description
      objectives
      target_audience
      createdAt
      updatedAt
    }
  }
`;

/**
 * 코스 카탈로그 삭제
 */
export const deleteCourseCatalog = /* GraphQL */ `
  mutation DeleteCourseCatalog(\$input: DeleteCourseCatalogInput!) {
    deleteCourseCatalog(input: \$input) {
      id
      course_name
    }
  }
`;

/**
 * 코스 카탈로그 일괄 업데이트
 */
export const bulkUpdateCourseCatalogs = /* GraphQL */ `
  mutation BulkUpdateCourseCatalogs(\$input: BulkUpdateCourseCatalogsInput!) {
    bulkUpdateCourseCatalogs(input: \$input) {
      successCount
      failedItems {
        id
        errorMessage
      }
    }
  }
`;