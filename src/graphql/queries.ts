// 과정 카탈로그 쿼리
export const listCourseCatalogs = /* GraphQL */ `
  query ListCourseCatalogs(
    \$filter: ModelCourseCatalogFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listCourseCatalogs(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        title
        description
        duration
        level
        category
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getCourseCatalog = /* GraphQL */ `
  query GetCourseCatalog(\$id: ID!) {
    getCourseCatalog(id: \$id) {
      id
      title
      description
      duration
      level
      category
      createdAt
      updatedAt
    }
  }
`;

// 고객사 쿼리
export const listCustomers = /* GraphQL */ `
  query ListCustomers(
    \$filter: ModelCustomerFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
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

// 강사 쿼리
export const listInstructors = /* GraphQL */ `
  query ListInstructors(
    \$filter: ModelInstructorFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listInstructors(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        name
        email
        status
        profile
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getInstructor = /* GraphQL */ `
  query GetInstructor(\$id: ID!) {
    getInstructor(id: \$id) {
      id
      name
      email
      status
      profile
      createdAt
      updatedAt
    }
  }
`;

// 필터 쿼리 - 상태별 강사 조회
export const instructorsByStatus = /* GraphQL */ `
  query InstructorsByStatus(
    \$status: String
    \$sortDirection: ModelSortDirection
    \$filter: ModelInstructorFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    instructorsByStatus(
      status: \$status
      sortDirection: \$sortDirection
      filter: \$filter
      limit: \$limit
      nextToken: \$nextToken
    ) {
      items {
        id
        name
        email
        status
        profile
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// 검색 쿼리 예시 - 과정 카탈로그 검색
export const searchCourseCatalogs = /* GraphQL */ `
  query SearchCourseCatalogs(
    \$filter: SearchableCourseCatalogFilterInput
    \$sort: [SearchableCourseCatalogSortInput]
    \$limit: Int
    \$nextToken: String
    \$from: Int
    \$aggregates: [SearchableCourseCatalogAggregationInput]
  ) {
    searchCourseCatalogs(
      filter: \$filter
      sort: \$sort
      limit: \$limit
      nextToken: \$nextToken
      from: \$from
      aggregates: \$aggregates
    ) {
      items {
        id
        title
        description
        duration
        level
        category
        createdAt
        updatedAt
      }
      nextToken
      total
    }
  }
`;
