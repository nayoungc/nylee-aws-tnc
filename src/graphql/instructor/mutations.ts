// src/graphql/instructor/mutations.ts
/**
 * 강사 생성 뮤테이션
 */
export const createInstructor = /* GraphQL */ `
  mutation CreateInstructor(\$input: CreateInstructorInput!) {
    createInstructor(input: \$input) {
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
 * 강사 정보 업데이트 뮤테이션
 */
export const updateInstructor = /* GraphQL */ `
  mutation UpdateInstructor(\$input: UpdateInstructorInput!) {
    updateInstructor(input: \$input) {
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
 * 강사 상태 변경 뮤테이션
 */
export const changeInstructorStatus = /* GraphQL */ `
  mutation ChangeInstructorStatus(\$id: ID!, \$status: InstructorStatus!) {
    changeInstructorStatus(id: \$id, status: \$status) {
      id
      status
      updatedAt
    }
  }
`;