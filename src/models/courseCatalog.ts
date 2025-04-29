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
  order: z.number().optional(), // 출제 순서
  points: z.number(),          // 문항별 배점
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
  totalPoints: z.number(),      // 총 배점 (필수로 변경)
  defaultTimeLimit: z.number(), // 기본 시간 제한 (분) (필수로 변경)
  category: z.string(),         // 카테고리 (필수로 변경)
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']), // 난이도 (필수로 변경)
  tags: z.array(z.string()),   // 태그 (필수로 변경)
  isActive: z.boolean().default(true), // 활성 상태
  metadata: z.record(z.any()).optional(), // 추가 설정
  type: z.enum(['pre', 'post']).optional(), // 퀴즈 유형 추가
  createdAt: z.string(),        // 생성 일시 (필수로 변경)
  updatedAt: z.string(),        // 업데이트 일시 (필수로 변경)
  createdBy: z.string(),        // 작성자 ID (필수로 변경)
  courseId: z.string().optional(), // 연결된 코스 ID
  courseName: z.string().optional(), // 연결된 코스 이름
});

export type QuizCatalog = z.infer<typeof QuizCatalogSchema>;
export type QuestionItem = z.infer<typeof QuestionItemSchema>;