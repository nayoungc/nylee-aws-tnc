// src/graphql/courseQuiz/mutations.ts
/**
 * 코스-퀴즈 연결 생성
 */
export const createCourseQuiz = /* GraphQL */ `
  mutation CreateCourseQuiz(\$input: CreateCourseQuizInput!) {
    createCourseQuiz(input: \$input) {
      courseQuizId
      courseId
      quizCatalogId
      quizType
      title
      description
      timeLimit
      startDate
      endDate
      passingScore
      weight
      maxAttempts
      showAnswers
      randomizeQuestions
      isActive
      createdAt
      updatedAt
    }
  }
`;

/**
 * 코스-퀴즈 연결 수정
 */
export const updateCourseQuiz = /* GraphQL */ `
  mutation UpdateCourseQuiz(\$input: UpdateCourseQuizInput!) {
    updateCourseQuiz(input: \$input) {
      courseQuizId
      courseId
      quizCatalogId
      quizType
      title
      description
      timeLimit
      startDate
      endDate
      passingScore
      weight
      maxAttempts
      showAnswers
      randomizeQuestions
      isActive
      createdAt
      updatedAt
    }
  }
`;

/**
 * 코스-퀴즈 연결 삭제
 */
export const deleteCourseQuiz = /* GraphQL */ `
  mutation DeleteCourseQuiz(\$input: DeleteCourseQuizInput!) {
    deleteCourseQuiz(input: \$input) {
      courseQuizId
    }
  }
`;

/**
 * 코스-퀴즈 활성화/비활성화
 */
export const activateCourseQuiz = /* GraphQL */ `
  mutation ActivateCourseQuiz(\$courseQuizId: ID!, \$isActive: Boolean!) {
    activateCourseQuiz(courseQuizId: \$courseQuizId, isActive: \$isActive) {
      courseQuizId
      isActive
    }
  }
`;
