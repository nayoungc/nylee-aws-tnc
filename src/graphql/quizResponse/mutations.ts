// src/graphql/quizResponse/mutations.ts
/**
 * 퀴즈 응답 생성
 */
export const createQuizResponse = /* GraphQL */ `
  mutation CreateQuizResponse(\$input: CreateQuizResponseInput!) {
    createQuizResponse(input: \$input) {
      responseId
      courseQuizId
      studentId
      attempt
      answers {
        questionId
        answer
      }
      score
      scoredAnswers {
        questionId
        score
        isCorrect
        feedback
      }
      submittedAt
      completionTime
      status
      createdAt
      updatedAt
    }
  }
`;

/**
 * 퀴즈 응답 수정
 */
export const updateQuizResponse = /* GraphQL */ `
  mutation UpdateQuizResponse(\$input: UpdateQuizResponseInput!) {
    updateQuizResponse(input: \$input) {
      responseId
      courseQuizId
      studentId
      attempt
      answers {
        questionId
        answer
      }
      score
      scoredAnswers {
        questionId
        score
        isCorrect
        feedback
      }
      submittedAt
      completionTime
      status
      createdAt
      updatedAt
    }
  }
`;

/**
 * 퀴즈 응답 삭제
 */
export const deleteQuizResponse = /* GraphQL */ `
  mutation DeleteQuizResponse(\$input: DeleteQuizResponseInput!) {
    deleteQuizResponse(input: \$input) {
      responseId
    }
  }
`;

/**
 * 퀴즈 응답 채점
 */
export const gradeQuizResponse = /* GraphQL */ `
  mutation GradeQuizResponse(\$responseId: ID!, \$scoredAnswers: [ScoredAnswerInput!]!, \$score: Float, \$status: String) {
    gradeQuizResponse(responseId: \$responseId, scoredAnswers: \$scoredAnswers, score: \$score, status: \$status) {
      responseId
      courseQuizId
      studentId
      score
      scoredAnswers {
        questionId
        score
        isCorrect
        feedback
      }
      status
      updatedAt
    }
  }
`;