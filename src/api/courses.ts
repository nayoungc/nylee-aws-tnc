// src/api/courses.ts
import { fetchAuthSession } from 'aws-amplify/auth';
import AWS from 'aws-sdk';
import { getCurrentTimestamp } from './config';
import { Course } from './types';

const TABLE_NAME = 'Tnc-Courses';

// Gen 2 방식의 DocumentClient 획득
async function getDocumentClient() {
  try {
    // 구조 분해 할당으로 간소화
    const { credentials } = await fetchAuthSession();
    
    if (!credentials) {
      throw new Error('세션에 유효한 자격 증명이 없습니다. 로그인이 필요합니다.');
    }
    
    // AWS SDK에 자격 증명 적용
    return new AWS.DynamoDB.DocumentClient({
      credentials: new AWS.Credentials({
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      }),
      region: AWS.config.region || 'us-east-1'
    });
  } catch (error) {
    console.error('DocumentClient 생성 실패:', error);
    throw error;
  }
}

// 과정 인스턴스 목록 조회
export async function listCourses(options?: any) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: TABLE_NAME,
      ...options
    };
    
    const result = await documentClient.scan(params).promise();
    
    return {
      data: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error listing course:', error);
    throw error;
  }
}

// 특정 과정 인스턴스 조회
export async function getCourse(lmsId: string, startDate: string) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: TABLE_NAME,
      Key: {
        lmsId,
        startDate
      }
    };
    
    const result = await documentClient.get(params).promise();
    
    return {
      data: result.Item,
    };
  } catch (error) {
    console.error('Error getting course:', error);
    throw error;
  }
}

// 과정 인스턴스 생성
export async function createCourse(item: Course) {
  try {
    const documentClient = await getDocumentClient();
    
    // 타임스탬프 추가
    const now = getCurrentTimestamp();
    const courseItem = {
      ...item,
      createdAt: now,
      updatedAt: now
    };
    
    const params = {
      TableName: TABLE_NAME,
      Item: courseItem
    };
    
    await documentClient.put(params).promise();
    
    return {
      data: courseItem,
    };
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
}

// 과정 인스턴스 업데이트
export async function updateCourse(item: Partial<Course> & { lmsId: string, startDate: string }) {
  try {
    const documentClient = await getDocumentClient();
    
    // 업데이트할 표현식과 속성 값 준비
    const updateExpressionParts: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {
      ':updatedAt': getCurrentTimestamp()
    };
    
    // updatedAt은 항상 업데이트
    updateExpressionParts.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    
    // 파티션 키와 정렬 키를 제외한 모든 속성에 대해 업데이트 표현식 생성
    Object.entries(item).forEach(([key, value]) => {
      if (key !== 'lmsId' && key !== 'startDate' && key !== 'updatedAt' && value !== undefined) {
        // assessments 객체의 특별 처리
        if (key === 'assessments' && typeof value === 'object') {
          Object.entries(value).forEach(([assessmentKey, assessmentId]) => {
            const expressionKey = `#assessments_\${assessmentKey}`;
            const valueKey = `:assessments_\${assessmentKey}`;
            
            updateExpressionParts.push(`\${expressionKey} = \${valueKey}`);
            expressionAttributeNames[expressionKey] = `assessments.\${assessmentKey}`;
            expressionAttributeValues[valueKey] = assessmentId;
          });
        } else {
          updateExpressionParts.push(`#\${key} = :\${key}`);
          expressionAttributeNames[`#\${key}`] = key;
          expressionAttributeValues[`:\${key}`] = value;
        }
      }
    });
    
    const params = {
      TableName: TABLE_NAME,
      Key: {
        lmsId: item.lmsId,
        startDate: item.startDate
      },
      UpdateExpression: `SET \${updateExpressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await documentClient.update(params).promise();
    
    return {
      data: result.Attributes,
    };
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
}

// 과정 인스턴스 삭제
export async function deleteCourse(lmsId: string, startDate: string) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: TABLE_NAME,
      Key: {
        lmsId,
        startDate
      },
      ReturnValues: 'ALL_OLD'
    };
    
    const result = await documentClient.delete(params).promise();
    
    return {
      data: result.Attributes,
    };
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
}

// GSI 조회 함수들 - 카탈로그 ID로 과정 조회
export async function getCoursesByCatalogId(catalogId: string, options?: any) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'catalogId = :catalogId',
      ExpressionAttributeValues: {
        ':catalogId': catalogId
      },
      ...options
    };
    
    const result = await documentClient.query(params).promise();
    
    return {
      data: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error querying courses by catalog ID:', error);
    throw error;
  }
}

// 공유 코드로 과정 조회
export async function getCourseByShareCode(shareCode: string) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'shareCode = :shareCode',
      ExpressionAttributeValues: {
        ':shareCode': shareCode
      }
    };
    
    const result = await documentClient.query(params).promise();
    
    return {
      data: result.Items && result.Items.length > 0 ? result.Items[0] : null,
    };
  } catch (error) {
    console.error('Error getting course by share code:', error);
    throw error;
  }
}

// 강사별 과정 조회
export async function getCoursesByInstructor(instructor: string, options?: any) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI3',
      KeyConditionExpression: 'instructor = :instructor',
      ExpressionAttributeValues: {
        ':instructor': instructor
      },
      ...options
    };
    
    const result = await documentClient.query(params).promise();
    
    return {
      data: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error querying courses by instructor:', error);
    throw error;
  }
}

// 고객사 ID별 과정 조회
export async function getCoursesByCustomerId(customerId: string, options?: any) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI4',
      KeyConditionExpression: 'customerId = :customerId',
      ExpressionAttributeValues: {
        ':customerId': customerId
      },
      ...options
    };
    
    const result = await documentClient.query(params).promise();
    
    return {
      data: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error querying courses by customer ID:', error);
    throw error;
  }
}

// 과정 평가 관련 함수 - 평가 추가
export async function addAssessment(lmsId: string, startDate: string, assessmentType: string, assessmentId: string) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: TABLE_NAME,
      Key: { lmsId, startDate },
      UpdateExpression: 'SET assessments.#type = :id, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#type': assessmentType
      },
      ExpressionAttributeValues: {
        ':id': assessmentId,
        ':updatedAt': getCurrentTimestamp()
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await documentClient.update(params).promise();
    
    return {
      data: result.Attributes,
    };
  } catch (error) {
    console.error('Error adding assessment to course:', error);
    throw error;
  }
}

// 평가 ID 조회
export async function getAssessmentId(lmsId: string, startDate: string, assessmentType: string): Promise<string | undefined> {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: TABLE_NAME,
      Key: { lmsId, startDate },
      ProjectionExpression: 'assessments.#type',
      ExpressionAttributeNames: {
        '#type': assessmentType
      }
    };
    
    const result = await documentClient.get(params).promise();
    
    return result.Item?.assessments?.[assessmentType];
  } catch (error) {
    console.error('Error getting assessment ID:', error);
    throw error;
  }
}