// src/graphql/customer/mutations.ts

// 고객 생성
export const createCustomer = /* GraphQL */ `
  mutation CreateCustomer(\$input: CreateCustomerInput!) {
    createCustomer(input: \$input) {
      id
      name
      notes
      createdAt
      updatedAt
    }
  }
`;

// 고객 수정
export const updateCustomer = /* GraphQL */ `
  mutation UpdateCustomer(\$input: UpdateCustomerInput!) {
    updateCustomer(input: \$input) {
      id
      name
      notes
      createdAt
      updatedAt
    }
  }
`;

// 고객 삭제
export const deleteCustomer = /* GraphQL */ `
  mutation DeleteCustomer(\$input: DeleteCustomerInput!) {
    deleteCustomer(input: \$input) {
      id
      name
    }
  }
`;
