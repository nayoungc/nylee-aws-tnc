// src/graphql/instructor/queries.ts

/**
 * 모든 강사 목록 조회 쿼리
 */
export const listInstructors = /* GraphQL */ `
  query ListInstructors(\$filter: ModelInstructorFilterInput, \$limit: Int, \$nextToken: String) {
    listInstructors(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
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

/**
 * 특정 강사 조회 쿼리
 */
export const getInstructor = /* GraphQL */ `
  query GetInstructor(\$id: ID!) {
    getInstructor(id: \$id) {
      id
      email
      name
      profile
      status
      createdAt
      updatedAt
    }
  }
`;