// src/graphql/customer/types.ts

// 쿼리 결과 타입
export interface ListCustomersResult {
  listCustomers: {
    items: Array<any>;
    nextToken?: string;
  }
}

export interface GetCustomerResult {
  getCustomer: any | null;
}

export interface SearchCustomersResult {
  searchCustomers: Array<any>;
}

// 뮤테이션 결과 타입
export interface CreateCustomerResult {
  createCustomer: any;
}

export interface UpdateCustomerResult {
  updateCustomer: any;
}

export interface DeleteCustomerResult {
  deleteCustomer: {
    customerId: string;
  } | null;
}

// 필터 타입
export interface CustomerFilterInput {
  customerId?: string;
  customerName?: string;
  email?: string;
  organization?: string;
  and?: CustomerFilterInput[];
  or?: CustomerFilterInput[];
}

// 고급 검색 결과 타입
export interface AdvancedSearchCustomersResult {
  advancedSearchCustomers: {
    items: Array<any>;
    nextToken?: string;
    total: number;
  }
}

// 고급 검색 필터 타입
export interface AdvancedCustomerFilter {
  name?: string;
  organization?: string;
  email?: string;
  tags?: string[];
  fromDate?: string;
  toDate?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}