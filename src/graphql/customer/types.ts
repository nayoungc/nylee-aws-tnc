// src/graphql/customer/types.ts
import { Customer } from '@models/customers';

export interface ListCustomersResult {
  listCustomers: {
    items: Customer[];
    nextToken?: string;
  };
}

export interface GetCustomerResult {
  getCustomer: Customer | null;
}

export interface SearchCustomersResult {
  searchCustomers: Customer[];
}

export interface CreateCustomerResult {
  createCustomer: Customer;
}

export interface UpdateCustomerResult {
  updateCustomer: Customer;
}

export interface DeleteCustomerResult {
  deleteCustomer: {
    customerId: string;
  };
}

export interface CustomerFilterInput {
  text?: string;
  organization?: string;
}
