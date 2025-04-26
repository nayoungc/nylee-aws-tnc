// src/graphql/customer/queries.ts

// 모든 고객 목록 조회
export const listCustomers = /* GraphQL */ `
  query ListCustomers(\$filter: ModelCustomerFilterInput, \$limit: Int, \$nextToken: String) {
    listCustomers(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        customerId
        customerName
        notes
        email
        phone
        organization
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// 특정 고객 조회
export const getCustomer = /* GraphQL */ `
  query GetCustomer(\$customerId: ID!) {
    getCustomer(customerId: \$customerId) {
      customerId
      customerName
      notes
      email
      phone
      organization
      createdAt
      updatedAt
    }
  }
`;