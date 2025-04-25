import { DynamoDB } from 'aws-sdk';
import { Customer } from './types/customers';
import { useAuth, withAuthErrorHandling } from '../contexts/AuthContext';

// 모의 데이터 (핵심 필수 속성 확실히 포함)
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
 * 고객 목록 가져오기
 */
export const listCustomers = async (authContext: ReturnType<typeof useAuth>): Promise<Customer[]> => {
  // 모의 데이터 모드 또는 자격 증명 없음
  if (authContext.useMockData || !authContext.hasCredentials) {
    console.log('모의 데이터 사용 - listCustomers');
    return mockCustomers;
  }

  try {
    // AWS DynamoDB 서비스 생성
    const dynamoDB = await authContext.createAWSService(DynamoDB.DocumentClient);

    // DynamoDB 스캔 요청
    const result = await withAuthErrorHandling(async () => {
      return dynamoDB.scan({
        TableName: TABLE_NAME
      }).promise();
    }, authContext)();

    // 결과가 있으면 반환
    if (result.Items) {
      return result.Items as Customer[];
    }

    return [];
  } catch (error) {
    console.error('고객 목록 가져오기 실패:', error);
    
    // 오류 시 모의 데이터로 대체
    return mockCustomers;
  }
};

/**
 * 고객명으로 검색 (GSI1 사용)
 */
export const searchCustomersByName = async (
  name: string,
  authContext: ReturnType<typeof useAuth>
): Promise<Customer[]> => {
  // 모의 데이터 모드 또는 자격 증명 없음
  if (authContext.useMockData || !authContext.hasCredentials) {
    console.log('모의 데이터 사용 - searchCustomersByName');
    return mockCustomers.filter(c => 
      c.customerName.toLowerCase().includes(name.toLowerCase())
    );
  }

  try {
    // AWS DynamoDB 서비스 생성
    const dynamoDB = await authContext.createAWSService(DynamoDB.DocumentClient);

    // GSI1을 사용한 쿼리
    const result = await withAuthErrorHandling(async () => {
      return dynamoDB.scan({
        TableName: TABLE_NAME,
        FilterExpression: "contains(customerName, :name)",
        ExpressionAttributeValues: {
          ":name": name
        }
      }).promise();
    }, authContext)();

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
 * 특정 고객 정보 가져오기
 */
export const getCustomer = async (
  customerId: string, 
  authContext: ReturnType<typeof useAuth>
): Promise<Customer | null> => {
  // 모의 데이터 모드 또는 자격 증명 없음
  if (authContext.useMockData || !authContext.hasCredentials) {
    console.log('모의 데이터 사용 - getCustomer');
    const mockCustomer = mockCustomers.find(c => c.customerId === customerId);
    return mockCustomer || null;
  }

  try {
    // AWS DynamoDB 서비스 생성
    const dynamoDB = await authContext.createAWSService(DynamoDB.DocumentClient);

    // DynamoDB 항목 가져오기 요청
    const result = await withAuthErrorHandling(async () => {
      return dynamoDB.get({
        TableName: TABLE_NAME,
        Key: { customerId }
      }).promise();
    }, authContext)();

    // 결과가 있으면 반환
    if (result.Item) {
      return result.Item as Customer;
    }

    return null;
  } catch (error) {
    console.error(`고객 정보 가져오기 실패 (ID: \${customerId}):`, error);
    
    // 오류 시 모의 데이터에서 검색
    const mockCustomer = mockCustomers.find(c => c.customerId === customerId);
    return mockCustomer || null;
  }
};

/**
 * 고객 추가 또는 업데이트
 */
export const saveCustomer = async (
  customer: Customer,
  authContext: ReturnType<typeof useAuth>
): Promise<Customer> => {
  // 모의 데이터 모드 또는 자격 증명 없음
  if (authContext.useMockData || !authContext.hasCredentials) {
    console.log('모의 데이터 사용 - saveCustomer');
    
    const updatedMock = { 
      ...customer,
      updatedAt: new Date().toISOString()
    };
    
    return updatedMock;
  }

  try {
    // AWS DynamoDB 서비스 생성
    const dynamoDB = await authContext.createAWSService(DynamoDB.DocumentClient);

    // 현재 시간 설정
    const now = new Date().toISOString();
    
    // 새 고객인지 확인
    const isNewCustomer = !customer.createdAt;
    
    // 고객 데이터 업데이트
    const customerData = {
      ...customer,
      createdAt: customer.createdAt || now,
      updatedAt: now
    };

    // DynamoDB에 저장
    await withAuthErrorHandling(async () => {
      return dynamoDB.put({
        TableName: TABLE_NAME,
        Item: customerData
      }).promise();
    }, authContext)();

    return customerData;
  } catch (error) {
    console.error('고객 저장 실패:', error);
    throw error;
  }
};

/**
 * 고객 삭제
 */
export const deleteCustomer = async (
  customerId: string,
  authContext: ReturnType<typeof useAuth>
): Promise<boolean> => {
  // 모의 데이터 모드 또는 자격 증명 없음
  if (authContext.useMockData || !authContext.hasCredentials) {
    console.log('모의 데이터 사용 - deleteCustomer');
    return true;
  }

  try {
    // AWS DynamoDB 서비스 생성
    const dynamoDB = await authContext.createAWSService(DynamoDB.DocumentClient);

    // DynamoDB에서 항목 삭제
    await withAuthErrorHandling(async () => {
      return dynamoDB.delete({
        TableName: TABLE_NAME,
        Key: { customerId }
      }).promise();
    }, authContext)();

    return true;
  } catch (error) {
    console.error(`고객 삭제 실패 (ID: \${customerId}):`, error);
    throw error;
  }
};
