// src/models/calendar.ts
/**
 * Calendar 이벤트 관련 타입 정의
 * 
 * 캘린더 이벤트 도메인 모델 및 관련 타입들을 정의합니다.
 * AppSync 리졸버에서 사용되는 입력과 출력 타입을 포함합니다.
 */
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
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  description_ko: z.string().optional(),
  description_en: z.string().optional(),
  createdAt: z.string()
});
export type Calendar = z.infer<typeof CalendarSchema>;

/** 캘린더 이벤트 생성을 위한 입력 타입 */
export const CreateCalendarInputSchema = z.object({
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
  currentAttendees: z.number().optional(),
  eventType: EventTypeEnum,
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  description_ko: z.string().optional(),
  description_en: z.string().optional()
});
export type CreateCalendarInput = z.infer<typeof CreateCalendarInputSchema>;

/** 캘린더 이벤트 수정을 위한 입력 타입 */
export const UpdateCalendarInputSchema = z.object({
  id: z.string(),
  date: z.string().optional(),
  title: z.string().optional(),
  title_ko: z.string().optional(),
  title_en: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  location_ko: z.string().optional(),
  location_en: z.string().optional(),
  instructorName: z.string().optional(),
  instructorId: z.string().optional(),
  maxAttendees: z.number().optional(),
  currentAttendees: z.number().optional(),
  eventType: EventTypeEnum.optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  description_ko: z.string().optional(),
  description_en: z.string().optional()
});
export type UpdateCalendarInput = z.infer<typeof UpdateCalendarInputSchema>;

/** 캘린더 이벤트 삭제를 위한 입력 타입 */
export const DeleteCalendarInputSchema = z.object({
  id: z.string()
});
export type DeleteCalendarInput = z.infer<typeof DeleteCalendarInputSchema>;

/** 캘린더 이벤트 목록 및 페이지네이션 정보 */
export const CalendarConnectionSchema = z.object({
  items: z.array(CalendarSchema),
  nextToken: z.string().optional()
});
export type CalendarConnection = z.infer<typeof CalendarConnectionSchema>;