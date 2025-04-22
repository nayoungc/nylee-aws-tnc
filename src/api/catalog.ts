import { documentClient, getCurrentTimestamp } from './config';
import { CourseCatalog, CatalogModule, CatalogLab } from './types';

const CATALOG_TABLE = 'Tnc-CourseCatalog';
const MODULES_TABLE = 'Tnc-CourseCatalog-Modules';
const LABS_TABLE = 'Tnc-CourseCatalog-Labs';

// ========== CourseCatalog 테이블 관련 함수 ==========
export async function listCourseCatalogs(options?: any) {
  try {
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

export async function getLabsForModule(moduleId: string) {
  try {
    const params = {
      TableName: LABS_TABLE,
      IndexName: 'Tnc-CourseCatalog-Labs-GSI1',
      KeyConditionExpression: 'moduleId = :moduleId',
      ExpressionAttributeValues: {
        ':moduleId': moduleId
      }
    };
    
    const result = await documentClient.query(params).promise();
    
    return {
      data: result.Items || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error listing labs for module:', error);
    throw error;
  }
}

export async function getLab(catalogId: string, labNumber: string) {
  try {
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

