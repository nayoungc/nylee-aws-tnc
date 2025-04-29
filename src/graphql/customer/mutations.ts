// src/graphql/customer/mutations.ts

/**
 * 고객 생성 뮤테이션
 */
export const createCustomer = /* GraphQL */ `
  mutation CreateCustomer(\$input: CreateCustomerInput!) {
    createCustomer(input: \$input) {
      id
      customerName
      notes
      createdAt
      updatedAt
    }
  }
`;

/**
 * 고객 업데이트 뮤테이션
 */
export const updateCustomer = /* GraphQL */ `
  mutation UpdateCustomer(\$input: UpdateCustomerInput!) {
    updateCustomer(input: \$input) {
      id
      customerName
      notes
      createdAt
      updatedAt
    }
  }
`;

/**
 * 고객 삭제 뮤테이션
 */
export const deleteCustomer = /* GraphQL */ `
  mutation DeleteCustomer(\$input: DeleteCustomerInput!) {
    deleteCustomer(input: \$input) {
      id
      customerName
    }
  }
`;