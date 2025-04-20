// 과정 카탈로그 구독
export const onCreateCourseCatalog = /* GraphQL */ `
  subscription OnCreateCourseCatalog(
    \$filter: ModelSubscriptionCourseCatalogFilterInput
  ) {
    onCreateCourseCatalog(filter: \$filter) {
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

export const onUpdateCourseCatalog = /* GraphQL */ `
  subscription OnUpdateCourseCatalog(
    \$filter: ModelSubscriptionCourseCatalogFilterInput
  ) {
    onUpdateCourseCatalog(filter: \$filter) {
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

export const onDeleteCourseCatalog = /* GraphQL */ `
  subscription OnDeleteCourseCatalog(
    \$filter: ModelSubscriptionCourseCatalogFilterInput
  ) {
    onDeleteCourseCatalog(filter: \$filter) {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

// 고객사 구독
export const onCreateCustomer = /* GraphQL */ `
  subscription OnCreateCustomer(\$filter: ModelSubscriptionCustomerFilterInput) {
    onCreateCustomer(filter: \$filter) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

export const onUpdateCustomer = /* GraphQL */ `
  subscription OnUpdateCustomer(\$filter: ModelSubscriptionCustomerFilterInput) {
    onUpdateCustomer(filter: \$filter) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

export const onDeleteCustomer = /* GraphQL */ `
  subscription OnDeleteCustomer(\$filter: ModelSubscriptionCustomerFilterInput) {
    onDeleteCustomer(filter: \$filter) {
      id
      name
      createdAt
      updatedAt
    }
  }
`;

// 강사 구독
export const onCreateInstructor = /* GraphQL */ `
  subscription OnCreateInstructor(
    \$filter: ModelSubscriptionInstructorFilterInput
  ) {
    onCreateInstructor(filter: \$filter) {
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

export const onUpdateInstructor = /* GraphQL */ `
  subscription OnUpdateInstructor(
    \$filter: ModelSubscriptionInstructorFilterInput
  ) {
    onUpdateInstructor(filter: \$filter) {
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

export const onDeleteInstructor = /* GraphQL */ `
  subscription OnDeleteInstructor(
    \$filter: ModelSubscriptionInstructorFilterInput
  ) {
    onDeleteInstructor(filter: \$filter) {
      id
      name
      email
      createdAt
      updatedAt
    }
  }
`;