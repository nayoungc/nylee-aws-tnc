// src/models/courseCatalog.ts
import { z } from 'zod';

/**
 * 코스 난이도 유형
 */
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * 코스 상태 유형
 */
export type CourseStatus = 'ACTIVE' | 'EOL' | 'DRAFT';

/**
 * 코스 제공 방식
 */
export type DeliveryMethod = 'online' | 'offline' | 'hybrid';

/**
 * 코스 목표 항목 스키마
 */
export const CourseObjectiveSchema = z.string();

/**
 * 코스 카탈로그 스키마 정의
 * 재사용 가능한 코스 템플릿
 */
export const CourseCatalogSchema = z.object({
  id: z.string(),              // 코스 카탈로그 ID
  course_name: z.string(),      // 코스 이름
  course_id: z.string().optional(),    // 코스 코드 (선택사항)
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(), // 난이도
  duration: z.string().optional(),    // 교육 기간
  delivery_method: z.enum(['online', 'offline', 'hybrid']).optional(), // 교육 방식
  description: z.string().optional(), // 코스 설명
  objectives: z.array(CourseObjectiveSchema).optional(), // 학습 목표
  target_audience: z.string().optional(), // 대상 수강생
  status: z.enum(['ACTIVE', 'EOL', 'DRAFT']).default('ACTIVE'), // 코스 상태
  createdAt: z.string().optional(),  // 생성 일시
  updatedAt: z.string().optional(),  // 업데이트 일시
  createdBy: z.string().optional(),  // 작성자 ID
  category: z.string().optional(),   // 카테고리
  tags: z.array(z.string()).optional(), // 태그
  prerequisites: z.array(z.string()).optional(), // 선수 과목
  certification: z.boolean().optional(), // 자격증 과정 여부
  metadata: z.record(z.any()).optional(), // 추가 메타데이터
});

/**
 * 코스 카탈로그 입력 스키마
 * 생성 및 수정 시 사용
 */
export const CourseCatalogInputSchema = CourseCatalogSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

/**
 * 코스 카탈로그 필터 스키마
 * 검색 및 필터링 시 사용
 */
export const CourseCatalogFilterSchema = z.object({
  text: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  target_audience: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['ACTIVE', 'EOL', 'DRAFT']).optional(),
  tags: z.array(z.string()).optional(),
});

// 타입 내보내기
export type CourseCatalog = z.infer<typeof CourseCatalogSchema>;
export type CourseCatalogInput = z.infer<typeof CourseCatalogInputSchema>;
export type CourseCatalogFilter = z.infer<typeof CourseCatalogFilterSchema>;