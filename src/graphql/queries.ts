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
