// src/api/quiz.ts
import { amplifyClient } from './config';
import { GraphQLResult } from 'aws-amplify/api';
import { Question, Quiz, QuizParams } from './types';

// GraphQL 쿼리 상수
const LIST_QUIZZES = `
  query ListQuizzes(\$filter: ModelQuizFilterInput, \$limit: Int) {
    listQuizzes(filter: \$filter, limit: \$limit) {
      items {
        id
        courseId
        courseName
        quizType
        title
        description
        questionCount
        timeLimit
        passScore
        createdAt
        updatedAt
      }
    }
  }
`;

const GET_QUIZ = `
  query GetQuiz(\$quizId: ID!) {
    getQuiz(id: \$quizId) {
      id
      courseId
      courseName
      quizType
      title
      description
      timeLimit
      passScore
      shuffleQuestions
      shuffleOptions
      showFeedback
      questions {
        id
        question
        options
        correctAnswer
        explanation
        difficulty
        tags
        quality
      }
      createdAt
      updatedAt
    }
  }
`;

const CREATE_QUIZ = `
  mutation CreateQuiz(\$input: CreateQuizInput!) {
    createQuiz(input: \$input) {
      id
      title
    }
  }
`;

const UPDATE_QUIZ = `
  mutation UpdateQuiz(\$input: UpdateQuizInput!) {
    updateQuiz(input: \$input) {
      id
      title
    }
  }
`;

const DELETE_QUIZ = `
  mutation DeleteQuiz(\$input: DeleteQuizInput!) {
    deleteQuiz(input: \$input) {
      id
    }
  }
`;

const GENERATE_QUIZ_QUESTIONS = `
  mutation GenerateQuizQuestions(\$input: GenerateQuizInput!) {
    generateQuizQuestions(input: \$input) {
      id
      question
      options
      correctAnswer
      explanation
      difficulty
      tags
      quality
    }
  }
`;

// 퀴즈 목록 조회
export async function listQuizzes(options?: any) {
  try {
    const result = await amplifyClient.graphql({
      query: LIST_QUIZZES,
      variables: options
    }) as GraphQLResult<any>;

    return {
      data: result.data?.listQuizzes?.items || [],
      errors: result.errors
    };
  } catch (error) {
    console.error('Error listing quizzes:', error);
    throw error;
  }
}

// 단일 퀴즈 조회
export async function getQuiz(quizId: string) {
  try {
    const result = await amplifyClient.graphql({
      query: GET_QUIZ,
      variables: { quizId }
    }) as GraphQLResult<any>;

    return {
      data: result.data?.getQuiz,
      errors: result.errors
    };
  } catch (error) {
    console.error('Error getting quiz:', error);
    throw error;
  }
}

// AI 문제 생성 함수
export async function generateQuizFromContent(params: QuizParams): Promise<Question[]> {
  try {
    // 실제 환경: API 호출
    const result = await amplifyClient.graphql({
      query: GENERATE_QUIZ_QUESTIONS,
      variables: { input: params }
    }) as GraphQLResult<any>;

    return result.data?.generateQuizQuestions || [];
  } catch (error) {
    console.error('Error generating quiz questions:', error);

    // 개발환경: 에러 발생 시 더미 데이터 제공
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock quiz questions');
      return Array(params.questionCount).fill(0).map((_, i) => ({
        id: `q-\${i}`,
        question: `Sample question \${i+1}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'This is an explanation for the sample question.',
        difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
        quality: 0.7 + Math.random() * 0.3
      }));
    }

    throw error;
  }
}

// 퀴즈 생성 함수
export async function createQuiz(quizData: Partial<Quiz>) {
  try {
    const result = await amplifyClient.graphql({
      query: CREATE_QUIZ,
      variables: { input: quizData }
    }) as GraphQLResult<any>;

    return {
      data: result.data?.createQuiz,
      errors: result.errors
    };
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
}

// 퀴즈 업데이트 함수
export async function updateQuiz(quizData: Partial<Quiz>) {
  try {
    const result = await amplifyClient.graphql({
      query: UPDATE_QUIZ,
      variables: { input: quizData }
    }) as GraphQLResult<any>;

    return {
      data: result.data?.updateQuiz,
      errors: result.errors
    };
  } catch (error) {
    console.error('Error updating quiz:', error);
    throw error;
  }
}

// 퀴즈 삭제 함수
export async function deleteQuiz(quizId: string) {
  try {
    const result = await amplifyClient.graphql({
      query: DELETE_QUIZ,
      variables: { input: { id: quizId } }
    }) as GraphQLResult<any>;

    return {
      data: result.data?.deleteQuiz,
      errors: result.errors
    };
  } catch (error) {
    console.error('Error deleting quiz:', error);
    throw error;
  }
}
