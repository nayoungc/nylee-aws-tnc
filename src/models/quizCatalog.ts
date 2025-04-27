// src/models/quizCatalog.ts
import { z } from 'zod';

/**
 * 퀴즈 유형
 */
export type QuizType = 'pre' | 'post';

/**
 * 퀴즈 카탈로그 스키마 정의
 * 재사용 가능한 퀴즈 템플릿
 */
export const QuizCatalogSchema = z.object({
  quizCatalogId: z.string(),        // 퀴즈 카탈로그 ID
  title: z.string(),                // 퀴즈 제목
  description: z.string().optional(),  // 퀴즈 설명
  defaultType: z.enum(['pre', 'post']), // 기본 퀴즈 유형
  questions: z.array(z.any()),      // 질문 목록 (상세 구조는 필요에 따라 정의)
  defaultTimeLimit: z.number().optional(), // 기본 시간 제한 (분)
  tags: z.array(z.string()).optional(), // 태그 (검색용)
  createdAt: z.string().optional(), // 생성 일시
  updatedAt: z.string().optional()  // 업데이트 일시
});

export type QuizCatalog = z.infer<typeof QuizCatalogSchema>;