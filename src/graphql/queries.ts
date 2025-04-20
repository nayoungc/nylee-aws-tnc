// src/graphql/queries.ts
export const getCourseCatalog = /* GraphQL */ `
  query GetCourseCatalog(\$id: ID!) {
    getCourseCatalog(id: \$id) {
      id
      title
      description
      duration
      level
      price
      category
      status
      version
      createdAt
      updatedAt
      modules {
        items {
          id
          title
          description
          duration
          order
          exercises {
            items {
              id
              title
              description
              type
              durationMinutes
              order
            }
          }
        }
      }
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
        duration
        status
        price
        instructor
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getCourse = /* GraphQL */ `
  query GetCourse(\$id: ID!) {
    getCourse(id: \$id) {
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
        catalogID
        title
        description
        startDate
        endDate
        location
        isOnline
        instructorName
        customerName
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getCoursesByInstructor = /* GraphQL */ `
  query GetCoursesByInstructor(
    \$instructorID: ID!
    \$sortDirection: ModelSortDirection
    \$filter: ModelCourseFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    coursesByInstructorID(
      instructorID: \$instructorID
      sortDirection: \$sortDirection
      filter: \$filter
      limit: \$limit
      nextToken: \$nextToken
    ) {
      items {
        id
        title
        description
        startDate
        endDate
        location
        isOnline
        customerName
        createdAt
        updatedAt
      }
      nextToken
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

// export const listCourseCatalogs = /* GraphQL */ `
//   query ListCourseCatalogs(
//     \$filter: ModelCourseCatalogFilterInput
//     \$limit: Int
//     \$nextToken: String
//   ) {
//     listCourseCatalogs(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
//       items {
//         id
//         title
//         description
//         status
//         createdAt
//         updatedAt
//       }
//       nextToken
//     }
//   }
// `;

// export const getCourseCatalog = /* GraphQL */ `
//   query GetCourseCatalog(\$id: ID!) {
//     getCourseCatalog(id: \$id) {
//       id
//       title
//       description
//       status
//       createdAt
//       updatedAt
//     }
//   }
// `;

export const listQuizzes = /* GraphQL */ `
  query ListQuizzes(
    \$filter: ModelQuizFilterInput
    \$limit: Int
    \$nextToken: String
  ) {
    listQuizzes(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        courseId
        courseName
        quizType
        meta {
          title
          description
          timeLimit
          passScore
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;