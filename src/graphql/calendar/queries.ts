// src/graphql/calendar/queries.ts

// 모든 캘린더 이벤트 조회
export const listCalendarEvents = /* GraphQL */ `
  query ListCalendarEvents(\$filter: ModelCalendarEventFilterInput, \$limit: Int, \$nextToken: String) {
    listCalendarEvents(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        id
        title
        date
        startTime
        endTime
        type
        description
        location
        instructor
        maxAttendees
        currentAttendees
        isRegistrationOpen
        tags
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// 특정 이벤트 상세 조회
export const getCalendarEvent = /* GraphQL */ `
  query GetCalendarEvent(\$id: ID!) {
    getCalendarEvent(id: \$id) {
      id
      title
      date
      startTime
      endTime
      type
      description
      location
      instructor
      maxAttendees
      currentAttendees
      isRegistrationOpen
      tags
      createdAt
      updatedAt
    }
  }
`;

// 특정 날짜의 이벤트 조회
export const getEventsByDate = /* GraphQL */ `
  query GetEventsByDate(\$date: String!) {
    getEventsByDate(date: \$date) {
      id
      title
      date
      startTime
      endTime
      type
      description
      location
      instructor
      maxAttendees
      currentAttendees
      isRegistrationOpen
      tags
    }
  }
`;

// 날짜 범위 이벤트 조회
export const getEventsByDateRange = /* GraphQL */ `
  query GetEventsByDateRange(\$startDate: String!, \$endDate: String!) {
    getEventsByDateRange(startDate: \$startDate, endDate: \$endDate) {
      id
      title
      date
      startTime
      endTime
      type
      description
      location
      instructor
      maxAttendees
      currentAttendees
      isRegistrationOpen
      tags
    }
  }
`;

// 특정 유형의 이벤트 조회
export const getEventsByType = /* GraphQL */ `
  query GetEventsByType(\$type: EventType!) {
    getEventsByType(type: \$type) {
      id
      title
      date
      startTime
      endTime
      type
      description
      location
      instructor
      maxAttendees
      currentAttendees
      isRegistrationOpen
      tags
    }
  }
`;

// 특정 강사의 이벤트 조회
export const getEventsByInstructor = /* GraphQL */ `
  query GetEventsByInstructor(\$instructor: String!) {
    getEventsByInstructor(instructor: \$instructor) {
      id
      title
      date
      startTime
      endTime
      type
      description
      location
      instructor
      maxAttendees
      currentAttendees
      isRegistrationOpen
    }
  }
`;

// 사용자의 등록된 이벤트 조회
export const getUserRegistrations = /* GraphQL */ `
  query GetUserRegistrations(\$userId: ID!) {
    getUserRegistrations(userId: \$userId) {
      id
      eventId
      event {
        id
        title
        date
        startTime
        endTime
        location
      }
      status
      createdAt
    }
  }
`;

// 향후 예정된 이벤트 조회
export const getUpcomingEvents = /* GraphQL */ `
  query GetUpcomingEvents(\$limit: Int) {
    getUpcomingEvents(limit: \$limit) {
      id
      title
      date
      startTime
      endTime
      type
      location
      isRegistrationOpen
      maxAttendees
      currentAttendees
    }
  }
`;