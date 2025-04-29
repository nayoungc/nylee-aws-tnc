// src/models/courseCatalog.ts
import { z } from 'zod';

/**
 * 코스 카탈로그 상태 열거형
 * @description 백엔드 스키마와 일치하는 코스 상태 정의
 */
export enum CourseCatalogStatus {
  ACTIVE = 'ACTIVE',   // 활성 상태
  EOL = 'EOL'          // End of Life
}

/**
 * 코스 난이도 타입
 * @description 코스 난이도를 나타내는 문자열 타입
 */
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * 코스 제공 방식 타입
 * @description 코스 제공 방식을 나타내는 문자열 타입
 */
export type DeliveryMethod = 'online' | 'offline' | 'hybrid';

/**
 * 코스 카탈로그 인터페이스
 * @description 백엔드 GraphQL 스키마와 일치하는 코스 카탈로그 모델
 */
export interface CourseCatalog {
  id: string;                         // 고유 식별자
  course_name: string;                // 코스 이름 (백엔드: course_name)
  course_id?: string;                 // 코스 코드 (백엔드: course_id)
  level?: CourseLevel;                // 난이도
  duration?: string;                  // 교육 기간 (백엔드: duration - 문자열)
  delivery_method?: DeliveryMethod;   // 교육 방식
  description?: string;              // 코스 설명
  objectives?: string[];             // 학습 목표
  target_audience?: string;          // 대상 수강생
  status?: CourseCatalogStatus;      // 코스 상태
  createdAt?: string;                // 생성 일시
  updatedAt?: string;                // 업데이트 일시
  createdBy?: string;                // 작성자
}

/**
 * 코스 카탈로그 입력 타입
 * @description 코스 카탈로그 생성 및 수정에 사용되는 입력 타입
 */
export interface CourseCatalogInput {
  course_name: string;
  course_id?: string;
  level?: CourseLevel;
  duration?: string;
  delivery_method?: DeliveryMethod;
  description?: string;
  objectives?: string[];
  target_audience?: string;
  status?: CourseCatalogStatus;
}

/**
 * 코스 카탈로그 필터 타입
 * @description 코스 카탈로그 검색 및 필터링에 사용되는 타입
 */
export interface CourseCatalogFilter {
  text?: string;
  level?: CourseLevel;
  target_audience?: string;
  status?: CourseCatalogStatus;
}

/**
 * Zod 스키마를 사용한 유효성 검증
 */
export const CourseCatalogSchema = z.object({
  id: z.string(),
  course_name: z.string().min(1, { message: "코스 이름은 필수입니다" }),
  course_id: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  duration: z.string().optional(),
  delivery_method: z.enum(['online', 'offline', 'hybrid']).optional(),
  description: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  target_audience: z.string().optional(),
  status: z.nativeEnum(CourseCatalogStatus).default(CourseCatalogStatus.ACTIVE),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional()
});

/**
 * 코스 카탈로그 입력 스키마
 */
export const CourseCatalogInputSchema = CourseCatalogSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true
});

/**
 * 코스 카탈로그 필터 스키마
 */
export const CourseCatalogFilterSchema = z.object({
  text: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  target_audience: z.string().optional(),
  status: z.nativeEnum(CourseCatalogStatus).optional()
});
