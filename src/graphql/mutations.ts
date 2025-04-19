// src/graphql/mutations.ts
export const createCourse = /* GraphQL */ `
  mutation CreateCourse(\$input: CreateCourseInput!) {
    createCourse(input: \$input) {
      id
      title
      description
      startDate
      endDate
      location
      isOnline
      maxStudents
      instructorID
      instructorName
      tags
      createdAt
      updatedAt
    }
  }
`;

export const createAnnouncement = /* GraphQL */ `
  mutation CreateAnnouncement(\$input: CreateAnnouncementInput!) {
    createAnnouncement(input: \$input) {
      id
      title
      content
      courseID
      createdAt
      updatedAt
    }
  }
`;

export const createAssessment = /* GraphQL */ `
  mutation CreateAssessment(\$input: CreateAssessmentInput!) {
    createAssessment(input: \$input) {
      id
      name
      type
      status
      dueDate
      courseID
      createdAt
      updatedAt
    }
  }
`;

export const updateCourse = /* GraphQL */ `
  mutation UpdateCourse(
    \$input: UpdateCourseInput!
    \$condition: ModelCourseConditionInput
  ) {
    updateCourse(input: \$input, condition: \$condition) {
      id
      title
      description
      duration
      level
      price
      category
      publishedDate
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const deleteCourse = /* GraphQL */ `
  mutation DeleteCourse(
    \$input: DeleteCourseInput!
    \$condition: ModelCourseConditionInput
  ) {
    deleteCourse(input: \$input, condition: \$condition) {
      id
    }
  }
`;

// Customer 뮤테이션
export const createCustomer = /* GraphQL */ `
  mutation CreateCustomer(
    \$input: CreateCustomerInput!
    \$condition: ModelCustomerConditionInput
  ) {
    createCustomer(input: \$input, condition: \$condition) {
      id
      name
      contactPerson
      email
      phone
      address
      status
      joinDate
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
      contactPerson
      email
      phone
      address
      status
      joinDate
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
    }
  }
`;

// Instructor 뮤테이션
export const createInstructor = /* GraphQL */ `
  mutation CreateInstructor(
    \$input: CreateInstructorInput!
    \$condition: ModelInstructorConditionInput
  ) {
    createInstructor(input: \$input, condition: \$condition) {
      id
      cognitoId
      name
      email
      phone
      specialization
      bio
      status
      joinDate
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
      cognitoId
      name
      email
      phone
      specialization
      bio
      status
      joinDate
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
    }
  }
`;

