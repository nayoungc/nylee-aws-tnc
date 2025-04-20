// CourseCatalog 쿼리
export const listCourseCatalog = /* GraphQL */ `
  query ListCourseCatalog(\$limit: Int, \$nextToken: String) {
    listCourseCatalog(limit: \$limit, nextToken: \$nextToken) {
  ) {
    listCourseCatalogs(limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        course_id
        course_name
        level
        duration
        delivery_method
        description
        objectives
        target_audience
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
      course_id
      course_name
      level
      duration
      delivery_method
      description
      objectives
      target_audience
      createdAt
      updatedAt
    }
  }
`;

// Customer 쿼리
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

// Instructor 쿼리
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
        cognitoId
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
      cognitoId
      createdAt
      updatedAt
    }
  }
`;