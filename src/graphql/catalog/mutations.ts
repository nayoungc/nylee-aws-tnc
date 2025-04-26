// src/graphql/catalog/mutations.ts

// 카탈로그 생성
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

// 카탈로그 수정
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

// 카탈로그 삭제
export const deleteCourseCatalog = /* GraphQL */ `
  mutation DeleteCourseCatalog(\$input: DeleteCourseCatalogInput!) {
    deleteCourseCatalog(input: \$input) {
      id
      title
    }
  }
`;

// 카탈로그 상태 업데이트 (초안/활성/보관)
export const updateCatalogStatus = /* GraphQL */ `
  mutation UpdateCatalogStatus(\$id: ID!, \$status: CatalogStatus!) {
    updateCatalogStatus(id: \$id, status: \$status) {
      id
      title
      status
      updatedAt
    }
  }
`;

// 카탈로그 태그 추가
export const addTagToCatalog = /* GraphQL */ `
  mutation AddTagToCatalog(\$id: ID!, \$tag: String!) {
    addTagToCatalog(id: \$id, tag: \$tag) {
      id
      title
      tags
      updatedAt
    }
  }
`;

// 카탈로그 태그 삭제
export const removeTagFromCatalog = /* GraphQL */ `
  mutation RemoveTagFromCatalog(\$id: ID!, \$tag: String!) {
    removeTagFromCatalog(id: \$id, tag: \$tag) {
      id
      title
      tags
      updatedAt
    }
  }
`;

// 카탈로그 일괄 업데이트 (벌크 작업)
export const bulkUpdateCatalogs = /* GraphQL */ `
  mutation BulkUpdateCatalogs(\$input: BulkUpdateCatalogsInput!) {
    bulkUpdateCatalogs(input: \$input) {
      successCount
      failedItems {
        id
        errorMessage
      }
    }
  }
`;

// 선수 과목 추가
export const addPrerequisite = /* GraphQL */ `
  mutation AddPrerequisite(\$catalogId: ID!, \$prerequisiteId: ID!) {
    addPrerequisite(catalogId: \$catalogId, prerequisiteId: \$prerequisiteId) {
      id
      title
      prerequisites
      updatedAt
    }
  }
`;