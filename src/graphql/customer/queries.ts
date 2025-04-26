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

// 고객 검색
export const searchCustomers = /* GraphQL */ `
  query SearchCustomers(\$filter: CustomerSearchFilterInput, \$limit: Int, \$nextToken: String) {
    searchCustomers(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
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

// 고급 고객 검색 (다중 필터 조건 지원)
export const advancedSearchCustomers = /* GraphQL */ `
  query AdvancedSearchCustomers(
    \$name: String, 
    \$organization: String, 
    \$email: String,
    \$tags: [String], 
    \$fromDate: String,
    \$toDate: String,
    \$sortField: String,
    \$sortOrder: String,
    \$limit: Int, 
    \$nextToken: String
  ) {
    advancedSearchCustomers(
      name: \$name,
      organization: \$organization,
      email: \$email,
      tags: \$tags,
      fromDate: \$fromDate,
      toDate: \$toDate,
      sortField: \$sortField,
      sortOrder: \$sortOrder,
      limit: \$limit, 
      nextToken: \$nextToken
    ) {
      items {
        customerId
        customerName
        notes
        email
        phone
        organization
        tags
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;