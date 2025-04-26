// src/graphql/instructor/queries.ts

// 모든 강사 목록 조회
export const listInstructors = /* GraphQL */ `
  query ListInstructors(\$filter: InstructorFilterInput, \$limit: Int, \$nextToken: String) {
    listInstructors(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        username
        email
        name
        profile
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// 특정 강사 조회
export const getInstructor = /* GraphQL */ `
  query GetInstructor(\$id: ID!) {
    getInstructor(id: \$id) {
      id
      username
      email
      name
      profile
      status
      createdAt
      updatedAt
    }
  }
`;

// 강사 검색
export const searchInstructors = /* GraphQL */ `
  query SearchInstructors(\$filter: InstructorSearchFilterInput, \$limit: Int, \$nextToken: String) {
    searchInstructors(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        username
        email
        name
        profile
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;