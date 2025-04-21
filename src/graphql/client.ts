// src/graphql/client.ts
import { generateClient, GraphQLResult } from 'aws-amplify/api';
import { post } from 'aws-amplify/api';

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

export interface Customer {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    organizationName?: string;
    industry?: string;
    createdAt?: string;
    updatedAt?: string;
}
  
export interface Instructor {
    id?: string;
    name: string;
    email: string;
    cognitoId?: string;
    status?: string;
    bio?: string;
    createdAt?: string;
    updatedAt?: string;
}
  
export interface CourseCatalogModel {
    id?: string;
    course_id: string;
    course_name: string;
    description?: string;
    duration?: string;
    level?: string;
    delivery_method?: string;
    objectives?: string[];
    target_audience?: string[];
    createdAt?: string;
    updatedAt?: string;
}
  
export interface CourseViewModel extends CourseCatalogModel {
    title: string; // course_name과 동일 (UI 호환성용)
    status?: string;
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

// 설문조사 관련 타입 정의
export interface SurveyQuestion {
    id?: string;
    question: string;
    options: string[];
    type: 'multiple' | 'single' | 'text'; // 다중 선택, 단일 선택, 주관식
}

export interface SurveyMeta {
    title: string;
    description: string;
    timeLimit: number; // 분 단위
    isRequired: boolean;
    shuffleQuestions: boolean;
    anonymous: boolean;
}

export interface Survey {
    id: string;
    title: string;
    courseId: string;
    courseName?: string;
    surveyType: 'pre' | 'post';
    description?: string;
    questions: SurveyQuestion[];
    questionCount: number;
    responseCount: number;
    meta?: SurveyMeta;
    createdAt: string;
    updatedAt?: string;
}

// 설문 생성/수정 입력 타입
export interface SurveyInput {
    id?: string;
    courseId: string;
    surveyType: 'pre' | 'post';
    meta: SurveyMeta;
    questions: SurveyQuestion[];
}

// 설문 생성 응답 타입
export interface SurveyGenerationResponse {
    questions: SurveyQuestion[];
}

// 코스 항목 타입 (SurveyList에서 사용)
export interface CourseItem {
    id: string;
    title: string;
    description?: string;
    level?: string;
    category?: string;
    version?: string;
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

// GraphQL 쿼리 정의 - 백슬래시 제거
const LIST_COURSE_CATALOG = `
  query listCourseCatalog(
    \$filter: ModelCourseCatalogFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listCourseCatalog(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        title
        description
        level
        category
        status
        version
      }
      nextToken
    }
  }
`;

const LIST_SURVEYS = `
  query ListSurveys(
    \$filter: ModelSurveyFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listSurveys(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        title
        courseId
        courseName
        surveyType
        questionCount
        responseCount
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

const GET_SURVEY = `
  query GetSurvey(\$id: ID!) {
    getSurvey(id: \$id) {
      id
      title
      courseId
      courseName
      surveyType
      description
      questionCount
      responseCount
      meta {
        title
        description
        timeLimit
        isRequired
        shuffleQuestions
        anonymous
      }
      questions {
        id
        question
        options
        type
      }
      createdAt
      updatedAt
    }
  }
`;

const CREATE_SURVEY = `
  mutation CreateSurvey(\$input: CreateSurveyInput!) {
    createSurvey(input: \$input) {
      id
      title
      courseId
      surveyType
    }
  }
`;

const UPDATE_SURVEY = `
  mutation UpdateSurvey(\$input: UpdateSurveyInput!) {
    updateSurvey(input: \$input) {
      id
      title
    }
  }
`;

const DELETE_SURVEY = `
  mutation DeleteSurvey(\$input: DeleteSurveyInput!) {
    deleteSurvey(input: \$input) {
      id
    }
  }
`;

// ==================== 핵심 함수들 ====================

// CourseCatalog 관련 함수 - DynamoDB 테이블 필드에 맞게 쿼리 수정
export async function listCourseCatalog(options?: any) {
    try {
        const result = await client.graphql({
            query: `
        query ListCourseCatalog(\$limit: Int, \$filter: ModelCourseCatalogFilterInput, \$nextToken: String) {
          listCourseCatalog(limit: \$limit, filter: \$filter, nextToken: \$nextToken) {
            items {
              id
              title
              description
              level
              category
              status
              version
              course_name
              duration
              price
              currency
              deliveryMethod
              objectives
              targetAudience
              createdAt
              updatedAt
            }
            nextToken
          }
        }
      `,
            variables: options
        }) as GraphQLResult<any>;

        return {
            data: result.data?.listCourseCatalog?.items || [],
            nextToken: result.data?.listCourseCatalog?.nextToken,
            errors: result.errors
        };
    } catch (error) {
        console.error('Error listing course catalog:', error);
        throw error;
    }
}

// 단일 코스 카탈로그 조회
export async function getCourseCatalog(id: string) {
    try {
      const result = await client.graphql({
        query: `
          query GetCourseCatalog(\$id: ID!) {
            getCourseCatalog(id: \$id) {
              id
              title
              description
              level
              category
              status
              version
              course_name
              duration
              price
              currency
              deliveryMethod
              objectives
              targetAudience
              createdAt
              updatedAt
            }
          }
        `,
        variables: { id }
      }) as GraphQLResult<any>;
      
      return {
        data: result.data?.getCourseCatalog,
        errors: result.errors
      };
    } catch (error) {
      console.error('Error getting course catalog:', error);
      throw error;
    }
}

// Quiz 목록 조회
export async function listQuizzes(options?: any) {
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

// 단일 퀴즈 조회
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

// AI 문제 생성 함수
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

// ==================== 설문조사 관련 함수 ====================

// 설문조사 목록 조회
export async function listSurveys(options?: any) {
    try {
        const result = await client.graphql({
            query: LIST_SURVEYS,
            variables: options
        }) as GraphQLResult<any>;

        return {
            data: result.data?.listSurveys?.items || [],
            errors: result.errors
        };
    } catch (error) {
        console.error('Error listing surveys:', error);
        throw error;
    }
}

// 설문조사 상세 조회
export async function getSurvey(surveyId: string) {
    try {
        const result = await client.graphql({
            query: GET_SURVEY,
            variables: { id: surveyId }
        }) as GraphQLResult<any>;

        return {
            data: result.data?.getSurvey,
            errors: result.errors
        };
    } catch (error) {
        console.error('Error getting survey:', error);
        throw error;
    }
}

// 설문조사 생성
export async function createSurvey(surveyData: SurveyInput) {
    try {
        const result = await client.graphql({
            query: CREATE_SURVEY,
            variables: { input: surveyData }
        }) as GraphQLResult<any>;

        return {
            data: result.data?.createSurvey,
            errors: result.errors
        };
    } catch (error) {
        console.error('Error creating survey:', error);
        throw error;
    }
}

// 설문조사 수정
export async function updateSurvey(surveyData: Partial<SurveyInput> & { id: string }) {
    try {
        const result = await client.graphql({
            query: UPDATE_SURVEY,
            variables: { input: surveyData }
        }) as GraphQLResult<any>;

        return {
            data: result.data?.updateSurvey,
            errors: result.errors
        };
    } catch (error) {
        console.error('Error updating survey:', error);
        throw error;
    }
}

// 설문조사 삭제
export async function deleteSurvey(surveyId: string) {
    try {
        const result = await client.graphql({
            query: DELETE_SURVEY,
            variables: { input: { id: surveyId } }
        }) as GraphQLResult<any>;

        return {
            data: result.data?.deleteSurvey,
            errors: result.errors
        };
    } catch (error) {
        console.error('Error deleting survey:', error);
        throw error;
    }
}

// 설문조사 AI 생성 함수
export async function generateSurvey(params: {
    courseId: string;
    surveyType: 'pre' | 'post';
    questionCount: number;
}): Promise<SurveyGenerationResponse> {
    try {
        const response = await post({
            apiName: 'surveyApi',
            path: '/generate-survey',
            options: {
                body: JSON.stringify(params)
            }
        }).response;

        const jsonData = await response.body.json() as unknown;

        // 타입 가드를 사용하여 응답 데이터 검증
        if (!isSurveyGenerationResponse(jsonData)) {
            throw new Error('Invalid response format from survey generation API');
        }

        return jsonData;
    } catch (error) {
        console.error('Error generating survey:', error);

        // 개발 환경용 더미 데이터
        if (process.env.NODE_ENV === 'development') {
            // 더미 질문 생성
            const dummyQuestions: SurveyQuestion[] = [
                {
                    question: "전반적인 만족도를 평가해주세요.",
                    type: "single",
                    options: [
                        "매우 불만족", "불만족", "보통", "만족", "매우 만족"
                    ]
                },
                {
                    question: "이 과정에서 가장 기대하는 부분은 무엇인가요?",
                    type: "text",
                    options: []
                },
                {
                    question: "참여 목적을 선택해주세요. (여러 개 선택 가능)",
                    type: "multiple",
                    options: [
                        "업무 역량 강화", "자기 개발", "회사 요청", "자격증 취득", "기타"
                    ]
                },
                {
                    question: "추가 의견이 있다면 작성해주세요.",
                    type: "text",
                    options: []
                }
            ];

            return { questions: dummyQuestions };
        }

        throw error;
    }
}

// 설문조사 복사 함수
export async function copySurvey(params: { surveyId: string, targetType: 'pre' | 'post' }) {
    try {
        const response = await post({
            apiName: 'surveyApi',
            path: '/copy-survey',
            options: {
                body: JSON.stringify(params)
            }
        }).response;

        const jsonData = await response.body.json();
        return jsonData;
    } catch (error) {
        console.error('Error copying survey:', error);
        throw error;
    }
}

// 설문조사 저장 함수
export async function saveSurvey(surveyData: {
    courseId: string;
    surveyType: 'pre' | 'post';
    meta: SurveyMeta;
    questions: SurveyQuestion[];
}) {
    try {
        const response = await post({
            apiName: 'surveyApi',
            path: '/save-survey',
            options: {
                body: JSON.stringify(surveyData)
            }
        }).response;

        const jsonData = await response.body.json();
        return jsonData;
    } catch (error) {
        console.error('Error saving survey:', error);
        throw error;
    }
}

// ==================== 고객사(Customer) 관련 함수 ====================
export async function listCustomers(options?: any) {
    try {
      const result = await client.graphql({
        query: `
          query ListCustomers(\$limit: Int, \$filter: ModelCustomerFilterInput, \$nextToken: String) {
            listCustomers(limit: \$limit, filter: \$filter, nextToken: \$nextToken) {
              items {
                id
                name
                email
                phone
                address
                organizationName
                industry
                createdAt
                updatedAt
              }
              nextToken
            }
          }
        `,
        variables: options
      }) as GraphQLResult<any>;
      
      return {
        data: result.data?.listCustomers?.items || [],
        nextToken: result.data?.listCustomers?.nextToken,
        errors: result.errors
      };
    } catch (error) {
      console.error('Error listing customers:', error);
      throw error;
    }
}
  
export async function getCustomer(customerId: string) {
    try {
      const result = await client.graphql({
        query: `
          query GetCustomer(\$id: ID!) {
            getCustomer(id: \$id) {
              id
              name
              email
              phone
              address
              organizationName
              industry
              createdAt
              updatedAt
            }
          }
        `,
        variables: { id: customerId }
      }) as GraphQLResult<any>;
      
      return {
        data: result.data?.getCustomer,
        errors: result.errors
      };
    } catch (error) {
      console.error('Error getting customer:', error);
      throw error;
    }
}
  
export async function createCustomer(input: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await client.graphql({
        query: `
          mutation CreateCustomer(\$input: CreateCustomerInput!) {
            createCustomer(input: \$input) {
              id
              name
              email
              phone
              address
              organizationName
              industry
              createdAt
              updatedAt
            }
          }
        `,
        variables: { input }
      }) as GraphQLResult<any>;
      
      return {
        data: result.data?.createCustomer,
        errors: result.errors
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
}
  
export async function updateCustomer(input: Partial<Customer> & { id: string }) {
    try {
      const result = await client.graphql({
        query: `
          mutation UpdateCustomer(\$input: UpdateCustomerInput!) {
            updateCustomer(input: \$input) {
              id
              name
              email
              phone
              address
              organizationName
              industry
              createdAt
              updatedAt
            }
          }
        `,
        variables: { input }
      }) as GraphQLResult<any>;
      
      return {
        data: result.data?.updateCustomer,
        errors: result.errors
      };
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
}
  
export async function deleteCustomer(id: string) {
    try {
      const result = await client.graphql({
        query: `
          mutation DeleteCustomer(\$input: DeleteCustomerInput!) {
            deleteCustomer(input: \$input) {
              id
              name
            }
          }
        `,
        variables: { input: { id } }
      }) as GraphQLResult<any>;
      
      return {
        data: result.data?.deleteCustomer,
        errors: result.errors
      };
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
}
  
// ==================== 강사(Instructor) 관련 함수 ====================
export async function listInstructors(options?: any) {
    try {
      const result = await client.graphql({
        query: `
          query ListInstructors(\$limit: Int, \$filter: ModelInstructorFilterInput, \$nextToken: String) {
            listInstructors(limit: \$limit, filter: \$filter, nextToken: \$nextToken) {
              items {
                id
                name
                email
                cognitoId
                status
                bio
                createdAt
                updatedAt
              }
              nextToken
            }
          }
        `,
        variables: options
      }) as GraphQLResult<any>;
      
      return {
        data: result.data?.listInstructors?.items || [],
        nextToken: result.data?.listInstructors?.nextToken,
        errors: result.errors
      };
    } catch (error) {
      console.error('Error listing instructors:', error);
      throw error;
    }
}
  
export async function getInstructor(instructorId: string) {
    try {
      const result = await client.graphql({
        query: `
          query GetInstructor(\$id: ID!) {
            getInstructor(id: \$id) {
              id
              name
              email
              cognitoId
              status
              bio
              createdAt
              updatedAt
            }
          }
        `,
        variables: { id: instructorId }
      }) as GraphQLResult<any>;
      
      return {
        data: result.data?.getInstructor,
        errors: result.errors
      };
    } catch (error) {
      console.error('Error getting instructor:', error);
      throw error;
    }
}
  
export async function createInstructor(input: Omit<Instructor, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const result = await client.graphql({
        query: `
          mutation CreateInstructor(\$input: CreateInstructorInput!) {
            createInstructor(input: \$input) {
              id
              name
              email
              cognitoId
              status
              bio
              createdAt
              updatedAt
            }
          }
        `,
        variables: { input }
      }) as GraphQLResult<any>;
      
      return {
        data: result.data?.createInstructor,
        errors: result.errors
      };
    } catch (error) {
      console.error('Error creating instructor:', error);
      throw error;
    }
}
  
export async function updateInstructor(input: Partial<Instructor> & { id: string }) {
    try {
      const result = await client.graphql({
        query: `
          mutation UpdateInstructor(\$input: UpdateInstructorInput!) {
            updateInstructor(input: \$input) {
              id
              name
              email
              cognitoId
              status
              bio
              createdAt
              updatedAt
            }
          }
        `,
        variables: { input }
      }) as GraphQLResult<any>;
      
      return {
        data: result.data?.updateInstructor,
        errors: result.errors
      };
    } catch (error) {
      console.error('Error updating instructor:', error);
      throw error;
    }
}
  
export async function deleteInstructor(id: string) {
    try {
      const result = await client.graphql({
        query: `
          mutation DeleteInstructor(\$input: DeleteInstructorInput!) {
            deleteInstructor(input: \$input) {
              id
              name
            }
          }
        `,
        variables: { input: { id } }
      }) as GraphQLResult<any>;
      
      return {
        data: result.data?.deleteInstructor,
        errors: result.errors
      };
    } catch (error) {
      console.error('Error deleting instructor:', error);
      throw error;
    }
}
  
// 백엔드 데이터를 UI 뷰모델로 변환하는 함수
export function mapToViewModel(course: CourseCatalogModel): CourseViewModel {
    return {
      id: course.id || '',
      course_id: course.course_id || '',
      course_name: course.course_name || '',
      title: course.course_name || '', // UI 호환성용
      description: course.description,
      duration: course.duration,
      level: course.level,
      delivery_method: course.delivery_method,
      objectives: course.objectives || [],
      target_audience: course.target_audience || [],
      status: 'ACTIVE', // UI용 기본값
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };
}
  
// UI 뷰모델을 백엔드 데이터로 변환하는 함수
export function mapToBackendModel(viewModel: CourseViewModel): CourseCatalogModel {
    return {
      id: viewModel.id,
      course_id: viewModel.course_id,
      course_name: viewModel.course_name,
      description: viewModel.description,
      duration: viewModel.duration,
      level: viewModel.level,
      delivery_method: viewModel.delivery_method,
      objectives: viewModel.objectives,
      target_audience: viewModel.target_audience
    };
}

// 타입 가드 함수
export function isSurveyGenerationResponse(obj: unknown): obj is SurveyGenerationResponse {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'questions' in obj &&
        Array.isArray((obj as any).questions)
    );
}