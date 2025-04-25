// src/api/customers.ts
import { generateClient } from 'aws-amplify/api';
import { GraphQLQuery } from '@aws-amplify/api';
import { Customer } from './types';

// Amplify Gen2 API 클라이언트 생성
const client = generateClient();

// GraphQL 쿼리/뮤테이션 응답 타입 정의
interface ListCustomersQuery {
  listCustomers: {
    items: Customer[];
  }
}

interface GetCustomerQuery {
  getCustomer: Customer;
}

interface CustomerMutation {
  createCustomer?: Customer;
  updateCustomer?: Customer;
  deleteCustomer?: Customer;
}

// 고객사 목록 조회
export async function listCustomers(options?: any) {
  try {
    const query = `
      query ListCustomers {
        listCustomers {
          items {
            customerId
            customerName
            createdAt
            updatedAt
          }
        }
      }
    `;

    const response = await client.graphql<GraphQLQuery<ListCustomersQuery>>({
      query,
      variables: options
    });

    return {
      data: response.data?.listCustomers.items || [],
    };
  } catch (error) {
    console.error('고객사 목록 조회 오류:', error);
    throw error;
  }
}

// 특정 고객사 조회
export async function getCustomer(customerId: string) {
  try {
    const query = `
      query GetCustomer(\$customerId: ID!) {
        getCustomer(customerId: \$customerId) {
          customerId
          customerName
          createdAt
          updatedAt
        }
      }
    `;

    const response = await client.graphql<GraphQLQuery<GetCustomerQuery>>({
      query,
      variables: { customerId }
    });

    return {
      data: response.data?.getCustomer,
    };
  } catch (error) {
    console.error('고객사 조회 오류:', error);
    throw error;
  }
}

// 이름으로 고객사 조회
export async function getCustomerByName(customerName: string) {
  try {
    const query = `
      query ListCustomers(\$filter: CustomerFilterInput) {
        listCustomers(filter: \$filter) {
          items {
            customerId
            customerName
            createdAt
            updatedAt
          }
        }
      }
    `;

    const response = await client.graphql<GraphQLQuery<ListCustomersQuery>>({
      query,
      variables: {
        filter: {
          customerName: { eq: customerName }
        }
      }
    });

    const items = response.data?.listCustomers.items || [];
    return {
      data: items.length > 0 ? items[0] : null,
    };
  } catch (error) {
    console.error('이름으로 고객사 조회 오류:', error);
    throw error;
  }
}

// 고객사 생성
export async function createCustomer(item: Customer) {
  try {
    const mutation = `
      mutation CreateCustomer(\$input: CreateCustomerInput!) {
        createCustomer(input: \$input) {
          customerId
          customerName
          createdAt
          updatedAt
        }
      }
    `;

    const now = new Date().toISOString();
    const variables = {
      input: {
        ...item,
        createdAt: now,
        updatedAt: now
      }
    };

    const response = await client.graphql<GraphQLQuery<CustomerMutation>>({
      query: mutation,
      variables
    });

    return {
      data: response.data?.createCustomer,
    };
  } catch (error) {
    console.error('고객사 생성 오류:', error);
    throw error;
  }
}

// 고객사 업데이트
export async function updateCustomer(item: { customerId: string; customerName?: string }) {
  try {
    const mutation = `
      mutation UpdateCustomer(\$input: UpdateCustomerInput!) {
        updateCustomer(input: \$input) {
          customerId
          customerName
          createdAt
          updatedAt
        }
      }
    `;

    const now = new Date().toISOString();
    const variables = {
      input: {
        ...item,
        updatedAt: now
      }
    };

    const response = await client.graphql<GraphQLQuery<CustomerMutation>>({
      query: mutation,
      variables
    });

    return {
      data: response.data?.updateCustomer,
    };
  } catch (error) {
    console.error('고객사 업데이트 오류:', error);
    throw error;
  }
}

// 고객사 삭제
export async function deleteCustomer(customerId: string) {
  try {
    const mutation = `
      mutation DeleteCustomer(\$input: DeleteCustomerInput!) {
        deleteCustomer(input: \$input) {
          customerId
          customerName
        }
      }
    `;

    const variables = {
      input: { customerId }
    };

    const response = await client.graphql<GraphQLQuery<CustomerMutation>>({
      query: mutation,
      variables
    });

    return {
      data: response.data?.deleteCustomer,
    };
  } catch (error) {
    console.error('고객사 삭제 오류:', error);
    throw error;
  }
}