// src/graphql/surveyCatalog/mutations.ts
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
 * 설문조사 템플릿 업데이트 뮤테이션
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
 * 설문조사 템플릿 삭제 뮤테이션
 */
export const deleteSurveyCatalog = /* GraphQL */ `
  mutation DeleteSurveyCatalog(\$surveyCatalogId: ID!) {
    deleteSurveyCatalog(surveyCatalogId: \$surveyCatalogId)
  }
`;

/**
 * 문항 추가 뮤테이션
 */
export const addQuestionItems = /* GraphQL */ `
  mutation AddQuestionItems(\$surveyCatalogId: ID!, \$questionItems: [QuestionItemInput!]!) {
    addQuestionItems(surveyCatalogId: \$surveyCatalogId, questionItems: \$questionItems) {
      surveyCatalogId
      title
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
 * 문항 제거 뮤테이션
 */
export const removeQuestionItems = /* GraphQL */ `
  mutation RemoveQuestionItems(\$surveyCatalogId: ID!, \$questionIds: [ID!]!) {
    removeQuestionItems(surveyCatalogId: \$surveyCatalogId, questionIds: \$questionIds) {
      surveyCatalogId
      title
      questionItems {
        id
        type
        content
        required
      }
      updatedAt
    }
  }
`;

/**
 * 문항 순서 업데이트 뮤테이션
 */
export const updateQuestionOrder = /* GraphQL */ `
  mutation UpdateQuestionOrder(\$surveyCatalogId: ID!, \$questionIds: [ID!]!) {
    updateQuestionOrder(surveyCatalogId: \$surveyCatalogId, questionIds: \$questionIds) {
      surveyCatalogId
      title
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
 * 설문조사 템플릿 활성화 뮤테이션
 */
export const activateSurveyCatalog = /* GraphQL */ `
  mutation ActivateSurveyCatalog(\$surveyCatalogId: ID!) {
    activateSurveyCatalog(surveyCatalogId: \$surveyCatalogId) {
      surveyCatalogId
      title
      isActive
      updatedAt
    }
  }
`;

/**
 * 설문조사 템플릿 비활성화 뮤테이션
 */
export const deactivateSurveyCatalog = /* GraphQL */ `
  mutation DeactivateSurveyCatalog(\$surveyCatalogId: ID!) {
    deactivateSurveyCatalog(surveyCatalogId: \$surveyCatalogId) {
      surveyCatalogId
      title
      isActive
      updatedAt
    }
  }
`;

/**
 * 설문조사 배포 뮤테이션
 */
export const deploySurvey = /* GraphQL */ `
  mutation DeploySurvey(\$input: DeploySurveyInput!) {
    deploySurvey(input: \$input) {
      surveyCatalogId
      title
      updatedAt
    }
  }
`;