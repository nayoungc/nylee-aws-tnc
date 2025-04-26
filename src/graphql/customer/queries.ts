// src/graphql/customer/queries.ts

// 모든 고객 목록 조회
export const listCustomers = /* GraphQL */ `
  query ListCustomers(\$filter: CustomerFilterInput, \$limit: Int, \$nextToken: String) {
    listCustomers(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        name
        notes
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// 특정 고객 조회
export const getCustomer = /* GraphQL */ `
  query GetCustomer(\$id: ID!) {
    getCustomer(id: \$id) {
      id
      name
      notes
      createdAt
      updatedAt
    }
  }
`;

// 고객 검색
export const searchCustomers = /* GraphQL */ `
  query SearchCustomers(\$filter: CustomerSearchFilterInput, \$limit: Int, \$nextToken: String) {
    searchCustomers(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        name
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;