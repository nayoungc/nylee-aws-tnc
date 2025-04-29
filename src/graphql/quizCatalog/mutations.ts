// src/graphql/quizCatalog/mutations.ts
/**
 * 퀴즈 카탈로그 생성
 */
export const createQuizCatalog = /* GraphQL */ `
  mutation CreateQuizCatalog(\$input: QuizCatalogInput!) {
    createQuizCatalog(input: \$input) {
      quizCatalogId
      title
      description
      questionItems {
        questionId
        order
        points
      }
      totalPoints
      defaultTimeLimit
      category
      difficulty
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
 * 퀴즈 카탈로그 수정
 */
export const updateQuizCatalog = /* GraphQL */ `
  mutation UpdateQuizCatalog(\$input: UpdateQuizCatalogInput!) {
    updateQuizCatalog(input: \$input) {
      quizCatalogId
      title
      description
      questionItems {
        questionId
        order
        points
      }
      totalPoints
      defaultTimeLimit
      category
      difficulty
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
 * 퀴즈 카탈로그 삭제
 */
export const deleteQuizCatalog = /* GraphQL */ `
  mutation DeleteQuizCatalog(\$quizCatalogId: ID!) {
    deleteQuizCatalog(quizCatalogId: \$quizCatalogId)
  }
`;

/**
 * 퀴즈 카탈로그 활성화
 */
export const activateQuizCatalog = /* GraphQL */ `
  mutation ActivateQuizCatalog(\$quizCatalogId: ID!) {
    activateQuizCatalog(quizCatalogId: \$quizCatalogId) {
      quizCatalogId
      isActive
      updatedAt
    }
  }
`;

/**
 * 퀴즈 카탈로그 비활성화
 */
export const deactivateQuizCatalog = /* GraphQL */ `
  mutation DeactivateQuizCatalog(\$quizCatalogId: ID!) {
    deactivateQuizCatalog(quizCatalogId: \$quizCatalogId) {
      quizCatalogId
      isActive
      updatedAt
    }
  }
`;

/**
 * 문항 추가
 */
export const addQuestionItems = /* GraphQL */ `
  mutation AddQuestionItems(\$quizCatalogId: ID!, \$questionItems: [QuestionItemInput!]!) {
    addQuestionItems(quizCatalogId: \$quizCatalogId, questionItems: \$questionItems) {
      quizCatalogId
      questionItems {
        questionId
        order
        points
      }
      totalPoints
      updatedAt
    }
  }
`;

/**
 * 문항 제거
 */
export const removeQuestionItems = /* GraphQL */ `
  mutation RemoveQuestionItems(\$quizCatalogId: ID!, \$questionIds: [ID!]!) {
    removeQuestionItems(quizCatalogId: \$quizCatalogId, questionIds: \$questionIds) {
      quizCatalogId
      questionItems {
        questionId
        order
        points
      }
      totalPoints
      updatedAt
    }
  }
`;

/**
 * 문항 배점 업데이트
 */
export const updateQuestionPoints = /* GraphQL */ `
  mutation UpdateQuestionPoints(\$quizCatalogId: ID!, \$questionId: ID!, \$points: Int!) {
    updateQuestionPoints(quizCatalogId: \$quizCatalogId, questionId: \$questionId, points: \$points) {
      quizCatalogId
      questionItems {
        questionId
        order
        points
      }
      totalPoints
      updatedAt
    }
  }
`;
