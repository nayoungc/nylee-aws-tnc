// src/graphql/calendar/types.ts
import { BaseRecord } from '../common/types';
import { CalendarEvent, EventRegistration } from '../../models/events';

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