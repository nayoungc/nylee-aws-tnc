// src/api/customers.ts
import AWS from 'aws-sdk';
import { fetchAuthSession } from 'aws-amplify/auth';
import { getCurrentTimestamp } from './config';
import { Customer } from './types';

const TABLE_NAME = 'Tnc-Customers';

// 자격 증명 캐시 및 만료 시간
let cachedCredentials: AWS.Credentials | null = null;
let credentialsExpireTime = 0;
const CREDS_REFRESH_BUFFER = 5 * 60 * 1000; // 만료 5분 전에 새로고침

// Gen 2 방식의 DocumentClient 획득 - 개선된 버전
async function getDocumentClient() {
  try {
    const now = Date.now();

    // 캐시된 자격 증명이 있고 아직 유효한지 체크
    if (cachedCredentials && credentialsExpireTime > now + CREDS_REFRESH_BUFFER) {
      console.log("캐시된 자격 증명 사용");
      return new AWS.DynamoDB.DocumentClient({
        credentials: cachedCredentials,
        region: AWS.config.region || 'us-east-1'
      });
    }

    // 새 세션 강제 갱신
    console.log("자격 증명 새로 가져오는 중...");
    const { credentials } = await fetchAuthSession({ forceRefresh: true });
    
    if (!credentials) {
      console.error("자격 증명을 찾을 수 없음");
      throw new Error('세션에 유효한 자격 증명이 없습니다. 로그인이 필요합니다.');
    }
    
    // AWS 자격 증명 객체 생성 및 캐싱
    cachedCredentials = new AWS.Credentials({
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    });

    // 만료 시간 설정 (현재 시간 + 1시간, 또는 토큰 만료 시간에서 적절한 값 계산)
    credentialsExpireTime = now + (60 * 60 * 1000); // 1시간
    
    console.log("새 자격 증명이 성공적으로 설정됨");
    
    // AWS SDK 리전 설정 체크
    const region = AWS.config.region || 'us-east-1';
    console.log(`AWS SDK 리전: \${region}`);
    
    // DocumentClient 생성 및 반환
    return new AWS.DynamoDB.DocumentClient({
      credentials: cachedCredentials,
      region
    });
  } catch (error) {
    // 자격 증명 캐시 무효화
    cachedCredentials = null;
    credentialsExpireTime = 0;
    
    console.error('DocumentClient 생성 실패:', error);
    throw error;
  }
}

// API 호출 래퍼 함수 - 재시도 로직 추가
async function withRetry<T>(apiCall: () => Promise<T>, maxRetries = 1): Promise<T> {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 첫 시도가 아니라면 자격 증명 캐시 무효화
      if (attempt > 0) {
        cachedCredentials = null;
        credentialsExpireTime = 0;
        console.log(`재시도 #\${attempt}: 자격 증명 캐시 초기화`);
        
        // 짧은 지연 추가
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return await apiCall();
    } catch (error: any) {
      lastError = error;
      
      // 인증 관련 오류만 재시도
      const isAuthError = 
        error.message?.includes('자격 증명') || 
        error.message?.includes('세션') ||
        error.message?.includes('권한') ||
        error.code === 'CredentialsError' ||
        error.code === 'UnrecognizedClientException';
      
      if (!isAuthError || attempt === maxRetries) {
        throw error;
      }
      
      console.log(`인증 오류 발생, 재시도 중... (\${attempt+1}/\${maxRetries+1})`);
    }
  }
  
  throw lastError;
}

// 고객사 목록 조회 - 재시도 추가
export async function listCustomers(options?: any) {
  return withRetry(async () => {
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
  });
}

// 특정 고객사 조회 - 재시도 추가
export async function getCustomer(customerId: string) {
  return withRetry(async () => {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: TABLE_NAME,
      Key: {
        customerId
      }
    };
    
    const result = await documentClient.get(params).promise();
    
    return {
      data: result.Item,
    };
  });
}

// 이름으로 고객사 조회 - 재시도 추가
export async function getCustomerByName(customerName: string) {
  return withRetry(async () => {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'customerName = :customerName',
      ExpressionAttributeValues: {
        ':customerName': customerName
      }
    };
    
    const result = await documentClient.query(params).promise();
    
    return {
      data: result.Items && result.Items.length > 0 ? result.Items[0] : null,
    };
  });
}

// 고객사 생성 - 재시도 추가
export async function createCustomer(item: Customer) {
  return withRetry(async () => {
    const documentClient = await getDocumentClient();
    
    const now = getCurrentTimestamp();
    const customerItem = {
      ...item,
      createdAt: now,
      updatedAt: now
    };
    
    const params = {
      TableName: TABLE_NAME,
      Item: customerItem
    };
    
    await documentClient.put(params).promise();
    
    return {
      data: customerItem,
    };
  });
}

// 고객사 업데이트 - 재시도 추가
export async function updateCustomer(item: { customerId: string; customerName?: string }) {
  return withRetry(async () => {
    const documentClient = await getDocumentClient();
    
    const now = getCurrentTimestamp();
    const params = {
      TableName: TABLE_NAME,
      Key: {
        customerId: item.customerId
      },
      UpdateExpression: 'SET customerName = :customerName, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':customerName': item.customerName,
        ':updatedAt': now
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await documentClient.update(params).promise();
    
    return {
      data: result.Attributes,
    };
  });
}

// 고객사 삭제 - 재시도 추가
export async function deleteCustomer(customerId: string) {
  return withRetry(async () => {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: TABLE_NAME,
      Key: {
        customerId
      },
      ReturnValues: 'ALL_OLD'
    };
    
    const result = await documentClient.delete(params).promise();
    
    return {
      data: result.Attributes,
    };
  });
}