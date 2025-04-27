// src/models/courseSurvey.ts
import { z } from 'zod';

/**
 * 코스-설문조사 연결 스키마
 * 특정 과정에서 사용되는 설문조사 인스턴스
 */
export const CourseSurveySchema = z.object({
  courseSurveyId: z.string(),   // 코스-설문조사 ID
  courseId: z.string(),         // 코스 ID
  surveyCatalogId: z.string(),  // 설문조사 카탈로그 ID
  title: z.string().optional(), // 선택적 커스텀 제목
  description: z.string().optional(), // 선택적 커스텀 설명
  startDate: z.string().optional(), // 설문조사 시작 가능 시간
  endDate: z.string().optional(), // 설문조사 마감 시간
  isAnonymous: z.boolean().optional(), // 익명 응답 여부
  isActive: z.boolean().default(true), // 활성화 여부
  createdAt: z.string().optional(), // 생성 일시
  updatedAt: z.string().optional(), // 업데이트 일시
});

export type CourseSurvey = z.infer<typeof CourseSurveySchema>;