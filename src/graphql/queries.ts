// src/graphql/queries.ts

// 과정 카탈로그 리스트
export const listCourseCatalogs = /* GraphQL */ `
  query ListCourses {
    listCourses {
      items {
        course_id: id
        course_name: title
        level
        duration
        delivery_method
        description
        objectives
        target_audience
      }
      nextToken
    }
  }
`;

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

// 기존 오류 발생 쿼리
export const listCourseCatalogsOriginal = /* GraphQL */ `
  query ListTncCourseCatalogs(\$filter: ModelTncCourseCatalogFilterInput, \$limit: Int) {
    listTncCourseCatalogs(filter: \$filter, limit: \$limit) {
      items {
        id
        title
        description
        instructor
        category
        level
        duration
        status
        price
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;



// 과정 리스트
export const listCourses = /* GraphQL */ `
  query ListCourses {
    listCourses {
      items {
        id
        title
        description
        instructor
        category
        level
        duration
        status
        price
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;