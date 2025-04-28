// src/graphql/customer/types.ts

export interface Customer {
  id: string;
  customerName: string; // name -> customerName
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 필터 타입 정의
 * GraphQL API에서 사용되는 필터 입력 타입
 * @description Amplify에서 생성된 필터 타입은 보통 'Model' 접두사를 사용함
 */
export interface ModelCustomerFilterInput {
  id?: { eq?: string; contains?: string };
  name?: { eq?: string; contains?: string };
  and?: ModelCustomerFilterInput[];
  or?: ModelCustomerFilterInput[];
  not?: ModelCustomerFilterInput;
}

/**
 * 검색 필터 입력 타입
 * 고급 검색 기능을 위한 필터 옵션
 */
export interface SearchableCustomerFilterInput {
  text?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 고객 목록 조회 결과 타입
 */
export interface ListCustomersResult {
  listCustomers: {
    items: Customer[];
    nextToken?: string | null;
  };
}

/**
 * 고객 단일 조회 결과 타입
 */
export interface GetCustomerResult {
  getCustomer: Customer | null;
}

/**
 * 고객 검색 결과 타입
 */
export interface SearchCustomersResult {
  searchCustomers: {
    items: Customer[];
    nextToken?: string | null;
  };
}

/**
 * 고객 생성 결과 타입
 */
export interface CreateCustomerResult {
  createCustomer: Customer;
}

/**
 * 고객 수정 결과 타입
 */
export interface UpdateCustomerResult {
  updateCustomer: Customer;
}

/**
 * 고객 삭제 결과 타입
 */
export interface DeleteCustomerResult {
  deleteCustomer: {
    id: string;
    name: string;
  };
}