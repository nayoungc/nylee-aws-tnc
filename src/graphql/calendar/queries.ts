// src/graphql/calendar/queries.ts
// 쿼리 정의를 별도 파일로 분리
export const listCalendars = /* GraphQL */ `
  query ListCalendars(\$limit: Int, \$nextToken: String) {
    listCalendars(limit: \$limit, nextToken: \$nextToken) {
      items {
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
      nextToken
    }
  }
`;

export const getCalendar = /* GraphQL */ `
  query GetCalendar(\$id: ID!) {
    getCalendar(id: \$id) {
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

export const calendarsByDate = /* GraphQL */ `
  query CalendarsByDate(\$date: String!, \$limit: Int, \$nextToken: String) {
    calendarsByDate(date: \$date, limit: \$limit, nextToken: \$nextToken) {
      items {
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
      nextToken
    }
  }
`;

export const recentCalendars = /* GraphQL */ `
  query RecentCalendars(\$limit: Int) {
    recentCalendars(limit: \$limit) {
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