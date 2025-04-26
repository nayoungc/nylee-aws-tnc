// src/services/api/customerApi.ts
import { generateClient } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';
import { safelyExtractData } from '@utils/graphql';

// 고객 관련 쿼리와 뮤테이션
import { 
  listCustomers, 
  getCustomer,
} from '@graphql/customer';
import { 
  createCustomer, 
  updateCustomer,
  deleteCustomer 
} from '@graphql/customer';
import {
  ListCustomersResult,
  GetCustomerResult,
  SearchCustomersResult,
  CreateCustomerResult,
  UpdateCustomerResult,
  DeleteCustomerResult,
  CustomerFilterInput
} from '@graphql/customer/types';

// 모델과 모의 데이터
import { Customer, CustomerInput, CustomerFilter } from '@models/customers';
import { mockCustomers } from '../../mocks/customerData';

// Amplify API 클라이언트 생성
const client = generateClient();

// 개발 모드 여부
const DEV_MODE = true;

/**
 * 모든 고객 가져오기
 */
export const fetchAllCustomers = async (): Promise<Customer[]> => {
  // 개발 모드인 경우 모의 데이터 사용
  if (DEV_MODE) {
    console.log('[DEV_MODE] 모의 고객 데이터 사용 중');
    return Promise.resolve([...mockCustomers]);
  }

  try {
    const response = await client.graphql({
      query: listCustomers
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<ListCustomersResult>(response);
    return data?.listCustomers?.items || [];
  } catch (error: unknown) {
    console.error('고객 목록 조회 오류:', error);
    throw error;
  }
};

/**
 * ID로 특정 고객 가져오기
 */
export const fetchCustomerById = async (customerId: string): Promise<Customer | null> => {
  // 개발 모드인 경우 모의 데이터 사용
  if (DEV_MODE) {
    console.log(`[DEV_MODE] ID \${customerId}로 모의 고객 조회`);
    const customer = mockCustomers.find(c => c.customerId === customerId);
    return Promise.resolve(customer || null);
  }

  try {
    const response = await client.graphql({
      query: getCustomer,
      variables: { customerId }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<GetCustomerResult>(response);
    return data?.getCustomer || null;
  } catch (error: unknown) {
    console.error(`고객 조회 오류 (ID: \${customerId}):`, error);
    throw error;
  }
};

/**
 * 필터를 사용하여 고객 검색
 */
// export const searchCustomersList = async (filter: CustomerFilter = {}): Promise<Customer[]> => {
//   // 개발 모드인 경우 모의 데이터 필터링
//   if (DEV_MODE) {
//     console.log(`[DEV_MODE] 필터로 모의 고객 검색: \${JSON.stringify(filter)}`);
//     let filteredCustomers = [...mockCustomers];
    
//     // 조직으로 필터링
//     if (filter.organization) {
//       filteredCustomers = filteredCustomers.filter(c => c.organization === filter.organization);
//     }
    
//     // 텍스트 검색
//     if (filter.text) {
//       const searchText = filter.text.toLowerCase();
//       filteredCustomers = filteredCustomers.filter(c => 
//         c.customerName.toLowerCase().includes(searchText) ||
//         (c.notes && c.notes.toLowerCase().includes(searchText)) ||
//         (c.email && c.email.toLowerCase().includes(searchText))
//       );
//     }
    
//     return Promise.resolve(filteredCustomers);
//   }

//   try {
//     const variables = { filter: filter as CustomerFilterInput };
//     const response = await client.graphql({
//       query: searchCustomers,
//       variables
//     });
    
//     // 안전하게 데이터 추출
//     const data = safelyExtractData<SearchCustomersResult>(response);
//     return data?.searchCustomers || [];
//   } catch (error: unknown) {
//     console.error('고객 검색 오류:', error);
//     throw error;
//   }
// };

/**
 * 새 고객 생성
 */
export const createNewCustomer = async (input: CustomerInput): Promise<Customer> => {
  // 개발 모드인 경우 모의 데이터에 추가
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 새 고객 생성: \${input.customerName}`);
    const newCustomer: Customer = {
      customerId: uuidv4(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockCustomers.push(newCustomer);
    return Promise.resolve({...newCustomer});
  }

  try {
    const response = await client.graphql({
      query: createCustomer,
      variables: { input }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<CreateCustomerResult>(response);
    if (!data?.createCustomer) {
      throw new Error('고객 생성 응답이 유효하지 않습니다');
    }
    
    return data.createCustomer;
  } catch (error: unknown) {
    console.error('고객 생성 오류:', error);
    throw error;
  }
};

/**
 * 고객 정보 수정
 */
export const updateCustomerInfo = async (customerId: string, input: Partial<CustomerInput>): Promise<Customer> => {
  // 개발 모드인 경우 모의 데이터 수정
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 고객 수정 ID: \${customerId}`);
    const index = mockCustomers.findIndex(c => c.customerId === customerId);
    
    if (index === -1) {
      throw new Error(`ID가 \${customerId}인 고객을 찾을 수 없습니다`);
    }
    
    const updatedCustomer = {
      ...mockCustomers[index],
      ...input,
      updatedAt: new Date().toISOString()
    };
    
    mockCustomers[index] = updatedCustomer;
    return Promise.resolve({...updatedCustomer});
  }

  try {
    const response = await client.graphql({
      query: updateCustomer,
      variables: { input: { customerId, ...input } }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<UpdateCustomerResult>(response);
    if (!data?.updateCustomer) {
      throw new Error(`ID가 \${customerId}인 고객 수정 응답이 유효하지 않습니다`);
    }
    
    return data.updateCustomer;
  } catch (error: unknown) {
    console.error(`고객 수정 오류 (ID: \${customerId}):`, error);
    throw error;
  }
};

/**
 * 고객 삭제
 */
export const deleteCustomerById = async (customerId: string): Promise<boolean> => {
  // 개발 모드인 경우 모의 데이터에서 삭제
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 고객 삭제 ID: \${customerId}`);
    const index = mockCustomers.findIndex(c => c.customerId === customerId);
    
    if (index === -1) {
      throw new Error(`ID가 \${customerId}인 고객을 찾을 수 없습니다`);
    }
    
    mockCustomers.splice(index, 1);
    return Promise.resolve(true);
  }

  try {
    const response = await client.graphql({
      query: deleteCustomer,
      variables: { input: { customerId } }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<DeleteCustomerResult>(response);
    return !!data?.deleteCustomer?.customerId;
  } catch (error: unknown) {
    console.error(`고객 삭제 오류 (ID: \${customerId}):`, error);
    throw error;
  }
};