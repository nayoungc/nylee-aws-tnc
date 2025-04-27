// src/graphql/courseCatalog/mutations.ts

/**
 * 코스 카탈로그 생성
 * @param input - 생성할 카탈로그 항목 데이터
 */
export const createCourseCatalog = /* GraphQL */ `
  mutation CreateCourseCatalog(\$input: CreateCourseCatalogInput!) {
    createCourseCatalog(input: \$input) {
      id
      title
      awsCode
      version
      durations
      level
      description
      category
      tags
      objectives
      createdAt
      updatedAt
      createdBy
      status
    }
  }
`;

/**
 * 코스 카탈로그 수정
 * @param input - 수정할 카탈로그 항목 데이터
 */
export const updateCourseCatalog = /* GraphQL */ `
  mutation UpdateCourseCatalog(\$input: UpdateCourseCatalogInput!) {
    updateCourseCatalog(input: \$input) {
      id
      title
      awsCode
      version
      durations
      level
      description
      category
      tags
      objectives
      createdAt
      updatedAt
      createdBy
      status
    }
  }
`;

/**
 * 코스 카탈로그 삭제
 * @param input - 삭제할 카탈로그 항목의 ID
 */
export const deleteCourseCatalog = /* GraphQL */ `
  mutation DeleteCourseCatalog(\$input: DeleteCourseCatalogInput!) {
    deleteCourseCatalog(input: \$input) {
      id
      title
    }
  }
`;

/**
 * 코스 카탈로그 상태 업데이트 (초안/활성/보관)
 * @param id - 카탈로그 항목 ID
 * @param status - 변경할 상태
 */
export const updateCourseCatalogStatus = /* GraphQL */ `
  mutation UpdateCourseCatalogStatus(\$id: ID!, \$status: CourseCatalogStatus!) {
    updateCourseCatalogStatus(id: \$id, status: \$status) {
      id
      title
      status
      updatedAt
    }
  }
`;

/**
 * 코스 카탈로그 태그 추가
 * @param id - 카탈로그 항목 ID
 * @param tag - 추가할 태그
 */
export const addTagToCourseCatalog = /* GraphQL */ `
  mutation AddTagToCourseCatalog(\$id: ID!, \$tag: String!) {
    addTagToCourseCatalog(id: \$id, tag: \$tag) {
      id
      title
      tags
      updatedAt
    }
  }
`;

/**
 * 코스 카탈로그 태그 삭제
 * @param id - 카탈로그 항목 ID
 * @param tag - 삭제할 태그
 */
export const removeTagFromCourseCatalog = /* GraphQL */ `
  mutation RemoveTagFromCourseCatalog(\$id: ID!, \$tag: String!) {
    removeTagFromCourseCatalog(id: \$id, tag: \$tag) {
      id
      title
      tags
      updatedAt
    }
  }
`;

/**
 * 코스 카탈로그 일괄 업데이트 (벌크 작업)
 * @param input - 일괄 업데이트할 항목 목록
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