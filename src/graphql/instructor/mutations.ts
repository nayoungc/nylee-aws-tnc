// src/graphql/instructor/mutations.ts

// 강사 추가 (Cognito에 사용자 추가)
export const createInstructor = /* GraphQL */ `
  mutation CreateInstructor(\$input: CreateInstructorInput!) {
    createInstructor(input: \$input) {
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

// 강사 정보 업데이트
export const updateInstructor = /* GraphQL */ `
  mutation UpdateInstructor(\$input: UpdateInstructorInput!) {
    updateInstructor(input: \$input) {
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

// 강사 상태 변경 (활성화/비활성화)
export const changeInstructorStatus = /* GraphQL */ `
  mutation ChangeInstructorStatus(\$id: ID!, \$status: InstructorStatus!) {
    changeInstructorStatus(id: \$id, status: \$status) {
      id
      status
      updatedAt
    }
  }
`;