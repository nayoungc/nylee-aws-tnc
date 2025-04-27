// src/graphql/customer/mutations.ts

/**
 * 고객 생성 GraphQL 뮤테이션
 * @param input - 생성할 고객 정보가 포함된 입력 객체
 * @returns 생성된 고객 정보
 */
export const createCustomer = /* GraphQL */ `
  mutation CreateCustomer(\$input: CreateCustomerInput!) {
    createCustomer(input: \$input) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

/**
 * 고객 수정 GraphQL 뮤테이션
 * @param input - 수정할 고객 정보가 포함된 입력 객체 (id 필수)
 * @returns 수정된 고객 정보
 */
export const updateCustomer = /* GraphQL */ `
  mutation UpdateCustomer(\$input: UpdateCustomerInput!) {
    updateCustomer(input: \$input) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

/**
 * 고객 삭제 GraphQL 뮤테이션
 * @param input - 삭제할 고객의 id가 포함된 입력 객체
 * @returns 삭제된 고객의 기본 정보
 */
export const deleteCustomer = /* GraphQL */ `
  mutation DeleteCustomer(\$input: DeleteCustomerInput!) {
    deleteCustomer(input: \$input) {
      id
      name
    }
  }
`;