// src/models/quizCatalog.ts
import { z } from 'zod';

/**
 * 퀴즈 유형
 */
export type QuizType = 'pre' | 'post';

/**
 * 퀴즈 문항 항목 스키마
 */
export const QuestionItemSchema = z.object({
  questionId: z.string(),       // 문항 ID (QuestionBank 참조)
  order: z.number(),            // 출제 순서
  points: z.number().optional(), // 문항별 배점 (기본값 오버라이드 가능)
});

/**
 * 퀴즈 카탈로그 스키마 정의
 * 재사용 가능한 퀴즈 템플릿
 */
export const QuizCatalogSchema = z.object({
  quizCatalogId: z.string(),    // 퀴즈 카탈로그 ID
  title: z.string(),            // 퀴즈 제목
  description: z.string().optional(), // 퀴즈 설명
  questionItems: z.array(QuestionItemSchema), // 퀴즈에 포함된 문항 정보
  totalPoints: z.number().optional(), // 총 배점
  defaultTimeLimit: z.number().optional(), // 기본 시간 제한 (분)
  category: z.string().optional(), // 카테고리
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(), // 난이도
  tags: z.array(z.string()).optional(), // 태그 (검색용)
  isActive: z.boolean().default(true), // 활성 상태
  metadata: z.record(z.any()).optional(), // 추가 설정
  createdAt: z.string().optional(), // 생성 일시
  updatedAt: z.string().optional(), // 업데이트 일시
  createdBy: z.string().optional(), // 작성자 ID
});

export type QuizCatalog = z.infer<typeof QuizCatalogSchema>;
export type QuestionItem = z.infer<typeof QuestionItemSchema>;