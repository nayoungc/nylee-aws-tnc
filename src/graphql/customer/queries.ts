// src/graphql/customer/queries.ts


/**
 * 고객 목록 조회 쿼리
 */
export const listCustomers = /* GraphQL */ `
  query ListCustomers(\$filter: ModelCustomerFilterInput, \$limit: Int, \$nextToken: String) {
    listCustomers(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        customerName
        notes
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

/**
 * 단일 고객 조회 쿼리
 */
export const getCustomer = /* GraphQL */ `
  query GetCustomer(\$id: ID!) {
    getCustomer(id: \$id) {
      id
      customerName
      notes
      createdAt
      updatedAt
    }
  }
`;

/**
 * 고객 검색 쿼리
 */
export const searchCustomers = /* GraphQL */ `
  query SearchCustomers(\$filter: CustomerFilterInput, \$locale: String) {
    searchCustomers(filter: \$filter, locale: \$locale) {
      items {
        id
        customerName
        notes
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;