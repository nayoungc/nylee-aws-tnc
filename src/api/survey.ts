import { amplifyClient } from './config';
import { post } from 'aws-amplify/api';
import { GraphQLResult } from 'aws-amplify/api';
import { SurveyInput, SurveyQuestion, SurveyMeta, SurveyGenerationResponse } from './types';

// GraphQL 쿼리 상수
const LIST_SURVEYS = `
  query ListSurveys(\$filter: ModelSurveyFilterInput, \$limit: Int, \$nextToken: String) {
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

// 설문조사 목록 조회
export async function listSurveys(options?: any) {
  try {
    const result = await amplifyClient.graphql({
      query: LIST_SURVEYS,
      variables: options
    }) as GraphQLResult<any>;

    return {
      data: result.data?.listSurveys?.items || [],
      nextToken: result.data?.listSurveys?.nextToken,
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
    const result = await amplifyClient.graphql({
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
    const result = await amplifyClient.graphql({
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
    const result = await amplifyClient.graphql({
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
    const result = await amplifyClient.graphql({
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

// 타입 가드 함수
export function isSurveyGenerationResponse(obj: unknown): obj is SurveyGenerationResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'questions' in obj &&
    Array.isArray((obj as any).questions)
  );
}