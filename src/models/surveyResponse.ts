// src/models/surveyResponse.ts
/**
 * 설문조사 응답 모델 정의
 * @description 설문조사 응답 데이터 모델 및 관련 타입 정의
 */

import { z } from 'zod';

/**
 * 설문 응답 상태 열거형
 */
export enum ResponseStatus {
  DRAFT = 'DRAFT',          // 임시 저장
  SUBMITTED = 'SUBMITTED',  // 제출됨
  COMPLETED = 'COMPLETED'   // 완료됨
}

/**
 * 설문 답변 스키마
 */
export const SurveyAnswerSchema = z.object({
  questionId: z.string(),       // 문항 ID
  responseValue: z.union([
    z.string(), 
    z.array(z.string()), 
    z.record(z.string())
  ]), // 다양한 형식의 답변 지원
  metadata: z.record(z.any()).optional() // 추가 메타데이터
});

/**
 * 설문 답변 타입
 */
export type SurveyAnswer = z.infer<typeof SurveyAnswerSchema>;

/**
 * 설문조사 응답 스키마
 */
export const SurveyResponseSchema = z.object({
  responseId: z.string(),       // 응답 ID
  surveyCatalogId: z.string(),  // 설문 템플릿 ID
  surveyInstanceId: z.string(), // 배포된 설문조사 인스턴스 ID
  studentId: z.string(),        // 교육생 ID
  answers: z.array(SurveyAnswerSchema), // 학생 답변
  status: z.nativeEnum(ResponseStatus), // 응답 상태
  startedAt: z.string(),        // 시작 시간
  completedAt: z.string().optional(), // 작성 완료 시간 
  submittedAt: z.string().optional(), // 최종 제출 시간
  completionTime: z.number().optional(), // 소요 시간 (초)
  metadata: z.record(z.any()).optional(), // 추가 메타데이터
  createdAt: z.string(),        // 생성 일시
  updatedAt: z.string()         // 업데이트 일시
});

/**
 * 설문조사 응답 타입
 */
export type SurveyResponse = z.infer<typeof SurveyResponseSchema>;

/**
 * 설문조사 응답 입력 스키마
 */
export const SurveyResponseInputSchema = SurveyResponseSchema.omit({
  responseId: true,
  createdAt: true,
  updatedAt: true
});

/**
 * 설문조사 응답 입력 타입
 */
export type SurveyResponseInput = z.infer<typeof SurveyResponseInputSchema>;

/**
 * 설문조사 응답 업데이트 스키마
 */
export const SurveyResponseUpdateSchema = z.object({
  answers: z.array(SurveyAnswerSchema).optional(),
  status: z.nativeEnum(ResponseStatus).optional(),
  completedAt: z.string().optional(),
  submittedAt: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * 설문조사 응답 업데이트 타입
 */
export type SurveyResponseUpdate = z.infer<typeof SurveyResponseUpdateSchema>;