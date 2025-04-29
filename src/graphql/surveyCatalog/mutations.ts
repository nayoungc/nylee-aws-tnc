// src/graphql/surveyCatalog/mutations.ts
/**
 * 설문조사 카탈로그 생성
 */
export const createSurveyCatalog = /* GraphQL */ `
  mutation CreateSurveyCatalog(\$input: SurveyCatalogInput!) {
    createSurveyCatalog(input: \$input) {
      surveyCatalogId
      title
      description
      questionItems {
        id
        type
        content
        required
        options {
          value
          label
        }
        order
      }
      category
      tags
      isActive
      metadata
      createdAt
      updatedAt
      createdBy
      courseId
      courseName
    }
  }
`;

/**
 * 설문조사 카탈로그 수정
 */
export const updateSurveyCatalog = /* GraphQL */ `
  mutation UpdateSurveyCatalog(\$input: UpdateSurveyCatalogInput!) {
    updateSurveyCatalog(input: \$input) {
      surveyCatalogId
      title
      description
      questionItems {
        id
        type
        content
        required
        options {
          value
          label
        }
        order
      }
      category
      tags
      isActive
      metadata
      createdAt
      updatedAt
      createdBy
      courseId
      courseName
    }
  }
`;

/**
 * 설문조사 카탈로그 삭제
 */
export const deleteSurveyCatalog = /* GraphQL */ `
  mutation DeleteSurveyCatalog(\$surveyCatalogId: ID!) {
    deleteSurveyCatalog(surveyCatalogId: \$surveyCatalogId)
  }
`;

/**
 * 설문조사 문항 추가
 */
export const addQuestionItems = /* GraphQL */ `
  mutation AddQuestionItems(\$surveyCatalogId: ID!, \$questionItems: [QuestionItemInput!]!) {
    addQuestionItems(surveyCatalogId: \$surveyCatalogId, questionItems: \$questionItems) {
      surveyCatalogId
      questionItems {
        id
        type
        content
        required
        options {
          value
          label
        }
        order
      }
      updatedAt
    }
  }
`;

/**
 * 설문조사 문항 제거
 */
export const removeQuestionItems = /* GraphQL */ `
  mutation RemoveQuestionItems(\$surveyCatalogId: ID!, \$questionIds: [ID!]!) {
    removeQuestionItems(surveyCatalogId: \$surveyCatalogId, questionIds: \$questionIds) {
      surveyCatalogId
      questionItems {
        id
        type
        content
        required
        order
      }
      updatedAt
    }
  }
`;

/**
 * 설문조사 문항 순서 업데이트
 */
export const updateQuestionOrder = /* GraphQL */ `
  mutation UpdateQuestionOrder(\$surveyCatalogId: ID!, \$questionIds: [ID!]!) {
    updateQuestionOrder(surveyCatalogId: \$surveyCatalogId, questionIds: \$questionIds) {
      surveyCatalogId
      questionItems {
        id
        type
        content
        required
        order
      }
      updatedAt
    }
  }
`;

/**
 * 설문조사 카탈로그 활성화
 */
export const activateSurveyCatalog = /* GraphQL */ `
  mutation ActivateSurveyCatalog(\$surveyCatalogId: ID!) {
    activateSurveyCatalog(surveyCatalogId: \$surveyCatalogId) {
      surveyCatalogId
      isActive
      updatedAt
    }
  }
`;

/**
 * 설문조사 카탈로그 비활성화
 */
export const deactivateSurveyCatalog = /* GraphQL */ `
  mutation DeactivateSurveyCatalog(\$surveyCatalogId: ID!) {
    deactivateSurveyCatalog(surveyCatalogId: \$surveyCatalogId) {
      surveyCatalogId
      isActive
      updatedAt
    }
  }
`;

/**
 * 설문조사 배포
 */
export const deploySurvey = /* GraphQL */ `
  mutation DeploySurvey(\$input: DeploySurveyInput!) {
    deploySurvey(input: \$input) {
      surveyCatalogId
      title
      isActive
      metadata
      updatedAt
    }
  }
`;