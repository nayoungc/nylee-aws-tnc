// src/graphql/surveyCatalog/mutations.ts
/**
 * 설문조사 카탈로그 생성
 */
export const createSurveyCatalogItem = /* GraphQL */ `
  mutation CreateSurveyCatalogItem(\$input: CreateSurveyCatalogItemInput!) {
    createSurveyCatalogItem(input: \$input) {
      surveyCatalogId
      title
      description
      questionItems {
        questionId
        order
        required
      }
      category
      tags
      isActive
      createdAt
      updatedAt
      createdBy
    }
  }
`;

/**
 * 설문조사 카탈로그 수정
 */
export const updateSurveyCatalogItem = /* GraphQL */ `
  mutation UpdateSurveyCatalogItem(\$input: UpdateSurveyCatalogItemInput!) {
    updateSurveyCatalogItem(input: \$input) {
      surveyCatalogId
      title
      description
      questionItems {
        questionId
        order
        required
      }
      category
      tags
      isActive
      createdAt
      updatedAt
      createdBy
    }
  }
`;

/**
 * 설문조사 카탈로그 삭제
 */
export const deleteSurveyCatalogItem = /* GraphQL */ `
  mutation DeleteSurveyCatalogItem(\$input: DeleteSurveyCatalogItemInput!) {
    deleteSurveyCatalogItem(input: \$input) {
      surveyCatalogId
    }
  }
`;