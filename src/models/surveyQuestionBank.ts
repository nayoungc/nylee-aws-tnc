// src/models/surveyQuestionBank.ts
import { z } from 'zod';

/**
 * 설문 문항 유형
 */
export type SurveyQuestionType = 'multipleChoice' | 'rating' | 'openEnded' | 'dropdown' | 'matrix';

/**
 * 설문 옵션 스키마
 */
export const SurveyOptionSchema = z.object({
  optionId: z.string(),         // 옵션 ID
  content: z.string(),          // 옵션 내용
});

/**
 * 설문 문항 저장소 스키마 정의
 */
export const SurveyQuestionBankSchema = z.object({
  questionId: z.string(),       // 문항 ID
  content: z.string(),          // 질문 내용
  type: z.enum(['multipleChoice', 'rating', 'openEnded', 'dropdown', 'matrix']), // 문항 유형
  options: z.array(SurveyOptionSchema).optional(), // 객관식/레이팅 선택지
  required: z.boolean().default(false), // 필수 응답 여부
  tags: z.array(z.string()).optional(), // 분류 태그
  metadata: z.record(z.any()).optional(), // 추가 메타데이터
  createdAt: z.string().optional(), // 생성 일시
  updatedAt: z.string().optional(), // 업데이트 일시
  createdBy: z.string().optional(), // 작성자 ID
});

export type SurveyQuestionBank = z.infer<typeof SurveyQuestionBankSchema>;
export type SurveyOption = z.infer<typeof SurveyOptionSchema>;