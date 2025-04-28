// src/models/courseCatalog.ts
import { z } from 'zod';

// 기존 타입 정의 앞에 CourseCatalogStatus 열거형 추가
export const CourseCatalogStatusEnum = z.enum([
  'ACTIVE',
  'EOL'
]);
export type CourseCatalogStatus = z.infer<typeof CourseCatalogStatusEnum>;

// 기존 타입 정의에 status 필드 추가
export const CourseCatalogSchema = z.object({
  id: z.string(),
  course_name: z.string(),
  course_id: z.string().optional(),
  level: z.string().optional(),
  duration: z.string().optional(),
  delivery_method: z.string().optional(),
  description: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  target_audience: z.string().optional(),
  status: CourseCatalogStatusEnum.default('ACTIVE'), // 상태 필드 추가
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});
export type CourseCatalog = z.infer<typeof CourseCatalogSchema>;

// 입력 타입에도 status 추가
export const CourseCatalogInputSchema = z.object({
  course_name: z.string(),
  course_id: z.string().optional(),
  level: z.string().optional(),
  duration: z.string().optional(),
  delivery_method: z.string().optional(),
  description: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  target_audience: z.string().optional(),
  status: CourseCatalogStatusEnum.optional() // 선택적 상태 필드
});
export type CourseCatalogInput = z.infer<typeof CourseCatalogInputSchema>;

// 필터 타입에도 status 추가
export const CourseCatalogFilterSchema = z.object({
  text: z.string().optional(),
  level: z.string().optional(),
  target_audience: z.string().optional(),
  status: CourseCatalogStatusEnum.optional() // 상태로 필터링 가능
});
export type CourseCatalogFilter = z.infer<typeof CourseCatalogFilterSchema>;