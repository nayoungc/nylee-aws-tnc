// src/graphql/calendar/mutations.ts

// 이벤트 생성
export const createCalendarEvent = /* GraphQL */ `
  mutation CreateCalendarEvent(\$input: CreateCalendarEventInput!) {
    createCalendarEvent(input: \$input) {
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

// 이벤트 업데이트
export const updateCalendarEvent = /* GraphQL */ `
  mutation UpdateCalendarEvent(\$input: UpdateCalendarEventInput!) {
    updateCalendarEvent(input: \$input) {
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
      updatedAt
    }
  }
`;

// 이벤트 삭제
export const deleteCalendarEvent = /* GraphQL */ `
  mutation DeleteCalendarEvent(\$input: DeleteCalendarEventInput!) {
    deleteCalendarEvent(input: \$input) {
      id
      title
    }
  }
`;

// 이벤트 등록 상태 변경 (오픈/클로즈)
export const updateEventRegistrationStatus = /* GraphQL */ `
  mutation UpdateEventRegistrationStatus(\$id: ID!, \$isOpen: Boolean!) {
    updateEventRegistrationStatus(id: \$id, isOpen: \$isOpen) {
      id
      title
      isRegistrationOpen
      updatedAt
    }
  }
`;

// 이벤트 등록 (참가 신청)
export const registerForEvent = /* GraphQL */ `
  mutation RegisterForEvent(\$eventId: ID!, \$userName: String!, \$userEmail: String!) {
    registerForEvent(eventId: \$eventId, userName: \$userName, userEmail: \$userEmail) {
      id
      eventId
      userId
      userName
      userEmail
      status
      createdAt
    }
  }
`;

// 등록 취소
export const cancelRegistration = /* GraphQL */ `
  mutation CancelRegistration(\$registrationId: ID!) {
    cancelRegistration(registrationId: \$registrationId)
  }
`;

// 이벤트 참석자 수 업데이트
export const updateEventAttendeeCount = /* GraphQL */ `
  mutation UpdateEventAttendeeCount(\$id: ID!, \$count: Int!) {
    updateEventAttendeeCount(id: \$id, count: \$count) {
      id
      title
      currentAttendees
      maxAttendees
      updatedAt
    }
  }
`;

// 반복 이벤트 생성
export const createRecurringEvents = /* GraphQL */ `
  mutation CreateRecurringEvents(\$input: CreateRecurringEventsInput!) {
    createRecurringEvents(input: \$input) {
      count
      events {
        id
        title
        date
      }
    }
  }
`;

// 이벤트 강사 변경
export const changeEventInstructor = /* GraphQL */ `
  mutation ChangeEventInstructor(\$id: ID!, \$instructor: String!) {
    changeEventInstructor(id: \$id, instructor: \$instructor) {
      id
      title
      instructor
      updatedAt
    }
  }
`;