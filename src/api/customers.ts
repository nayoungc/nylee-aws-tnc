// src/api/customers.ts
import AWS from 'aws-sdk';
import { fetchAuthSession } from 'aws-amplify/auth';
import { getCurrentTimestamp } from './config';
import { Customer } from './types';

const TABLE_NAME = 'Tnc-Customers';

// 자격 증명이 있는 DocumentClient 가져오기
async function getDocumentClient() {
  try {
    // 세션에서 자격 증명 가져오기
    const session = await fetchAuthSession();
    
    if (!session.credentials) {
      throw new Error('세션에 유효한 자격 증명이 없습니다. 로그인이 필요합니다.');
    }
    
    // 자격 증명으로 새 DocumentClient 생성
    return new AWS.DynamoDB.DocumentClient({
      credentials: new AWS.Credentials({
        accessKeyId: session.credentials.accessKeyId,
        secretAccessKey: session.credentials.secretAccessKey,
        sessionToken: session.credentials.sessionToken
      }),
      region: AWS.config.region || 'us-east-1'
    });
  } catch (error) {
    console.error('DocumentClient 생성 실패:', error);
    throw error;
  }
}

// 고객사 목록 조회
export async function listCustomers(options?: any) {
  try {
    // 자격 증명이 설정된 DocumentClient 가져오기
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
    console.error('Error listing customers:', error);
    throw error;
  }
}

// 특정 고객사 조회
export async function getCustomer(customerId: string) {
  try {
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
  } catch (error) {
    console.error('Error getting customer:', error);
    throw error;
  }
}

// 이름으로 고객사 조회 (GSI1)
export async function getCustomerByName(customerName: string) {
  try {
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
  } catch (error) {
    console.error('Error getting customer by name:', error);
    throw error;
  }
}

// 고객사 생성
export async function createCustomer(item: Customer) {
  try {
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
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

// 고객사 업데이트
export async function updateCustomer(item: { customerId: string; customerName?: string }) {
  try {
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
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}

// 고객사 삭제
export async function deleteCustomer(customerId: string) {
  try {
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
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}