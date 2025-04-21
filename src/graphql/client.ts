// src/graphql/client.ts
import { generateClient, GraphQLResult } from 'aws-amplify/api';

// 기본 타입 정의 - DynamoDB 테이블 구조에 맞게 수정
export interface CourseCatalog {
    catalogId: string;          // 파티션 키
    version: string;            // 정렬 키
    title: string;              // GSI1 해시 키
    awsCode?: string;           // GSI2 해시 키
    description?: string;
    isPublished: boolean;
    publishedDate?: string;
    
    // 추가된 필드 - UI 호환성을 위한 필드
    course_name?: string;       // 추가된 속성
    level?: string;
    duration?: number;
    price?: number;
    currency?: string;
    status?: string;
    category?: string;
    deliveryMethod?: string;
    objectives?: string[];
    targetAudience?: string[];
    createdAt?: string;
    updatedAt?: string;
  }

export interface Question {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string | number;
  explanation?: string;
  difficulty?: string;
  tags?: string[];
  quality?: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  courseName?: string;
  quizType: 'pre' | 'post';
  title: string;
  description?: string;
  timeLimit?: number;
  passScore?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showFeedback?: boolean;
  questions?: Question[];
  questionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 추가 타입 정의 - 필요한 것만 포함
export interface Course {
  courseId: string;
  startDate: string;
  catalogId: string;
  title: string;
  status: string;
  customerId: string;
}

export interface Assessment {
  id: string;
  type: string;
  title: string;
  questionCount: number;
  status: string;
}

// Amplify Gen 2 클라이언트 생성
export const client = generateClient();

// 함수 타입 정의
export type QuizParams = {
  courseId: string;
  quizType: 'pre' | 'post';
  modelType: 'basic' | 'advanced';
  questionCount: number;
  contextPrompt?: string;
};

// ==================== 핵심 함수들 ====================

// CourseCatalog 관련 함수 - DynamoDB 테이블 필드에 맞게 쿼리 수정
export async function listCourseCatalogs(options?: any) {
  try {
    const result = await client.graphql({
      query: `
        query ListCourseCatalogs(\$filter: ModelCourseCatalogFilterInput, \$limit: Int) {
          listCourseCatalogs(filter: \$filter, limit: \$limit) {
            items {
              catalogId
              version
              title
              awsCode
              description
              isPublished
              publishedDate
              level
              duration
              price
              currency
              status
              category
              deliveryMethod
              objectives
              targetAudience
              createdAt
              updatedAt
            }
          }
        }
      `,
      variables: options
    }) as GraphQLResult<any>;
    
    return {
      data: result.data?.listCourseCatalogs?.items || [],
      errors: result.errors
    };
  } catch (error) {
    console.error('Error listing course catalogs:', error);
    throw error;
  }
}

// Quiz 목록 조회 - QuizList.tsx에서 사용
export async function listQuiz(options?: any) {
  try {
    const result = await client.graphql({
      query: `
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
      `,
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

// QuizList.tsx에서 사용하는 별칭 함수
export async function listQuizzes(options?: any) {
  return listQuiz(options);
}

// 단일 퀴즈 조회 - QuizCreate.tsx에서 사용
export async function getQuiz(quizId: string) {
  try {
    const result = await client.graphql({
      query: `
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
      `,
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

// AI 문제 생성 함수 - 두 컴포넌트 모두에서 사용
export async function generateQuizFromContent(params: QuizParams): Promise<Question[]> {
  try {
    // 실제 환경: API 호출
    const result = await client.graphql({
      query: `
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
      `,
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
    const result = await client.graphql({
      query: `
        mutation CreateQuiz(\$input: CreateQuizInput!) {
          createQuiz(input: \$input) {
            id
            title
          }
        }
      `,
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
    const result = await client.graphql({
      query: `
        mutation UpdateQuiz(\$input: UpdateQuizInput!) {
          updateQuiz(input: \$input) {
            id
            title
          }
        }
      `,
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
    const result = await client.graphql({
      query: `
        mutation DeleteQuiz(\$input: DeleteQuizInput!) {
          deleteQuiz(input: { id: \$quizId }) {
            id
          }
        }
      `,
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

// 데이터 변환 함수 - 필드 매핑 지원
export function mapToCourseViewModel(item: any): CourseCatalog {
  return {
    catalogId: item.catalogId || '',
    version: item.version || 'v1',
    title: item.title || '',
    awsCode: item.awsCode,
    description: item.description,
    category: item.category || '',
    level: item.level,
    duration: item.duration,
    price: item.price,
    currency: item.currency,
    isPublished: item.isPublished !== undefined ? item.isPublished : true,
    publishedDate: item.publishedDate,
    deliveryMethod: item.deliveryMethod || '',
    objectives: item.objectives || [],
    targetAudience: item.targetAudience || [],
    status: item.status || 'ACTIVE',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

// 타입 체크를 위한 간단한 헬퍼 함수
export function logAvailableModels() {
  console.log('Using Amplify Gen 2 client - no model listing available');
  return ['Using GraphQL API directly'];
}