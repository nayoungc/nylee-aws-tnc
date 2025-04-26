// src/graphql/courseCatalog/mutations.ts

// 코스 카탈로그 생성
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
      prerequisites
      objectives
      createdAt
      updatedAt
      createdBy
      status
    }
  }
`;

// 코스 카탈로그 수정
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
      prerequisites
      objectives
      createdAt
      updatedAt
      createdBy
      status
    }
  }
`;

// 코스 카탈로그 삭제
export const deleteCourseCatalog = /* GraphQL */ `
  mutation DeleteCourseCatalog(\$input: DeleteCourseCatalogInput!) {
    deleteCourseCatalog(input: \$input) {
      id
      title
    }
  }
`;

// 코스 카탈로그 상태 업데이트 (초안/활성/보관)
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

// 코스 카탈로그 태그 추가
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

// 코스 카탈로그 태그 삭제
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

// 코스 카탈로그 일괄 업데이트 (벌크 작업)
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

// 선수 과목 추가
export const addPrerequisiteToCourseCatalogMutation = /* GraphQL */ `
  mutation AddPrerequisiteToCourseCatalog(\$courseCatalogId: ID!, \$prerequisiteId: ID!) {
    addPrerequisiteToCourseCatalog(courseCatalogId: \$courseCatalogId, prerequisiteId: \$prerequisiteId) {
      id
      title
      prerequisites
      updatedAt
    }
  }
`;