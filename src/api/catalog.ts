// src/spi/catalog.ts
import { getCurrentTimestamp } from './config';
import { CourseCatalog, CatalogModule, CatalogLab } from './types';
import AWS from 'aws-sdk';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';


const CATALOG_TABLE = 'Tnc-CourseCatalog';
const MODULES_TABLE = 'Tnc-CourseCatalog-Modules';
const LABS_TABLE = 'Tnc-CourseCatalog-Labs';

// 인증된 DynamoDB 클라이언트를 생성하는 함수
async function getDocumentClient() {
  try {
    // 먼저 사용자가 로그인되어 있는지 확인
    try {
      await getCurrentUser();
    } catch (err) {
      console.error('인증이 필요합니다.');
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
    throw error;
  }
}

// ========== CourseCatalog 테이블 관련 함수 ==========

// 이 함수 추가 - BaseCourseView.tsx에서 사용하는 중요한 함수
export async function listCourseCatalogs(options?: any) {
  try {
    const documentClient = await getDocumentClient();
    
    const params = {
      TableName: CATALOG_TABLE,
      ...options
    };
    
    const result = await documentClient.scan(params).promise();
    
    return {
      data: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error listing course catalogs:', error);
    throw error;
  }
}

export async function getCourseCatalog(catalogId: string, title: string) {
  try {
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