// src/graphql/instructor/queries.ts

/**
 * 모든 강사 목록 조회 쿼리
 * username 필드 제거 (백엔드 스키마에 없음)
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
 * username 필드 제거 (백엔드 스키마에 없음)
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

/**
 * 강사 검색 쿼리
 * username 필드 제거 (백엔드 스키마에 없음)
 */
export const searchInstructors = /* GraphQL */ `
  query SearchInstructors(\$filter: InstructorSearchFilterInput, \$limit: Int, \$nextToken: String) {
    searchInstructors(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
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