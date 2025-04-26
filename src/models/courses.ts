// src/models/course.ts
import { z } from 'zod';

// 과정 상태 열거형
export type CourseStatus = 'scheduled' | 'inProgress' | 'completed' | 'cancelled';

// 과정 스키마 정의
export const CourseSchema = z.object({
  courseId: z.string(),
  startDate: z.string(),
  catalogId: z.string(),
  shareCode: z.string(),
  instructor: z.string(),
  customerId: z.string(),
  durations: z.number().optional(),
  location: z.string().optional(),
  attendance: z.number().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// 과정 입력 스키마
export const CourseInputSchema = CourseSchema.omit({
  courseId: true,
  createdAt: true,
  updatedAt: true
});

// 타입 추출
export type Course = z.infer<typeof CourseSchema>;
export type CourseInput = z.infer<typeof CourseInputSchema>;

// 과정 필터 타입
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