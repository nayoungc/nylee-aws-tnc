// src/graphql/calendar/mutations.ts
// 뮤테이션 정의를 별도 파일로 분리
export const createCalendar = /* GraphQL */ `
  mutation CreateCalendar(\$input: CreateCalendarInput!) {
    createCalendar(input: \$input) {
      id
      date
      title
      title_ko
      title_en
      startTime
      endTime
      location
      location_ko
      location_en
      instructorName
      instructorId
      maxAttendees
      currentAttendees
      eventType
      tags
      description
      description_ko
      description_en
      createdAt
    }
  }
`;

export const updateCalendar = /* GraphQL */ `
  mutation UpdateCalendar(\$input: UpdateCalendarInput!) {
    updateCalendar(input: \$input) {
      id
      date
      title
      title_ko
      title_en
      startTime
      endTime
      location
      location_ko
      location_en
      instructorName
      instructorId
      maxAttendees
      currentAttendees
      eventType
      tags
      description
      description_ko
      description_en
      createdAt
    }
  }
`;

export const deleteCalendar = /* GraphQL */ `
  mutation DeleteCalendar(\$input: DeleteCalendarInput!) {
    deleteCalendar(input: \$input) {
      id
      date
      title
    }
  }
`;