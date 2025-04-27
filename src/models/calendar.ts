// src/models/calendar.ts
import { z } from 'zod';

/** 이벤트 타입 (교육 또는 일반 이벤트) */
export const EventTypeEnum = z.enum(['EVENT', 'CLASS']);
export type EventType = z.infer<typeof EventTypeEnum>;

/** 캘린더 이벤트 기본 타입 */
export const CalendarSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  title_ko: z.string().optional(),
  title_en: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string(),
  location_ko: z.string().optional(),
  location_en: z.string().optional(),
  instructorName: z.string(),
  instructorId: z.string().optional(),
  maxAttendees: z.number(),
  currentAttendees: z.number(),
  eventType: EventTypeEnum,
  isRegistrationOpen: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  description_ko: z.string().optional(),
  description_en: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional()
});

export type Calendar = z.infer<typeof CalendarSchema>;

// CalendarEvent는 Calendar와 동일한 타입 (별칭으로 제공)
export type CalendarEvent = Calendar;

/** 이벤트 등록 정보 (단순화된 버전) */
export const EventRegistrationSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  registrationDate: z.string(),
  attended: z.boolean().default(false),
  attendanceDate: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional()
});

export type EventRegistration = z.infer<typeof EventRegistrationSchema>;

/** 캘린더 이벤트 생성을 위한 입력 타입 */
export const CalendarInputSchema = z.object({
  date: z.string(),
  title: z.string(),
  title_ko: z.string().optional(),
  title_en: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string(),
  location_ko: z.string().optional(),
  location_en: z.string().optional(),
  instructorName: z.string(),
  instructorId: z.string().optional(),
  maxAttendees: z.number(),
  currentAttendees: z.number().optional().default(0),
  eventType: EventTypeEnum,
  isRegistrationOpen: z.boolean().optional().default(true),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  description_ko: z.string().optional(),
  description_en: z.string().optional()
});

export type CalendarInput = z.infer<typeof CalendarInputSchema>;

/** 이벤트 등록 생성을 위한 입력 타입 */
export const EventRegistrationInputSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  notes: z.string().optional()
});

export type EventRegistrationInput = z.infer<typeof EventRegistrationInputSchema>;