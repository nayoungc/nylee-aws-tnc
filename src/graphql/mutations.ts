// src/graphql/mutations.ts

// CourseCatalog 뮤테이션
export const createCourseCatalog = /* GraphQL */ `
  mutation CreateCourseCatalog(\$input: CreateCourseCatalogInput!) {
    createCourseCatalog(input: \$input) {
      id
      course_name
      level
      duration
      delivery_method
      description
      objectives
      target_audience
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
      course_name
      level
      duration
      delivery_method
      description
      objectives
      target_audience
    }
  }
`;

export const createCourseCatalogModule = /* GraphQL */ `
  mutation CreateCourseCatalogModule(\$input: CreateCourseCatalogModuleInput!) {
    createCourseCatalogModule(input: \$input) {
      id
      catalogID
      title
      description
      duration
      order
      createdAt
      updatedAt
    }
  }
`;

export const createExercise = /* GraphQL */ `
  mutation CreateExercise(\$input: CreateExerciseInput!) {
    createExercise(input: \$input) {
      id
      moduleID
      title
      description
      type
      durationMinutes
      order
      createdAt
      updatedAt
    }
  }
`;

// Course 뮤테이션
export const createCourse = /* GraphQL */ `
  mutation CreateCourse(\$input: CreateCourseInput!) {
    createCourse(input: \$input) {
      id
      catalogID
      title
      description
      startDate
      endDate
      location
      isOnline
      maxStudents
      instructorID
      instructorName
      customerID
      customerName
      tags
      createdAt
      updatedAt
    }
  }
`;

export const updateCourse = /* GraphQL */ `
  mutation UpdateCourse(\$input: UpdateCourseInput!) {
    updateCourse(input: \$input) {
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
      customerID
      customerName
      tags
      createdAt
      updatedAt
    }
  }
`;

export const deleteCourse = /* GraphQL */ `
  mutation DeleteCourse(\$input: DeleteCourseInput!) {
    deleteCourse(input: \$input) {
      id
    }
  }
`;

export const createAnnouncement = /* GraphQL */ `
  mutation CreateAnnouncement(\$input: CreateAnnouncementInput!) {
    createAnnouncement(input: \$input) {
      id
      courseID
      title
      content
      createdAt
      updatedAt
    }
  }
`;

export const createAssessment = /* GraphQL */ `
  mutation CreateAssessment(\$input: CreateAssessmentInput!) {
    createAssessment(input: \$input) {
      id
      courseID
      name
      type
      status
      dueDate
      createdAt
      updatedAt
    }
  }
`;

// Customer 뮤테이션
export const createCustomer = /* GraphQL */ `
  mutation CreateCustomer(\$input: CreateCustomerInput!) {
    createCustomer(input: \$input) {
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
  mutation UpdateCustomer(\$input: UpdateCustomerInput!) {
    updateCustomer(input: \$input) {
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
  mutation DeleteCustomer(\$input: DeleteCustomerInput!) {
    deleteCustomer(input: \$input) {
      id
    }
  }
`;

// Instructor 뮤테이션
export const createInstructor = /* GraphQL */ `
  mutation CreateInstructor(\$input: CreateInstructorInput!) {
    createInstructor(input: \$input) {
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
  mutation UpdateInstructor(\$input: UpdateInstructorInput!) {
    updateInstructor(input: \$input) {
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
  mutation DeleteInstructor(\$input: DeleteInstructorInput!) {
    deleteInstructor(input: \$input) {
      id
    }
  }
`;