// src/models/surveyResponse.ts
import { z } from 'zod';

/**
 * 설문 답변 스키마
 */
export const SurveyAnswerSchema = z.object({
  questionId: z.string(),       // 문항 ID
  answer: z.union([z.string(), z.array(z.string()), z.record(z.string())]), // 학생 답변 (다양한 형식 지원)
});

/**
 * 설문조사 응답 스키마
 * 교육생이 제출한 설문조사 답변
 */
export const SurveyResponseSchema = z.object({
  responseId: z.string(),       // 응답 ID
  courseSurveyId: z.string(),   // 코스-설문조사 ID
  studentId: z.string(),        // 교육생 ID (익명 설문일 경우 랜덤 ID 가능)
  answers: z.array(SurveyAnswerSchema), // 학생 답변
  submittedAt: z.string(),      // 제출 시간
  completionTime: z.number().optional(), // 소요 시간 (초)
  createdAt: z.string().optional(), // 생성 일시
  updatedAt: z.string().optional(), // 업데이트 일시
});

export type SurveyResponse = z.infer<typeof SurveyResponseSchema>;
export type SurveyAnswer = z.infer<typeof SurveyAnswerSchema>;