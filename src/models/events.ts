// src/models/events.ts
import { z } from 'zod';

// 이벤트 타입 enum
export enum EventType {
  LECTURE = 'LECTURE',
  SESSION = 'SESSION',
  WORKSHOP = 'WORKSHOP',
  CERTIFICATION = 'CERTIFICATION'
}

// 등록 상태 enum
export enum RegistrationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

// 이벤트 스키마 정의
export const CalendarEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),  // ISO 형식의 날짜 문자열
  startTime: z.string(),
  endTime: z.string().optional(),
  type: z.nativeEnum(EventType),
  description: z.string(),
  location: z.string(),
  instructor: z.string().optional(),
  maxAttendees: z.number().optional(),
  currentAttendees: z.number().optional(),
  isRegistrationOpen: z.boolean(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// 등록 스키마 정의
export const EventRegistrationSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  event: CalendarEventSchema.optional(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  status: z.nativeEnum(RegistrationStatus),
  createdAt: z.string().optional()
});

// 타입 추출
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
export type EventRegistration = z.infer<typeof EventRegistrationSchema>;

// 날짜 유틸리티 함수
export const extractDateOnly = (isoDate: string): string => {
  return isoDate.split('T')[0];
};

export const getDisplayTime = (event: CalendarEvent): string => {
  return event.endTime 
    ? `\${event.startTime} - \${event.endTime}`
    : event.startTime;
};

// 타입 매핑 함수 (GraphQL 응답을 모델 객체로 변환)
export const mapGraphQLEventToModel = (graphqlEvent: any): CalendarEvent => {
  return {
    id: graphqlEvent.id,
    title: graphqlEvent.title,
    date: graphqlEvent.date,
    startTime: graphqlEvent.startTime,
    endTime: graphqlEvent.endTime || undefined,
    type: graphqlEvent.type,
    description: graphqlEvent.description,
    location: graphqlEvent.location,
    instructor: graphqlEvent.instructor || undefined,
    maxAttendees: graphqlEvent.maxAttendees || undefined,
    currentAttendees: graphqlEvent.currentAttendees || undefined,
    isRegistrationOpen: graphqlEvent.isRegistrationOpen || true,
    tags: graphqlEvent.tags || undefined,
    createdAt: graphqlEvent.createdAt,
    updatedAt: graphqlEvent.updatedAt
  };
};