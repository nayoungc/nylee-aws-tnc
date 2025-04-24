// src/spi/catalog.ts
import { getCurrentTimestamp } from './config';
import { CourseCatalog, CatalogModule, CatalogLab } from './types';
import AWS from 'aws-sdk';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

const CATALOG_TABLE = 'Tnc-CourseCatalog';
const MODULES_TABLE = 'Tnc-CourseCatalog-Modules';
const LABS_TABLE = 'Tnc-CourseCatalog-Labs';

// 이미 인증되어 있는지 확인하는 전역 변수와 타임스탬프
let lastAuthCheck = 0;
let authCheckResult = false;
const AUTH_CHECK_INTERVAL = 30000; // 30초

// 인증 상태 확인 함수
async function checkAuthentication(): Promise<boolean> {
  const now = Date.now();
  if (now - lastAuthCheck < AUTH_CHECK_INTERVAL && authCheckResult) {
    return true; // 캐시된 결과 사용
  }
  
  try {
    await getCurrentUser();
    lastAuthCheck = now;
    authCheckResult = true;
    return true;
  } catch (err) {
    lastAuthCheck = now;
    authCheckResult = false;
    return false;
  }
}

// 인증된 DynamoDB 클라이언트를 생성하는 함수
async function getDocumentClient() {
  try {
    // 먼저 인증 상태 확인
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      throw new Error('먼저 로그인이 필요합니다');
    }
    
    // 세션을 강제로 새로고침하여 최신 자격 증명 확보
    const session = await fetchAuthSession({ forceRefresh: true });
    
    if (!session.credentials) {
      throw new Error('세션에 유효한 자격 증명이 없습니다. 로그인이 필요합니다.');
    }
    
    return new AWS.DynamoDB.DocumentClient({
      credentials: {
        accessKeyId: session.credentials.accessKeyId,
        secretAccessKey: session.credentials.secretAccessKey,
        sessionToken: session.credentials.sessionToken
      },
      region: AWS.config.region || 'us-east-1'
    });
  } catch (error) {
    console.error('DynamoDB DocumentClient 생성 실패:', error);
    throw error; // 원래 오류를 그대로 전파
  }
}

// ========== CourseCatalog 테이블 관련 함수 ==========
export async function listCourseCatalogs(options?: any) {
  try {
    console.log('listCourseCatalogs 함수 호출됨, 옵션:', options);

    // 먼저 인증 상태 확인
    const session = await fetchAuthSession();
    if (!session.tokens) {
      throw new Error("인증이 필요합니다. 먼저 로그인해주세요.");
    }
    
    const documentClient = await getDocumentClient();
    console.log('DynamoDB DocumentClient 생성 성공');
    
    const params = {
      TableName: CATALOG_TABLE,
      ...options
    };
    console.log('DynamoDB scan 요청 파라미터:', params);
    
    const result = await documentClient.scan(params).promise();
    console.log('DynamoDB scan 응답:', result);
    
    if (!result.Items || result.Items.length === 0) {
      console.log('반환된 항목 없음');
    } else {
      console.log(`\${result.Items.length}개 항목 반환됨`);
    }
    
    return {
      data: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error listing course catalogs (상세):', error);
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
      console.error('에러 이름:', error.name);
    }
    throw error;
  }
}

// 나머지 함수들에도 인증 확인 추가
export async function getCourseCatalog(catalogId: string, title: string) {
  try {
    // 인증 확인
    if (!await checkAuthentication()) {
      throw new Error('먼저 로그인이 필요합니다');
    }
    
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: CATALOG_TABLE,
      Key: {
        catalogId: catalogId,
        title: title
      }
    };
    
    const result = await documentClient.get(params).promise();
    
    return {
      data: result.Item,
    };
  } catch (error) {
    console.error('Error getting course catalog:', error);
    throw error;
  }
}

export async function createCourseCatalog(item: CourseCatalog) {
  try {
    const documentClient = await getDocumentClient();
    
    // 타임스탬프 추가
    const now = getCurrentTimestamp();
    const catalogItem = {
      ...item,
      createdAt: now,
      updatedAt: now
    };
    
    const params = {
      TableName: CATALOG_TABLE,
      Item: catalogItem
    };
    
    await documentClient.put(params).promise();
    
    return {
      data: catalogItem,
    };
  } catch (error) {
    console.error('Error creating course catalog:', error);
    throw error;
  }
}

