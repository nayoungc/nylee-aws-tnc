// src/graphql/customer/types.ts
import { Customer } from '@models/customers';

// 필터 타입 정의 (추가)
export interface CustomerFilterInput {
  id?: { eq?: string; contains?: string };
  name?: { eq?: string; contains?: string };
  and?: CustomerFilterInput[];
  or?: CustomerFilterInput[];
  not?: CustomerFilterInput;
}

export interface CustomerSearchFilterInput {
  text?: string;
  startDate?: string;
  endDate?: string;
}

// 쿼리 결과 타입
export interface ListCustomersResult {
  listCustomers: {
    items: Customer[];
    nextToken?: string | null;
  };
}

export interface GetCustomerResult {
  getCustomer: Customer | null;
}

export interface ListCustomersResult {
  listCustomers: {
    items: Customer[];
    nextToken?: string | null;
  };
}

export interface GetCustomerResult {
  getCustomer: Customer | null;
}

export interface SearchCustomersResult {
  searchCustomers: {
    items: Customer[];
    nextToken?: string | null;
  };
}


export interface CreateCustomerResult {
  createCustomer: Customer;
}

export interface UpdateCustomerResult {
  updateCustomer: Customer;
}

export interface DeleteCustomerResult {
  deleteCustomer: {
    id: string;
    name: string;
  };
}

