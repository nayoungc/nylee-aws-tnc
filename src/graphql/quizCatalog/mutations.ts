// src/graphql/quizCatalog/mutations.ts
/**
 * 퀴즈 카탈로그 생성
 */
export const createQuizCatalogItem = /* GraphQL */ `
  mutation CreateQuizCatalogItem(\$input: CreateQuizCatalogItemInput!) {
    createQuizCatalogItem(input: \$input) {
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
      createdAt
      updatedAt
      createdBy
    }
  }
`;

/**
 * 퀴즈 카탈로그 수정
 */
export const updateQuizCatalogItem = /* GraphQL */ `
  mutation UpdateQuizCatalogItem(\$input: UpdateQuizCatalogItemInput!) {
    updateQuizCatalogItem(input: \$input) {
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
      createdAt
      updatedAt
      createdBy
    }
  }
`;

/**
 * 퀴즈 카탈로그 삭제
 */
export const deleteQuizCatalogItem = /* GraphQL */ `
  mutation DeleteQuizCatalogItem(\$input: DeleteQuizCatalogItemInput!) {
    deleteQuizCatalogItem(input: \$input) {
      quizCatalogId
    }
  }
`;