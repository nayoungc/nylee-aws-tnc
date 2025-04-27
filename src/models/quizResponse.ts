// src/models/quizResponse.ts
import { z } from 'zod';

/**
 * 답변 스키마
 */
export const AnswerSchema = z.object({
  questionId: z.string(),       // 문항 ID
  answer: z.union([z.string(), z.array(z.string())]), // 학생 답변
});

/**
 * 채점된 답변 스키마
 */
export const ScoredAnswerSchema = z.object({
  questionId: z.string(),       // 문항 ID
  score: z.number(),            // 획득 점수
  isCorrect: z.boolean(),       // 정답 여부
  feedback: z.string().optional(), // 개별 피드백
});

/**
 * 퀴즈 응답 스키마
 * 교육생이 제출한 퀴즈 답변
 */
export const QuizResponseSchema = z.object({
  responseId: z.string(),       // 응답 ID
  courseQuizId: z.string(),     // 코스-퀴즈 ID
  studentId: z.string(),        // 교육생 ID
  attempt: z.number().default(1), // 시도 횟수
  answers: z.array(AnswerSchema), // 학생 답변
  score: z.number().optional(), // 총점
  scoredAnswers: z.array(ScoredAnswerSchema).optional(), // 채점된 답변
  submittedAt: z.string(),      // 제출 시간
  completionTime: z.number().optional(), // 소요 시간 (초)
  status: z.enum(['completed', 'incomplete', 'graded']), // 상태
  createdAt: z.string().optional(), // 생성 일시
  updatedAt: z.string().optional(), // 업데이트 일시
});

export type QuizResponse = z.infer<typeof QuizResponseSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type ScoredAnswer = z.infer<typeof ScoredAnswerSchema>;