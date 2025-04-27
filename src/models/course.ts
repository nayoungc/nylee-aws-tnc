// src/models/course.ts
import { z } from 'zod';

/**
 * 과정 상태 열거형
 * 과정의 라이프사이클 상태를 나타냄
 */
export type CourseStatus = 'scheduled' | 'inProgress' | 'completed' | 'cancelled';

/**
 * 과정 스키마 정의
 * 교육 과정의 기본 정보와 메타데이터를 포함
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
  status: z.string().optional(),       // 과정 상태
  isAddedToCalendar: z.boolean().optional(), // 캘린더 등록 여부
  createdAt: z.string().optional(),    // 생성 일시
  updatedAt: z.string().optional()     // 업데이트 일시
});

/**
 * 과정 입력 스키마
 * 과정 생성 시 필요한 필드만 포함
 */
export const CourseInputSchema = CourseSchema.omit({
  courseId: true,
  createdAt: true,
  updatedAt: true
});

// 타입 추출
export type Course = z.infer<typeof CourseSchema>;
export type CourseInput = z.infer<typeof CourseInputSchema>;

/**
 * 과정 필터 타입
 * 과정 목록 조회 시 필터링 조건을 정의
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
