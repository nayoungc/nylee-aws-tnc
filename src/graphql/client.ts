// // src/graphql/client.ts
// import { generateClient, GraphQLResult } from 'aws-amplify/api';
// import { post } from 'aws-amplify/api';
// import * as AWS from 'aws-sdk';

// // AWS SDK 구성
// AWS.config.update({
//   region: process.env.REACT_APP_AWS_REGION || 'us-east-1'
// });

// // Amplify Gen 2 클라이언트 생성
// export const client = generateClient();

// // ==================== 기본 인터페이스 정의 ====================

// // 1. DynamoDB 테이블 구조에 맞는 인터페이스 정의
// export interface CourseCatalog {
//   catalogId: string;        // 파티션 키
//   title: string;           // 정렬 키 
//   version: string;         // GSI1 정렬 키
//   awsCode?: string;        // GSI2 해시 키
//   description?: string;
//   isPublished: boolean;
//   publishedDate?: string;
//   // 추가 필드
//   level?: string;
//   duration?: number;
//   price?: number;
//   currency?: string;
//   status?: string;
//   category?: string;
//   deliveryMethod?: string;
//   objectives?: string[];
//   targetAudience?: string[];
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface CatalogModule {
//   catalogId: string;        // 파티션 키
//   moduleNumber: string;     // 정렬 키
//   title: string;           // GSI1 해시 키
//   description?: string;
//   duration?: number;
//   learningObjectives?: string[];
//   prerequisites?: string[];
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface CatalogLab {
//   catalogId: string;        // 파티션 키
//   labNumber: string;        // 정렬 키
//   moduleId: string;         // GSI1 해시 키 
//   title: string;           // GSI2 해시 키
//   description?: string;
//   duration?: number;
//   instructions?: string;
//   resources?: string[];
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface Customer {
//   id?: string;
//   name: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface Question {
//   id?: string;
//   question: string;
//   options: string[];
//   correctAnswer: string | number;
//   explanation?: string;
//   difficulty?: string;
//   tags?: string[];
//   quality?: number;
// }

// export interface Quiz {
//   id: string;
//   courseId: string;
//   courseName?: string;
//   quizType: 'pre' | 'post';
//   title: string;
//   description?: string;
//   timeLimit?: number;
//   passScore?: number;
//   shuffleQuestions?: boolean;
//   shuffleOptions?: boolean;
//   showFeedback?: boolean;
//   questions?: Question[];
//   questionCount?: number;
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface Course {
//   lmsId: string;            // 파티션 키
//   startDate: string;        // 정렬 키
//   catalogId: string;        // GSI1 파티션 키
//   shareCode?: string;       // GSI2 파티션 키
//   instructor?: string;      // GSI3 파티션 키
//   customerId: string;       // GSI4 파티션 키
//   title: string;
//   description?: string;
//   duration: number;         // 과정 기간(일 수)
//   status: string;           // 예정됨, 진행중, 완료됨 등
//   deliveryMethod?: string;  // 온라인/오프라인/혼합
//   assessments?: {           // 선택적 평가 요소들을 Map 타입으로 저장
//     preQuiz?: string;
//     postQuiz?: string;
//     preSurvey?: string;
//     postSurvey?: string;
//     [key: string]: string | undefined; // 추가 평가 유형을 위한 인덱스 시그니처
//   };
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface Assessment {
//   id: string;
//   type: string;
//   title: string;
//   questionCount: number;
//   status: string;
// }

// // 설문조사 관련 타입 정의
// export interface SurveyQuestion {
//   id?: string;
//   question: string;
//   options: string[];
//   type: 'multiple' | 'single' | 'text';
// }

// export interface SurveyMeta {
//   title: string;
//   description: string;
//   timeLimit: number;
//   isRequired: boolean;
//   shuffleQuestions: boolean;
//   anonymous: boolean;
// }

// export interface Survey {
//   id: string;
//   title: string;
//   courseId: string;
//   courseName?: string;
//   surveyType: 'pre' | 'post';
//   description?: string;
//   questions: SurveyQuestion[];
//   questionCount: number;
//   responseCount: number;
//   meta?: SurveyMeta;
//   createdAt: string;
//   updatedAt?: string;
// }

// export interface SurveyInput {
//   id?: string;
//   courseId: string;
//   surveyType: 'pre' | 'post';
//   meta: SurveyMeta;
//   questions: SurveyQuestion[];
// }

// export interface SurveyGenerationResponse {
//   questions: SurveyQuestion[];
// }

// export interface CourseItem {
//   id: string;
//   title: string;
//   description?: string;
//   level?: string;
//   category?: string;
//   version?: string;
// }

// // 함수 타입 정의
// export type QuizParams = {
//   courseId: string;
//   quizType: 'pre' | 'post';
//   modelType: 'basic' | 'advanced';
//   questionCount: number;
//   contextPrompt?: string;
// };

// // ==================== GraphQL 상수 ====================
// const LIST_SURVEYS = `
//   query ListSurveys(
//     \\$filter: ModelSurveyFilterInput
//     \\$limit: Int
//     \\$nextToken: String
//   ) {
//     listSurveys(filter: \\$filter, limit: \\$limit, nextToken: \\$nextToken) {
//       items {
//         id
//         title
//         courseId
//         courseName
//         surveyType
//         questionCount
//         responseCount
//         createdAt
//         updatedAt
//       }
//       nextToken
//     }
//   }
// `;

// const GET_SURVEY = `
//   query GetSurvey(\\$id: ID!) {
//     getSurvey(id: \\$id) {
//       id
//       title
//       courseId
//       courseName
//       surveyType
//       description
//       questionCount
//       responseCount
//       meta {
//         title
//         description
//         timeLimit
//         isRequired
//         shuffleQuestions
//         anonymous
//       }
//       questions {
//         id
//         question
//         options
//         type
//       }
//       createdAt
//       updatedAt
//     }
//   }
// `;

// const CREATE_SURVEY = `
//   mutation CreateSurvey(\\$input: CreateSurveyInput!) {
//     createSurvey(input: \\$input) {
//       id
//       title
//       courseId
//       surveyType
//     }
//   }
// `;

// const UPDATE_SURVEY = `
//   mutation UpdateSurvey(\\$input: UpdateSurveyInput!) {
//     updateSurvey(input: \\$input) {
//       id
//       title
//     }
//   }
// `;

// const DELETE_SURVEY = `
//   mutation DeleteSurvey(\\$input: DeleteSurveyInput!) {
//     deleteSurvey(input: \\$input) {
//       id
//     }
//   }
// `;

// // ==================== DynamoDB 테이블 접근 함수 ====================

// // ========== CourseCatalog 테이블 관련 함수 ==========
// export async function listCourseCatalogs(options?: any) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-CourseCatalog',
//       ...options
//     };
    
//     const result = await dynamodb.scan(params).promise();
    
//     return {
//       data: result.Items || [],
//       lastEvaluatedKey: result.LastEvaluatedKey,
//     };
//   } catch (error) {
//     console.error('Error listing course catalogs:', error);
//     throw error;
//   }
// }

// export async function getCourseCatalog(catalogId: string, title: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-CourseCatalog',
//       Key: {
//         catalogId: catalogId,
//         title: title
//       }
//     };
    
//     const result = await dynamodb.get(params).promise();
    
//     return {
//       data: result.Item,
//     };
//   } catch (error) {
//     console.error('Error getting course catalog:', error);
//     throw error;
//   }
// }

// // ========== Module 테이블 관련 함수 ==========
// export async function listModules(catalogId: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-CourseCatalog-Modules',
//       KeyConditionExpression: 'catalogId = :catalogId',
//       ExpressionAttributeValues: {
//         ':catalogId': catalogId
//       }
//     };
    
//     const result = await dynamodb.query(params).promise();
    
//     return {
//       data: result.Items || [],
//       lastEvaluatedKey: result.LastEvaluatedKey,
//     };
//   } catch (error) {
//     console.error('Error listing modules:', error);
//     throw error;
//   }
// }

// export async function getModule(catalogId: string, moduleNumber: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-CourseCatalog-Modules',
//       Key: {
//         catalogId: catalogId,
//         moduleNumber: moduleNumber
//       }
//     };
    
//     const result = await dynamodb.get(params).promise();
    
//     return {
//       data: result.Item,
//     };
//   } catch (error) {
//     console.error('Error getting module:', error);
//     throw error;
//   }
// }

// // ========== Lab 테이블 관련 함수 ==========
// export async function listLabs(catalogId: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-CourseCatalog-Labs',
//       KeyConditionExpression: 'catalogId = :catalogId',
//       ExpressionAttributeValues: {
//         ':catalogId': catalogId
//       }
//     };
    
//     const result = await dynamodb.query(params).promise();
    
//     return {
//       data: result.Items || [],
//       lastEvaluatedKey: result.LastEvaluatedKey,
//     };
//   } catch (error) {
//     console.error('Error listing labs:', error);
//     throw error;
//   }
// }

// export async function getLabsForModule(moduleId: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-CourseCatalog-Labs',
//       IndexName: 'Tnc-CourseCatalog-Labs-GSI1',
//       KeyConditionExpression: 'moduleId = :moduleId',
//       ExpressionAttributeValues: {
//         ':moduleId': moduleId
//       }
//     };
    
//     const result = await dynamodb.query(params).promise();
    
//     return {
//       data: result.Items || [],
//       lastEvaluatedKey: result.LastEvaluatedKey,
//     };
//   } catch (error) {
//     console.error('Error listing labs for module:', error);
//     throw error;
//   }
// }

// export async function getLab(catalogId: string, labNumber: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-CourseCatalog-Labs',
//       Key: {
//         catalogId: catalogId,
//         labNumber: labNumber
//       }
//     };
    
//     const result = await dynamodb.get(params).promise();
    
//     return {
//       data: result.Item,
//     };
//   } catch (error) {
//     console.error('Error getting lab:', error);
//     throw error;
//   }
// }

// // ========== GSI 활용 조회 함수 ==========
// export async function queryCatalogByTitle(title: string, version?: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     let params: any = {
//       TableName: 'Tnc-CourseCatalog',
//       IndexName: 'Tnc-CourseCatalog-GSI1',
//       KeyConditionExpression: 'title = :title',
//       ExpressionAttributeValues: {
//         ':title': title
//       }
//     };
    
//     if (version) {
//       params.KeyConditionExpression += ' AND version = :version';
//       params.ExpressionAttributeValues[':version'] = version;
//     }
    
//     const result = await dynamodb.query(params).promise();
    
//     return {
//       data: result.Items || [],
//       lastEvaluatedKey: result.LastEvaluatedKey,
//     };
//   } catch (error) {
//     console.error('Error querying catalog by title:', error);
//     throw error;
//   }
// }

// export async function queryCatalogByAwsCode(awsCode: string, version?: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     let params: any = {
//       TableName: 'Tnc-CourseCatalog',
//       IndexName: 'Tnc-CourseCatalog-GSI2',
//       KeyConditionExpression: 'awsCode = :awsCode',
//       ExpressionAttributeValues: {
//         ':awsCode': awsCode
//       }
//     };
    
//     if (version) {
//       params.KeyConditionExpression += ' AND version = :version';
//       params.ExpressionAttributeValues[':version'] = version;
//     }
    
//     const result = await dynamodb.query(params).promise();
    
//     return {
//       data: result.Items || [],
//       lastEvaluatedKey: result.LastEvaluatedKey,
//     };
//   } catch (error) {
//     console.error('Error querying catalog by AWS code:', error);
//     throw error;
//   }
// }

// export async function queryModuleByTitle(title: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-CourseCatalog-Modules',
//       IndexName: 'Tnc-CourseCatalog-Modules-GSI1',
//       KeyConditionExpression: 'title = :title',
//       ExpressionAttributeValues: {
//         ':title': title
//       }
//     };
    
//     const result = await dynamodb.query(params).promise();
    
//     return {
//       data: result.Items || [],
//       lastEvaluatedKey: result.LastEvaluatedKey,
//     };
//   } catch (error) {
//     console.error('Error querying module by title:', error);
//     throw error;
//   }
// }

// export async function queryLabByTitle(title: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-CourseCatalog-Labs',
//       IndexName: 'Tnc-CourseCatalog-Labs-GSI2',
//       KeyConditionExpression: 'title = :title',
//       ExpressionAttributeValues: {
//         ':title': title
//       }
//     };
    
//     const result = await dynamodb.query(params).promise();
    
//     return {
//       data: result.Items || [],
//       lastEvaluatedKey: result.LastEvaluatedKey,
//     };
//   } catch (error) {
//     console.error('Error querying lab by title:', error);
//     throw error;
//   }
// }

// // ========== 생성 및 수정 함수 ==========
// export async function createCourseCatalog(item: CourseCatalog) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-CourseCatalog',
//       Item: item
//     };
    
//     await dynamodb.put(params).promise();
    
//     return {
//       data: item,
//     };
//   } catch (error) {
//     console.error('Error creating course catalog:', error);
//     throw error;
//   }
// }

// export async function updateCourseCatalog(item: Partial<CourseCatalog> & { catalogId: string, title: string }) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
    
//     // 업데이트할 표현식과 속성 값 준비
//     const updateExpressionParts: string[] = [];
//     const expressionAttributeNames: Record<string, string> = {};
//     const expressionAttributeValues: Record<string, any> = {};
    
//     // 파티션 키와 정렬 키를 제외한 모든 속성에 대해 업데이트 표현식 생성
//     Object.entries(item).forEach(([key, value]) => {
//       if (key !== 'catalogId' && key !== 'title' && value !== undefined) {
//         updateExpressionParts.push(`#\${key} = :\${key}`);
//         expressionAttributeNames[`#\${key}`] = key;
//         expressionAttributeValues[`:\${key}`] = value;
//       }
//     });
    
//     // 업데이트할 속성이 없으면 그냥 반환
//     if (updateExpressionParts.length === 0) {
//       return { data: item };
//     }
    
//     const params = {
//       TableName: 'Tnc-CourseCatalog',
//       Key: {
//         catalogId: item.catalogId,
//         title: item.title
//       },
//       UpdateExpression: `SET \${updateExpressionParts.join(', ')}`,
//       ExpressionAttributeNames: expressionAttributeNames,
//       ExpressionAttributeValues: expressionAttributeValues,
//       ReturnValues: 'ALL_NEW'
//     };
    
//     const result = await dynamodb.update(params).promise();
    
//     return {
//       data: result.Attributes,
//     };
//   } catch (error) {
//     console.error('Error updating course catalog:', error);
//     throw error;
//   }
// }

// export async function createModule(item: CatalogModule) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-CourseCatalog-Modules',
//       Item: item
//     };
    
//     await dynamodb.put(params).promise();
    
//     return {
//       data: item,
//     };
//   } catch (error) {
//     console.error('Error creating module:', error);
//     throw error;
//   }
// }

// export async function updateModule(item: Partial<CatalogModule> & { catalogId: string, moduleNumber: string }) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
    
//     // 업데이트할 표현식과 속성 값 준비
//     const updateExpressionParts: string[] = [];
//     const expressionAttributeNames: Record<string, string> = {};
//     const expressionAttributeValues: Record<string, any> = {};
    
//     Object.entries(item).forEach(([key, value]) => {
//       if (key !== 'catalogId' && key !== 'moduleNumber' && value !== undefined) {
//         updateExpressionParts.push(`#\${key} = :\${key}`);
//         expressionAttributeNames[`#\${key}`] = key;
//         expressionAttributeValues[`:\${key}`] = value;
//       }
//     });
    
//     if (updateExpressionParts.length === 0) {
//       return { data: item };
//     }
    
//     const params = {
//       TableName: 'Tnc-CourseCatalog-Modules',
//       Key: {
//         catalogId: item.catalogId,
//         moduleNumber: item.moduleNumber
//       },
//       UpdateExpression: `SET \${updateExpressionParts.join(', ')}`,
//       ExpressionAttributeNames: expressionAttributeNames,
//       ExpressionAttributeValues: expressionAttributeValues,
//       ReturnValues: 'ALL_NEW'
//     };
    
//     const result = await dynamodb.update(params).promise();
    
//     return {
//       data: result.Attributes,
//     };
//   } catch (error) {
//     console.error('Error updating module:', error);
//     throw error;
//   }
// }

// export async function createLab(item: CatalogLab) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-CourseCatalog-Labs',
//       Item: item
//     };
    
//     await dynamodb.put(params).promise();
    
//     return {
//       data: item,
//     };
//   } catch (error) {
//     console.error('Error creating lab:', error);
//     throw error;
//   }
// }

// export async function updateLab(item: Partial<CatalogLab> & { catalogId: string, labNumber: string }) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
    
//     const updateExpressionParts: string[] = [];
//     const expressionAttributeNames: Record<string, string> = {};
//     const expressionAttributeValues: Record<string, any> = {};
    
//     Object.entries(item).forEach(([key, value]) => {
//       if (key !== 'catalogId' && key !== 'labNumber' && value !== undefined) {
//         updateExpressionParts.push(`#\${key} = :\${key}`);
//         expressionAttributeNames[`#\${key}`] = key;
//         expressionAttributeValues[`:\${key}`] = value;
//       }
//     });
    
//     if (updateExpressionParts.length === 0) {
//       return { data: item };
//     }
    
//     const params = {
//       TableName: 'Tnc-CourseCatalog-Labs',
//       Key: {
//         catalogId: item.catalogId,
//         labNumber: item.labNumber
//       },
//       UpdateExpression: `SET \${updateExpressionParts.join(', ')}`,
//       ExpressionAttributeNames: expressionAttributeNames,
//       ExpressionAttributeValues: expressionAttributeValues,
//       ReturnValues: 'ALL_NEW'
//     };
    
//     const result = await dynamodb.update(params).promise();
    
//     return {
//       data: result.Attributes,
//     };
//   } catch (error) {
//     console.error('Error updating lab:', error);
//     throw error;
//   }
// }

// // ==================== Quiz 관련 함수 ====================
// export async function listQuizzes(options?: any) {
//   try {
//     const result = await client.graphql({
//       query: `
//         query ListQuizzes(\$filter: ModelQuizFilterInput, \$limit: Int) {
//           listQuizzes(filter: \$filter, limit: \$limit) {
//             items {
//               id
//               courseId
//               courseName
//               quizType
//               title
//               description
//               questionCount
//               timeLimit
//               passScore
//               createdAt
//               updatedAt
//             }
//           }
//         }
//       `,
//       variables: options
//     }) as GraphQLResult<any>;

//     return {
//       data: result.data?.listQuizzes?.items || [],
//       errors: result.errors
//     };
//   } catch (error) {
//     console.error('Error listing quizzes:', error);
//     throw error;
//   }
// }

// export async function getQuiz(quizId: string) {
//   try {
//     const result = await client.graphql({
//       query: `
//         query GetQuiz(\$quizId: ID!) {
//           getQuiz(id: \$quizId) {
//             id
//             courseId
//             courseName
//             quizType
//             title
//             description
//             timeLimit
//             passScore
//             shuffleQuestions
//             shuffleOptions
//             showFeedback
//             questions {
//               id
//               question
//               options
//               correctAnswer
//               explanation
//               difficulty
//               tags
//               quality
//             }
//             createdAt
//             updatedAt
//           }
//         }
//       `,
//       variables: { quizId }
//     }) as GraphQLResult<any>;

//     return {
//       data: result.data?.getQuiz,
//       errors: result.errors
//     };
//   } catch (error) {
//     console.error('Error getting quiz:', error);
//     throw error;
//   }
// }

// export async function generateQuizFromContent(params: QuizParams): Promise<Question[]> {
//   try {
//     const result = await client.graphql({
//       query: `
//         mutation GenerateQuizQuestions(\$input: GenerateQuizInput!) {
//           generateQuizQuestions(input: \$input) {
//             id
//             question
//             options
//             correctAnswer
//             explanation
//             difficulty
//             tags
//             quality
//           }
//         }
//       `,
//       variables: { input: params }
//     }) as GraphQLResult<any>;

//     return result.data?.generateQuizQuestions || [];
//   } catch (error) {
//     console.error('Error generating quiz questions:', error);

//     if (process.env.NODE_ENV === 'development') {
//       console.log('Returning mock quiz questions');
//       return Array(params.questionCount).fill(0).map((_, i) => ({
//         id: `q-\${i}`,
//         question: `Sample question \${i+1}?`,
//         options: ['Option A', 'Option B', 'Option C', 'Option D'],
//         correctAnswer: 0,
//         explanation: 'This is an explanation for the sample question.',
//         difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
//         quality: 0.7 + Math.random() * 0.3
//       }));
//     }

//     throw error;
//   }
// }

// export async function createQuiz(quizData: Partial<Quiz>) {
//   try {
//     const result = await client.graphql({
//       query: `
//         mutation CreateQuiz(\$input: CreateQuizInput!) {
//           createQuiz(input: \$input) {
//             id
//             title
//           }
//         }
//       `,
//       variables: { input: quizData }
//     }) as GraphQLResult<any>;

//     return {
//       data: result.data?.createQuiz,
//       errors: result.errors
//     };
//   } catch (error) {
//     console.error('Error creating quiz:', error);
//     throw error;
//   }
// }

// export async function updateQuiz(quizData: Partial<Quiz>) {
//   try {
//     const result = await client.graphql({
//       query: `
//         mutation UpdateQuiz(\$input: UpdateQuizInput!) {
//           updateQuiz(input: \$input) {
//             id
//             title
//           }
//         }
//       `,
//       variables: { input: quizData }
//     }) as GraphQLResult<any>;

//     return {
//       data: result.data?.updateQuiz,
//       errors: result.errors
//     };
//   } catch (error) {
//     console.error('Error updating quiz:', error);
//     throw error;
//   }
// }

// export async function deleteQuiz(quizId: string) {
//   try {
//     const result = await client.graphql({
//       query: `
//         mutation DeleteQuiz(\$input: DeleteQuizInput!) {
//           deleteQuiz(input: { id: \$quizId }) {
//             id
//           }
//         }
//       `,
//       variables: { input: { id: quizId } }
//     }) as GraphQLResult<any>;

//     return {
//       data: result.data?.deleteQuiz,
//       errors: result.errors
//     };
//   } catch (error) {
//     console.error('Error deleting quiz:', error);
//     throw error;
//   }
// }

// // ==================== 설문조사 관련 함수 ====================
// export async function listSurveys(options?: any) {
//   try {
//     const result = await client.graphql({
//       query: LIST_SURVEYS,
//       variables: options
//     }) as GraphQLResult<any>;

//     return {
//       data: result.data?.listSurveys?.items || [],
//       errors: result.errors
//     };
//   } catch (error) {
//     console.error('Error listing surveys:', error);
//     throw error;
//   }
// }

// export async function getSurvey(surveyId: string) {
//   try {
//     const result = await client.graphql({
//       query: GET_SURVEY,
//       variables: { id: surveyId }
//     }) as GraphQLResult<any>;

//     return {
//       data: result.data?.getSurvey,
//       errors: result.errors
//     };
//   } catch (error) {
//     console.error('Error getting survey:', error);
//     throw error;
//   }
// }

// export async function createSurvey(surveyData: SurveyInput) {
//   try {
//     const result = await client.graphql({
//       query: CREATE_SURVEY,
//       variables: { input: surveyData }
//     }) as GraphQLResult<any>;

//     return {
//       data: result.data?.createSurvey,
//       errors: result.errors
//     };
//   } catch (error) {
//     console.error('Error creating survey:', error);
//     throw error;
//   }
// }

// export async function updateSurvey(surveyData: Partial<SurveyInput> & { id: string }) {
//   try {
//     const result = await client.graphql({
//       query: UPDATE_SURVEY,
//       variables: { input: surveyData }
//     }) as GraphQLResult<any>;

//     return {
//       data: result.data?.updateSurvey,
//       errors: result.errors
//     };
//   } catch (error) {
//     console.error('Error updating survey:', error);
//     throw error;
//   }
// }

// export async function deleteSurvey(surveyId: string) {
//   try {
//     const result = await client.graphql({
//       query: DELETE_SURVEY,
//       variables: { input: { id: surveyId } }
//     }) as GraphQLResult<any>;

//     return {
//       data: result.data?.deleteSurvey,
//       errors: result.errors
//     };
//   } catch (error) {
//     console.error('Error deleting survey:', error);
//     throw error;
//   }
// }

// export async function generateSurvey(params: {
//   courseId: string;
//   surveyType: 'pre' | 'post';
//   questionCount: number;
// }): Promise<SurveyGenerationResponse> {
//   try {
//     const response = await post({
//       apiName: 'surveyApi',
//       path: '/generate-survey',
//       options: {
//         body: JSON.stringify(params)
//       }
//     }).response;

//     const jsonData = await response.body.json() as unknown;

//     if (!isSurveyGenerationResponse(jsonData)) {
//       throw new Error('Invalid response format from survey generation API');
//     }

//     return jsonData;
//   } catch (error) {
//     console.error('Error generating survey:', error);

//     if (process.env.NODE_ENV === 'development') {
//       const dummyQuestions: SurveyQuestion[] = [
//         {
//           question: "전반적인 만족도를 평가해주세요.",
//           type: "single",
//           options: ["매우 불만족", "불만족", "보통", "만족", "매우 만족"]
//         },
//         {
//           question: "이 과정에서 가장 기대하는 부분은 무엇인가요?",
//           type: "text",
//           options: []
//         },
//         {
//           question: "참여 목적을 선택해주세요. (여러 개 선택 가능)",
//           type: "multiple",
//           options: ["업무 역량 강화", "자기 개발", "회사 요청", "자격증 취득", "기타"]
//         },
//         {
//           question: "추가 의견이 있다면 작성해주세요.",
//           type: "text",
//           options: []
//         }
//       ];

//       return { questions: dummyQuestions };
//     }

//     throw error;
//   }
// }

// export async function copySurvey(params: { surveyId: string, targetType: 'pre' | 'post' }) {
//   try {
//     const response = await post({
//       apiName: 'surveyApi',
//       path: '/copy-survey',
//       options: {
//         body: JSON.stringify(params)
//       }
//     }).response;

//     const jsonData = await response.body.json();
//     return jsonData;
//   } catch (error) {
//     console.error('Error copying survey:', error);
//     throw error;
//   }
// }

// export async function saveSurvey(surveyData: {
//   courseId: string;
//   surveyType: 'pre' | 'post';
//   meta: SurveyMeta;
//   questions: SurveyQuestion[];
// }) {
//   try {
//     const response = await post({
//       apiName: 'surveyApi',
//       path: '/save-survey',
//       options: {
//         body: JSON.stringify(surveyData)
//       }
//     }).response;

//     const jsonData = await response.body.json();
//     return jsonData;
//   } catch (error) {
//     console.error('Error saving survey:', error);
//     throw error;
//   }
// }

// // ==================== 유틸리티 함수 ====================

// // 데이터 변환 함수
// export function mapToCourseViewModel(item: any): CourseCatalog {
//   return {
//     catalogId: item.catalogId || item.course_id || item.id || '',
//     title: item.title || item.course_name || '',
//     version: item.version || 'v1',
//     awsCode: item.awsCode,
//     description: item.description,
//     category: item.category || '',
//     level: item.level,
//     duration: item.duration,
//     price: item.price,
//     currency: item.currency,
//     isPublished: item.isPublished !== undefined ? item.isPublished : true,
//     publishedDate: item.publishedDate,
//     deliveryMethod: item.deliveryMethod || item.delivery_method || '',
//     objectives: item.objectives || [],
//     targetAudience: item.targetAudience || item.target_audience || [],
//     status: item.status || 'ACTIVE',
//     createdAt: item.createdAt,
//     updatedAt: item.updatedAt
//   };
// }

//  // ========== Courses 테이블 관련 함수 ==========

// // 과정 인스턴스 목록 조회
// export async function listCourseInstances(options?: any) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-Courses',
//       ...options
//     };
    
//     const result = await dynamodb.scan(params).promise();
    
//     return {
//       data: result.Items || [],
//       lastEvaluatedKey: result.LastEvaluatedKey,
//     };
//   } catch (error) {
//     console.error('Error listing course instances:', error);
//     throw error;
//   }
// }

// // 특정 과정 인스턴스 조회
// export async function getCourseInstance(lmsId: string, startDate: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-Courses',
//       Key: {
//         lmsId,
//         startDate
//       }
//     };
    
//     const result = await dynamodb.get(params).promise();
    
//     return {
//       data: result.Item,
//     };
//   } catch (error) {
//     console.error('Error getting course instance:', error);
//     throw error;
//   }
// }

// // 과정 인스턴스 생성
// export async function createCourseInstance(item: CourseInstance) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
    
//     // 타임스탬프 추가
//     const now = new Date().toISOString();
//     const courseItem = {
//       ...item,
//       createdAt: now,
//       updatedAt: now
//     };
    
//     const params = {
//       TableName: 'Tnc-Courses',
//       Item: courseItem
//     };
    
//     await dynamodb.put(params).promise();
    
//     return {
//       data: courseItem,
//     };
//   } catch (error) {
//     console.error('Error creating course instance:', error);
//     throw error;
//   }
// }

// // 과정 인스턴스 업데이트
// export async function updateCourseInstance(item: Partial<CourseInstance> & { lmsId: string, startDate: string }) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
    
//     // 업데이트할 표현식과 속성 값 준비
//     const updateExpressionParts: string[] = [];
//     const expressionAttributeNames: Record<string, string> = {};
//     const expressionAttributeValues: Record<string, any> = {
//       ':updatedAt': new Date().toISOString()
//     };
    
//     // updatedAt은 항상 업데이트
//     updateExpressionParts.push('#updatedAt = :updatedAt');
//     expressionAttributeNames['#updatedAt'] = 'updatedAt';
    
//     // 파티션 키와 정렬 키를 제외한 모든 속성에 대해 업데이트 표현식 생성
//     Object.entries(item).forEach(([key, value]) => {
//       if (key !== 'lmsId' && key !== 'startDate' && key !== 'updatedAt' && value !== undefined) {
//         // assessments 객체의 특별 처리
//         if (key === 'assessments' && typeof value === 'object') {
//           Object.entries(value).forEach(([assessmentKey, assessmentId]) => {
//             const expressionKey = `#assessments_\${assessmentKey}`;
//             const valueKey = `:assessments_\${assessmentKey}`;
            
//             updateExpressionParts.push(`\${expressionKey} = \${valueKey}`);
//             expressionAttributeNames[expressionKey] = `assessments.\${assessmentKey}`;
//             expressionAttributeValues[valueKey] = assessmentId;
//           });
//         } else {
//           updateExpressionParts.push(`#\${key} = :\${key}`);
//           expressionAttributeNames[`#\${key}`] = key;
//           expressionAttributeValues[`:\${key}`] = value;
//         }
//       }
//     });
    
//     const params = {
//       TableName: 'Tnc-Courses',
//       Key: {
//         lmsId: item.lmsId,
//         startDate: item.startDate
//       },
//       UpdateExpression: `SET \${updateExpressionParts.join(', ')}`,
//       ExpressionAttributeNames: expressionAttributeNames,
//       ExpressionAttributeValues: expressionAttributeValues,
//       ReturnValues: 'ALL_NEW'
//     };
    
//     const result = await dynamodb.update(params).promise();
    
//     return {
//       data: result.Attributes,
//     };
//   } catch (error) {
//     console.error('Error updating course instance:', error);
//     throw error;
//   }
// }

// // 과정 인스턴스 삭제
// export async function deleteCourseInstance(lmsId: string, startDate: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-Courses',
//       Key: {
//         lmsId,
//         startDate
//       },
//       ReturnValues: 'ALL_OLD'
//     };
    
//     const result = await dynamodb.delete(params).promise();
    
//     return {
//       data: result.Attributes,
//     };
//   } catch (error) {
//     console.error('Error deleting course instance:', error);
//     throw error;
//   }
// }

// // 카탈로그 ID로 과정 인스턴스 조회 (GSI1)
// export async function getCoursesByCatalogId(catalogId: string, options?: any) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-Courses',
//       IndexName: 'GSI1',
//       KeyConditionExpression: 'catalogId = :catalogId',
//       ExpressionAttributeValues: {
//         ':catalogId': catalogId
//       },
//       ...options
//     };
    
//     const result = await dynamodb.query(params).promise();
    
//     return {
//       data: result.Items || [],
//       lastEvaluatedKey: result.LastEvaluatedKey,
//     };
//   } catch (error) {
//     console.error('Error querying courses by catalog ID:', error);
//     throw error;
//   }
// }

// // 공유 코드로 과정 인스턴스 조회 (GSI2)
// export async function getCourseByShareCode(shareCode: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-Courses',
//       IndexName: 'GSI2',
//       KeyConditionExpression: 'shareCode = :shareCode',
//       ExpressionAttributeValues: {
//         ':shareCode': shareCode
//       }
//     };
    
//     const result = await dynamodb.query(params).promise();
    
//     return {
//       data: result.Items && result.Items.length > 0 ? result.Items[0] : null,
//     };
//   } catch (error) {
//     console.error('Error getting course by share code:', error);
//     throw error;
//   }
// }

// // 강사 ID로 과정 인스턴스 조회 (GSI3)
// export async function getCoursesByInstructor(instructor: string, options?: any) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-Courses',
//       IndexName: 'GSI3',
//       KeyConditionExpression: 'instructor = :instructor',
//       ExpressionAttributeValues: {
//         ':instructor': instructor
//       },
//       ...options
//     };
    
//     const result = await dynamodb.query(params).promise();
    
//     return {
//       data: result.Items || [],
//       lastEvaluatedKey: result.LastEvaluatedKey,
//     };
//   } catch (error) {
//     console.error('Error querying courses by instructor:', error);
//     throw error;
//   }
// }

// // 고객사 ID로 과정 인스턴스 조회 (GSI4)
// export async function getCoursesByCustomerId(customerId: string, options?: any) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-Courses',
//       IndexName: 'GSI4',
//       KeyConditionExpression: 'customerId = :customerId',
//       ExpressionAttributeValues: {
//         ':customerId': customerId
//       },
//       ...options
//     };
    
//     const result = await dynamodb.query(params).promise();
    
//     return {
//       data: result.Items || [],
//       lastEvaluatedKey: result.LastEvaluatedKey,
//     };
//   } catch (error) {
//     console.error('Error querying courses by customer ID:', error);
//     throw error;
//   }
// }

// // 과정 평가 관련 함수
// export async function addAssessment(lmsId: string, startDate: string, assessmentType: string, assessmentId: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-Courses',
//       Key: { lmsId, startDate },
//       UpdateExpression: 'SET assessments.#type = :id, updatedAt = :updatedAt',
//       ExpressionAttributeNames: {
//         '#type': assessmentType
//       },
//       ExpressionAttributeValues: {
//         ':id': assessmentId,
//         ':updatedAt': new Date().toISOString()
//       },
//       ReturnValues: 'ALL_NEW'
//     };
    
//     const result = await dynamodb.update(params).promise();
    
//     return {
//       data: result.Attributes,
//     };
//   } catch (error) {
//     console.error('Error adding assessment to course:', error);
//     throw error;
//   }
// }

// export async function getAssessmentId(lmsId: string, startDate: string, assessmentType: string): Promise<string | undefined> {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-Courses',
//       Key: { lmsId, startDate },
//       ProjectionExpression: 'assessments.#type',
//       ExpressionAttributeNames: {
//         '#type': assessmentType
//       }
//     };
    
//     const result = await dynamodb.get(params).promise();
    
//     return result.Item?.assessments?.[assessmentType];
//   } catch (error) {
//     console.error('Error getting assessment ID:', error);
//     throw error;
//   }
// }

// // ========== Customers 테이블 관련 함수 ==========

// // 고객사 목록 조회
// export async function listCustomers(options?: any) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-Customers',
//       ...options
//     };
    
//     const result = await dynamodb.scan(params).promise();
    
//     return {
//       data: result.Items || [],
//       lastEvaluatedKey: result.LastEvaluatedKey,
//     };
//   } catch (error) {
//     console.error('Error listing customers:', error);
//     throw error;
//   }
// }

// // 특정 고객사 조회
// export async function getCustomer(customerId: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-Customers',
//       Key: {
//         customerId
//       }
//     };
    
//     const result = await dynamodb.get(params).promise();
    
//     return {
//       data: result.Item,
//     };
//   } catch (error) {
//     console.error('Error getting customer:', error);
//     throw error;
//   }
// }

// // 이름으로 고객사 조회 (GSI1)
// export async function getCustomerByName(customerName: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-Customers',
//       IndexName: 'GSI1',
//       KeyConditionExpression: 'customerName = :customerName',
//       ExpressionAttributeValues: {
//         ':customerName': customerName
//       }
//     };
    
//     const result = await dynamodb.query(params).promise();
    
//     return {
//       data: result.Items || [],
//       lastEvaluatedKey: result.LastEvaluatedKey,
//     };
//   } catch (error) {
//     console.error('Error getting customer by name:', error);
//     throw error;
//   }
// }

// // 고객사 생성
// export async function createCustomer(item: Customer) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
    
//     // 타임스탬프 추가
//     const now = new Date().toISOString();
//     const customerItem = {
//       ...item,
//       createdAt: now,
//       updatedAt: now
//     };
    
//     const params = {
//       TableName: 'Tnc-Customers',
//       Item: customerItem
//     };
    
//     await dynamodb.put(params).promise();
    
//     return {
//       data: customerItem,
//     };
//   } catch (error) {
//     console.error('Error creating customer:', error);
//     throw error;
//   }
// }

// // 고객사 업데이트
// export async function updateCustomer(item: Partial<Customer> & { customerId: string }) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
    
//     // 업데이트할 표현식과 속성 값 준비
//     const updateExpressionParts: string[] = [];
//     const expressionAttributeNames: Record<string, string> = {};
//     const expressionAttributeValues: Record<string, any> = {
//       ':updatedAt': new Date().toISOString()
//     };
    
//     // updatedAt은 항상 업데이트
//     updateExpressionParts.push('#updatedAt = :updatedAt');
//     expressionAttributeNames['#updatedAt'] = 'updatedAt';
    
//     // 파티션 키를 제외한 모든 속성에 대해 업데이트 표현식 생성
//     Object.entries(item).forEach(([key, value]) => {
//       if (key !== 'customerId' && key !== 'updatedAt' && value !== undefined) {
//         updateExpressionParts.push(`#\${key} = :\${key}`);
//         expressionAttributeNames[`#\${key}`] = key;
//         expressionAttributeValues[`:\${key}`] = value;
//       }
//     });
    
//     const params = {
//       TableName: 'Tnc-Customers',
//       Key: {
//         customerId: item.customerId
//       },
//       UpdateExpression: `SET \${updateExpressionParts.join(', ')}`,
//       ExpressionAttributeNames: expressionAttributeNames,
//       ExpressionAttributeValues: expressionAttributeValues,
//       ReturnValues: 'ALL_NEW'
//     };
    
//     const result = await dynamodb.update(params).promise();
    
//     return {
//       data: result.Attributes,
//     };
//   } catch (error) {
//     console.error('Error updating customer:', error);
//     throw error;
//   }
// }

// // 고객사 삭제
// export async function deleteCustomer(customerId: string) {
//   try {
//     const dynamodb = new AWS.DynamoDB.DocumentClient();
//     const params = {
//       TableName: 'Tnc-Customers',
//       Key: {
//         customerId
//       },
//       ReturnValues: 'ALL_OLD'
//     };
    
//     const result = await dynamodb.delete(params).promise();
    
//     return {
//       data: result.Attributes,
//     };
//   } catch (error) {
//     console.error('Error deleting customer:', error);
//     throw error;
//   }
// }
// // 타입 가드 함수
// export function isSurveyGenerationResponse(obj: unknown): obj is SurveyGenerationResponse {
//   return (
//     typeof obj === 'object' &&
//     obj !== null &&
//     'questions' in obj &&
//     Array.isArray((obj as any).questions)
//   );
// }

// // 타입 체크를 위한 헬퍼 함수
// export function logAvailableModels() {
//   console.log('Using DynamoDB with Amplify Gen 2 client');
//   return ['Tnc-CourseCatalog', 'Tnc-CourseCatalog-Modules', 'Tnc-CourseCatalog-Labs'];
// }
