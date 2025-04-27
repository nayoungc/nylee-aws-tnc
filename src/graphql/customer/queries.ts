// src/graphql/customer/queries.ts

/**
 * 모든 고객 목록 조회 GraphQL 쿼리
 * @param filter - 필터링 조건
 * @param limit - 한 번에 가져올 항목 수
 * @param nextToken - 페이지네이션 토큰
 */
export const listCustomers = /* GraphQL */ `
  query ListCustomers(\$filter: ModelCustomerFilterInput, \$limit: Int, \$nextToken: String) {
    listCustomers(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
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

/**
 * 특정 고객 조회 GraphQL 쿼리
 * @param id - 조회할 고객의 ID
 */
export const getCustomer = /* GraphQL */ `
  query GetCustomer(\$id: ID!) {
    getCustomer(id: \$id) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

/**
 * 고객 검색 GraphQL 쿼리
 * @param filter - 검색 필터링 조건
 * @param limit - 한 번에 가져올 항목 수
 * @param nextToken - 페이지네이션 토큰
 */
export const searchCustomers = /* GraphQL */ `
  query SearchCustomers(\$filter: SearchableCustomerFilterInput, \$limit: Int, \$nextToken: String) {
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