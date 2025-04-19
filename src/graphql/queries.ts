// src/graphql/queries.ts
export const getCourse = /* GraphQL */ `
  query GetCourse(\$id: ID!) {
    getCourse(id: \$id) {
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
      announcements {
        items {
          id
          title
          content
          createdAt
        }
      }
      assessments {
        items {
          id
          name
          type
          status
          dueDate
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const listCourses = /* GraphQL */ `
  query ListCourses(\$filter: ModelCourseFilterInput, \$limit: Int, \$nextToken: String) {
    listCourses(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        title
        description
        startDate
        endDate
        location
        isOnline
        instructorName
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const listUserProfiles = /* GraphQL */ `
  query ListUserProfiles(\$filter: ModelUserProfileFilterInput, \$limit: Int, \$nextToken: String) {
    listUserProfiles(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        email
        name
        role
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const checkCourseEnrollment = /* GraphQL */ `
  query CheckCourseEnrollment(\$courseId: ID!, \$email: String!) {
    checkCourseEnrollment(courseId: \$courseId, email: \$email) {
      hasAccess
      enrollmentStatus
      courseTitle
    }
  }
`;

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
        contactPerson
        email
        phone
        address
        status
        joinDate
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

export const listInstructors = /* GraphQL */ `
  query ListInstructors(
    \$filter: ModelInstructorFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listInstructors(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
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
      nextToken
    }
  }
`;

export const getInstructor = /* GraphQL */ `
  query GetInstructor(\$id: ID!) {
    getInstructor(id: \$id) {
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

export const listCourseCatalogs = /* GraphQL */ `
  query ListCourseCatalogs(
    \$filter: ModelCourseCatalogFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listCourseCatalogs(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        title
        description
        level
        category
        status
        version
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;