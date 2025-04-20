// 과정 카탈로그 뮤테이션
export const createCourseCatalog = /* GraphQL */ `
  mutation CreateCourseCatalog(
    \$input: CreateCourseCatalogInput!
    \$condition: ModelCourseCatalogConditionInput
  ) {
    createCourseCatalog(input: \$input, condition: \$condition) {
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

export const updateCourseCatalog = /* GraphQL */ `
  mutation UpdateCourseCatalog(
    \$input: UpdateCourseCatalogInput!
    \$condition: ModelCourseCatalogConditionInput
  ) {
    updateCourseCatalog(input: \$input, condition: \$condition) {
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

export const deleteCourseCatalog = /* GraphQL */ `
  mutation DeleteCourseCatalog(
    \$input: DeleteCourseCatalogInput!
    \$condition: ModelCourseCatalogConditionInput
  ) {
    deleteCourseCatalog(input: \$input, condition: \$condition) {
      id
      title
      description
      createdAt
      updatedAt
    }
  }
`;

// 고객사 뮤테이션
export const createCustomer = /* GraphQL */ `
  mutation CreateCustomer(
    \$input: CreateCustomerInput!
    \$condition: ModelCustomerConditionInput
  ) {
    createCustomer(input: \$input, condition: \$condition) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

export const updateCustomer = /* GraphQL */ `
  mutation UpdateCustomer(
    \$input: UpdateCustomerInput!
    \$condition: ModelCustomerConditionInput
  ) {
    updateCustomer(input: \$input, condition: \$condition) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

export const deleteCustomer = /* GraphQL */ `
  mutation DeleteCustomer(
    \$input: DeleteCustomerInput!
    \$condition: ModelCustomerConditionInput
  ) {
    deleteCustomer(input: \$input, condition: \$condition) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

// 강사 뮤테이션
export const createInstructor = /* GraphQL */ `
  mutation CreateInstructor(
    \$input: CreateInstructorInput!
    \$condition: ModelInstructorConditionInput
  ) {
    createInstructor(input: \$input, condition: \$condition) {
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

export const updateInstructor = /* GraphQL */ `
  mutation UpdateInstructor(
    \$input: UpdateInstructorInput!
    \$condition: ModelInstructorConditionInput
  ) {
    updateInstructor(input: \$input, condition: \$condition) {
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

export const deleteInstructor = /* GraphQL */ `
  mutation DeleteInstructor(
    \$input: DeleteInstructorInput!
    \$condition: ModelInstructorConditionInput
  ) {
    deleteInstructor(input: \$input, condition: \$condition) {
      id
      name
      email
      createdAt
      updatedAt
    }
  }
`;