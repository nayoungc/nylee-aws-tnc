// src/models/questionBank.ts
import { z } from 'zod';

/**
 * 문항 유형
 */
export type QuestionType = 'multipleChoice' | 'trueFalse' | 'essay' | 'matching' | 'coding';

/**
 * 문항 난이도
 */
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

/**
 * 객관식 옵션 스키마
 */
export const OptionSchema = z.object({
  optionId: z.string(),         // 옵션 ID
  content: z.string(),          // 옵션 내용
  isCorrect: z.boolean(),       // 정답 여부
});

/**
 * 문항 저장소 스키마 정의
 */
export const QuestionBankSchema = z.object({
  questionId: z.string(),       // 문항 ID
  content: z.string(),          // 문제 내용
  type: z.enum(['multipleChoice', 'trueFalse', 'essay', 'matching', 'coding']), // 문항 유형
  options: z.array(OptionSchema).optional(), // 객관식 선택지
  correctAnswer: z.union([z.string(), z.array(z.string())]), // 정답
  explanation: z.string().optional(), // 풀이 설명
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(), // 난이도
  tags: z.array(z.string()).optional(), // 분류 태그
  points: z.number().default(1), // 기본 배점
  metadata: z.record(z.any()).optional(), // 추가 메타데이터
  createdAt: z.string().optional(), // 생성 일시
  updatedAt: z.string().optional(), // 업데이트 일시
  createdBy: z.string().optional(), // 작성자 ID
});

export type QuestionBank = z.infer<typeof QuestionBankSchema>;
export type Option = z.infer<typeof OptionSchema>;