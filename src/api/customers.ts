// src/api/customers.ts
import { getDocumentClient, shouldUseMockData } from './auth-provider';
import { Customer } from './types/customers';

// 모의 데이터
const mockCustomers: Customer[] = [
  {
    customerId: 'mock-cust-001',
    customerName: 'John Doe',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    customerId: 'mock-cust-002',
    customerName: 'Jane Smith',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    customerId: 'mock-cust-003',
    customerName: 'Robert Johnson',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    customerId: 'mock-cust-004',
    customerName: 'Sarah Lee',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    customerId: 'mock-cust-005',
    customerName: 'David Kim',
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// 테이블 이름
const TABLE_NAME = 'Tnc-Customers';

/**
 * 고객 목록 가져오기 - Gen 2 스타일
 */
export const listCustomers = async (authContext?: any): Promise<any> => {
  // 모의 데이터 모드 확인
  if (shouldUseMockData() || (authContext?.useMockData || authContext?.hasCredentials === false)) {
    console.log('모의 데이터 사용 - listCustomers');
    return {
      data: mockCustomers,
      success: true
    };
  }

  try {
    // Gen 2 스타일로 DynamoDB 클라이언트 생성
    const documentClient = await getDocumentClient();

    // DynamoDB 스캔 요청
    const result = await documentClient.scan({
      TableName: TABLE_NAME
    }).promise();

    // 결과가 있으면 반환
    return {
      data: result.Items || [],
      success: true
    };
  } catch (error) {
    console.error('고객 목록 가져오기 실패:', error);
    
    // 오류 발생 시 모의 데이터 반환
    return {
      data: mockCustomers,
      success: false,
      error: error
    };
  }
};

/**
 * 고객명으로 검색 - Gen 2 스타일
 */
export const searchCustomersByName = async (name: string, authContext?: any): Promise<Customer[]> => {
  // 모의 데이터 모드 확인
  if (shouldUseMockData() || (authContext?.useMockData || authContext?.hasCredentials === false)) {
    console.log('모의 데이터 사용 - searchCustomersByName');
    return mockCustomers.filter(c => 
      c.customerName.toLowerCase().includes(name.toLowerCase())
    );
  }

  try {
    // Gen 2 스타일로 DynamoDB 클라이언트 생성
    const documentClient = await getDocumentClient();

    // DynamoDB 스캔 요청
    const result = await documentClient.scan({
      TableName: TABLE_NAME,
      FilterExpression: "contains(customerName, :name)",
      ExpressionAttributeValues: {
        ":name": name
      }
    }).promise();

    // 결과가 있으면 반환
    if (result.Items) {
      return result.Items as Customer[];
    }

    return [];
  } catch (error) {
    console.error(`고객명으로 검색 실패 (이름: \${name}):`, error);
    
    // 오류 시 모의 데이터에서 필터링
    return mockCustomers.filter(c => 
      c.customerName.toLowerCase().includes(name.toLowerCase())
    );
  }
};

/**
 * 다른 함수들도 동일한 패턴으로 수정
 */
export const getCustomer = async (customerId: string, authContext?: any): Promise<Customer | null> => {
  // 모의 데이터 모드 확인
  if (shouldUseMockData() || (authContext?.useMockData || authContext?.hasCredentials === false)) {
    console.log('모의 데이터 사용 - getCustomer');
    const mockCustomer = mockCustomers.find(c => c.customerId === customerId);
    return mockCustomer || null;
  }

  try {
    const documentClient = await getDocumentClient();
    
    const result = await documentClient.get({
      TableName: TABLE_NAME,
      Key: { customerId }
    }).promise();
    
    return (result.Item as Customer) || null;
  } catch (error) {
    console.error(`고객 정보 가져오기 실패 (ID: \${customerId}):`, error);
    
    const mockCustomer = mockCustomers.find(c => c.customerId === customerId);
    return mockCustomer || null;
  }
};

export const saveCustomer = async (customer: Customer, authContext?: any): Promise<Customer> => {
  // 실제 구현...
  return customer;
};

export const deleteCustomer = async (customerId: string, authContext?: any): Promise<boolean> => {
  // 실제 구현...
  return true;
};