// src/models/calendar.ts
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  instructorId: string;
  maxAttendees: number;
  currentAttendees: number;
  tags?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarEventInput {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  instructorId: string;
  maxAttendees: number;
  tags?: string[];
  description?: string;
}

export interface CalendarFilter {
  date?: string;
  dateRange?: { start: string; end: string };
  instructorId?: string;
  tags?: string[];
  searchText?: string;
}