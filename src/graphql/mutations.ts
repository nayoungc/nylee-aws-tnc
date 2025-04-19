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