export async function queryCatalogByTitle(title: string, version?: string) {
  try {
    const documentClient = await getDocumentClient();
    
    let params: any = {
      TableName: CATALOG_TABLE,
      IndexName: 'Tnc-CourseCatalog-GSI1',
      KeyConditionExpression: 'title = :title',
      ExpressionAttributeValues: {
        ':title': title
      }
    };
    
    if (version) {
      params.KeyConditionExpression += ' AND version = :version';
      params.ExpressionAttributeValues[':version'] = version;
    }
    
    const result = await documentClient.query(params).promise();
    
    return {
      data: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error querying catalog by title:', error);
    throw error;
  }
}

export async function queryCatalogByAwsCode(awsCode: string, version?: string) {
  try {
    const documentClient = await getDocumentClient();
    
    let params: any = {
      TableName: CATALOG_TABLE,
      IndexName: 'Tnc-CourseCatalog-GSI2',
      KeyConditionExpression: 'awsCode = :awsCode',
      ExpressionAttributeValues: {
        ':awsCode': awsCode
      }
    };
    
    if (version) {
      params.KeyConditionExpression += ' AND version = :version';
      params.ExpressionAttributeValues[':version'] = version;
    }
    
    const result = await documentClient.query(params).promise();
    
    return {
      data: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error querying catalog by AWS code:', error);
    throw error;
  }
}

// ========== Module 테이블 관련 함수 ==========
export async function listModules(catalogId: string) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: MODULES_TABLE,
      KeyConditionExpression: 'catalogId = :catalogId',
      ExpressionAttributeValues: {
        ':catalogId': catalogId
      }
    };
    
    const result = await documentClient.query(params).promise();
    
    return {
      data: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error listing modules:', error);
    throw error;
  }
}

export async function getModule(catalogId: string, moduleNumber: string) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: MODULES_TABLE,
      Key: {
        catalogId: catalogId,
        moduleNumber: moduleNumber
      }
    };
    
    const result = await documentClient.get(params).promise();
    
    return {
      data: result.Item,
    };
  } catch (error) {
    console.error('Error getting module:', error);
    throw error;
  }
}

export async function createModule(item: CatalogModule) {
  try {
    const documentClient = await getDocumentClient();
    
    const now = getCurrentTimestamp();
    const moduleItem = {
      ...item,
      createdAt: now,
      updatedAt: now
    };
    
    const params = {
      TableName: MODULES_TABLE,
      Item: moduleItem
    };
    
    await documentClient.put(params).promise();
    
    return {
      data: moduleItem,
    };
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
}

export async function queryModuleByTitle(title: string) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: MODULES_TABLE,
      IndexName: 'Tnc-CourseCatalog-Modules-GSI1',
      KeyConditionExpression: 'title = :title',
      ExpressionAttributeValues: {
        ':title': title
      }
    };
    
    const result = await documentClient.query(params).promise();
    
    return {
      data: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error querying module by title:', error);
    throw error;
  }
}

// ========== Lab 테이블 관련 함수 ==========
export async function listLabs(catalogId: string) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: LABS_TABLE,
      KeyConditionExpression: 'catalogId = :catalogId',
      ExpressionAttributeValues: {
        ':catalogId': catalogId
      }
    };
    
    const result = await documentClient.query(params).promise();
    
    return {
      data: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error listing labs:', error);
    throw error;
  }
}

export async function getLab(catalogId: string, labNumber: string) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: LABS_TABLE,
      Key: {
        catalogId: catalogId,
        labNumber: labNumber
      }
    };
    
    const result = await documentClient.get(params).promise();
    
    return {
      data: result.Item,
    };
  } catch (error) {
    console.error('Error getting lab:', error);
    throw error;
  }
}

export async function createLab(item: CatalogLab) {
  try {
    const documentClient = await getDocumentClient();
    
    const now = getCurrentTimestamp();
    const labItem = {
      ...item,
      createdAt: now,
      updatedAt: now
    };
    
    const params = {
      TableName: LABS_TABLE,
      Item: labItem
    };
    
    await documentClient.put(params).promise();
    
    return {
      data: labItem,
    };
  } catch (error) {
    console.error('Error creating lab:', error);
    throw error;
  }
}

export async function queryLabByTitle(title: string) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: LABS_TABLE,
      IndexName: 'Tnc-CourseCatalog-Labs-GSI2',
      KeyConditionExpression: 'title = :title',
      ExpressionAttributeValues: {
        ':title': title
      }
    };
    
    const result = await documentClient.query(params).promise();
    
    return {
      data: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error querying lab by title:', error);
    throw error;
  }
}