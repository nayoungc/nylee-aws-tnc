// src/models/surveyQuestionBank.ts
/**
 * 설문 질문 은행 관련 모델 정의
 * @description 재사용 가능한 설문 문항을 관리하기 위한 데이터 모델
 */

import { z } from 'zod';
import { QuestionType } from './surveyCatalog';

/**
 * 설문 옵션 스키마
 */
export const SurveyQuestionOptionSchema = z.object({
  value: z.string(),         // 옵션 값 (식별자)
  label: z.string(),         // 옵션 레이블 (표시 텍스트)
});

/**
 * 설문 문항 저장소 스키마 정의
 */
export const SurveyQuestionBankSchema = z.object({
  questionId: z.string(),       // 문항 ID
  content: z.string(),          // 질문 내용
  questionType: z.nativeEnum(QuestionType), // 문항 유형 (surveyCatalog와 일치)
  options: z.array(SurveyQuestionOptionSchema).default([]), // 선택형 질문 옵션
  required: z.boolean().default(false), // 필수 응답 여부
  tags: z.array(z.string()).default([]), // 분류 태그
  courseId: z.string().optional(), // 연관된 교육 과정 ID
  courseName: z.string().optional(), // 연관된 교육 과정명
  moduleId: z.string().optional(), // 연관된 교육 모듈 ID
  moduleName: z.string().optional(), // 연관된 교육 모듈명
  createdAt: z.string(),        // 생성 일시
  updatedAt: z.string(),        // 업데이트 일시
  createdBy: z.string(),        // 작성자 ID
  metadata: z.record(z.any()).optional(), // 추가 메타데이터
});

/**
 * 설문 문항 저장소 타입
 */
export type SurveyQuestionBank = z.infer<typeof SurveyQuestionBankSchema>;

/**
 * 설문 질문 옵션 타입
 */
export type SurveyQuestionOption = z.infer<typeof SurveyQuestionOptionSchema>;

/**
 * 설문 문항 저장소 입력 스키마
 */
export const SurveyQuestionBankInputSchema = SurveyQuestionBankSchema.omit({
  questionId: true,
  createdAt: true,
  updatedAt: true
});

/**
 * 설문 문항 저장소 입력 타입
 */
export type SurveyQuestionBankInput = z.infer<typeof SurveyQuestionBankInputSchema>;

/**
 * 설문 문항 저장소 업데이트 스키마
 */
export const SurveyQuestionBankUpdateSchema = z.object({
  content: z.string().optional(),
  questionType: z.nativeEnum(QuestionType).optional(),
  options: z.array(SurveyQuestionOptionSchema).optional(),
  required: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  courseId: z.string().optional(),
  courseName: z.string().optional(),
  moduleId: z.string().optional(),
  moduleName: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * 설문 문항 저장소 업데이트 타입
 */
export type SurveyQuestionBankUpdate = z.infer<typeof SurveyQuestionBankUpdateSchema>;
