export const listCourses = /* GraphQL */ `
  query ListCourses {
    listCourses {
      items {
        id
        code
        title
        description
        category
        duration
        level
        prerequisites
        createdAt
        updatedAt
      }
    }
  }
`;

export const getCourse = /* GraphQL */ `
  query GetCourse(\$id: ID!) {
    getCourse(id: \$id) {
      id
      code
      title
      description
      category
      duration
      level
      prerequisites
      createdAt
      updatedAt
    }
  }
`;

export const listCustomers = /* GraphQL */ `
  query ListCustomers {
    listCustomers {
      items {
        id
        name
        contactName
        contactEmail
        contactPhone
        address
        active
        createdAt
        updatedAt
      }
    }
  }
`;

export const listInstructors = /* GraphQL */ `
  query ListInstructors {
    listInstructors {
      items {
        id
        name
        email
        phone
        bio
        specialties
        active
        createdAt
        updatedAt
      }
    }
  }
`;
// app/graphql/mutations.ts
export const createCourse = /* GraphQL */ `
  mutation CreateCourse(\$input: CreateCourseInput!) {
    createCourse(input: \$input) {
      id
      code
      title
      description
      category
      duration
      level
      prerequisites
      createdAt
      updatedAt
    }
  }
`;

export const updateCourse = /* GraphQL */ `
  mutation UpdateCourse(\$input: UpdateCourseInput!) {
    updateCourse(input: \$input) {
      id
      code
      title
      description
      category
      duration
      level
      prerequisites
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