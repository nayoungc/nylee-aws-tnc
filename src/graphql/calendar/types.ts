// src/graphql/calendar/types.ts
import { BaseRecord } from '../common/types';
// 경로 수정: 슬래시 추가 (포맷에 따라 다름)
import { CalendarEvent, EventRegistration } from '@/models/calendar';

// 타입 에일리어스: CalendarEvent를 Calendar로도 사용할 수 있게 함
export type Calendar = CalendarEvent;

// 쿼리 결과 인터페이스
export interface ListCalendarEventsResult {
  listCalendarEvents: {
    items: CalendarEvent[];
    nextToken?: string;
  };
}

export interface GetCalendarEventResult {
  getCalendarEvent: CalendarEvent | null;
}

export interface GetEventsByDateResult {
  getEventsByDate: CalendarEvent[];
}

export interface GetEventsByDateRangeResult {
  getEventsByDateRange: CalendarEvent[];
}

export interface GetEventsByTypeResult {
  getEventsByType: CalendarEvent[];
}

export interface GetEventsByInstructorResult {
  getEventsByInstructor: CalendarEvent[];
}

export interface GetUserRegistrationsResult {
  getUserRegistrations: EventRegistration[];
}

export interface GetUpcomingEventsResult {
  getUpcomingEvents: CalendarEvent[];
}

// 뮤테이션 결과 인터페이스
export interface CreateCalendarEventResult {
  createCalendarEvent: CalendarEvent;
}

export interface UpdateCalendarEventResult {
  updateCalendarEvent: CalendarEvent;
}

export interface DeleteCalendarEventResult {
  deleteCalendarEvent: {
    id: string;
  };
}

export interface UpdateEventRegistrationStatusResult {
  updateEventRegistrationStatus: {
    id: string;
    title: string;
    isRegistrationOpen: boolean;
    updatedAt: string;
  };
}

export interface RegisterForEventResult {
  registerForEvent: EventRegistration;
}

export interface CancelRegistrationResult {
  cancelRegistration: boolean;
}

// 입력 타입
export interface CalendarFilterInput {
  date?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  instructor?: string;
  location?: string;
}

export interface CreateRecurringEventsInput {
  baseEvent: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>;
  startDate: string;
  endDate: string;
  pattern: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  daysOfWeek?: number[]; // 0-6, 0 is Sunday
}

export interface CreateRecurringEventsResult {
  createRecurringEvents: {
    count: number;
    events: Array<{
      id: string;
      title: string;
      date: string;
    }>;
  };
}

// Calendar API 결과 타입 (Calendar 타입 사용)
export interface ListCalendarsResult {
  listCalendars?: {
    items: Calendar[];
    nextToken?: string;
  };
}

export interface GetCalendarResult {
  getCalendar?: Calendar;
}

export interface CalendarsByDateResult {
  calendarsByDate?: {
    items: Calendar[];
    nextToken?: string;
  };
}

export interface RecentCalendarsResult {
  recentCalendars?: Calendar[];
}

export interface CreateCalendarResult {
  createCalendar: Calendar;
}

export interface UpdateCalendarResult {
  updateCalendar: Calendar;
}

export interface DeleteCalendarResult {
  deleteCalendar: {
    id: string;
    title?: string;
  };
}