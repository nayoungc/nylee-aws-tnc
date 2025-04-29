// src/models/course.ts
/**
 * 과정 모델 정의
 * @description 교육 과정의 데이터 모델 및 관련 타입 정의
 */

import { z } from 'zod';

/**
 * 과정 상태 열거형
 */
export enum CourseStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'inProgress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * 과정 스키마 정의
 */
export const CourseSchema = z.object({
  courseId: z.string(),                // 고유 식별자
  startDate: z.string(),               // 과정 시작일
  catalogId: z.string(),               // 연결된 카탈로그 ID
  shareCode: z.string(),               // 공유 코드
  instructor: z.string(),              // 강사 ID
  customerId: z.string(),              // 고객사 ID
  durations: z.number().optional(),    // 과정 기간 (일)
  location: z.string().optional(),     // 교육 장소
  attendance: z.number().optional(),   // 출석 인원
  status: z.nativeEnum(CourseStatus).optional(), // 과정 상태
  isAddedToCalendar: z.boolean().optional(), // 캘린더 등록 여부
  createdAt: z.string().optional(),    // 생성 일시
  updatedAt: z.string().optional()     // 업데이트 일시
});

/**
 * 과정 입력 스키마
 */
export const CourseInputSchema = CourseSchema.omit({
  courseId: true,
  createdAt: true,
  updatedAt: true
});

/**
 * 타입 추출
 */
export type Course = z.infer<typeof CourseSchema>;
export type CourseInput = z.infer<typeof CourseInputSchema>;

/**
 * 과정 필터 타입
 */
export interface CourseFilter {
  startDateRange?: {
    from: string;
    to: string;
  };
  status?: CourseStatus;
  catalogId?: string;
  instructor?: string;
  customerId?: string;
  searchText?: string;
}

/**
 * 날짜 범위 입력 타입
 */
export interface DateRangeInput {
  from: string;
  to: string;
}