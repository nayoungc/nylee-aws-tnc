// src/models/surveyCatalog.ts
import { z } from 'zod';

/**
 * 질문 유형 열거형
 * @description 백엔드 GraphQL 스키마와 일치하는 설문 문항 타입
 */
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  RATING = 'RATING',
  OPEN_ENDED = 'OPEN_ENDED',
  DROPDOWN = 'DROPDOWN',
  MATRIX = 'MATRIX'
}

/**
 * 배포 옵션 열거형
 */
export enum DeployOption {
  MANUAL = 'MANUAL',
  AUTO = 'AUTO'
}

/**
 * 배포 시점 열거형
 */
export enum DeployTiming {
  BEFORE_COURSE = 'BEFORE_COURSE',
  AFTER_COURSE = 'AFTER_COURSE'
}

/**
 * 질문 옵션 스키마
 */
export const QuestionOptionSchema = z.object({
  value: z.string(),
  label: z.string()
});

/**
 * 질문 옵션 타입
 */
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;

/**
 * 설문조사 문항 스키마
 */
export const QuestionItemSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(QuestionType),
  content: z.string(),
  required: z.boolean(),
  options: z.array(QuestionOptionSchema).optional(),
  order: z.number().optional()
});

/**
 * 설문조사 문항 타입
 */
export type QuestionItem = z.infer<typeof QuestionItemSchema>;

/**
 * 설문조사 카탈로그 스키마
 */
export const SurveyCatalogSchema = z.object({
  surveyCatalogId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  questionItems: z.array(QuestionItemSchema),
  category: z.string(),
  tags: z.array(z.string()),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
  courseId: z.string().optional(),
  courseName: z.string().optional()
});

/**
 * 설문조사 카탈로그 타입
 */
export type SurveyCatalog = z.infer<typeof SurveyCatalogSchema>;

/**
 * 설문조사 카탈로그 입력 스키마
 */
export const SurveyCatalogInputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  tags: z.array(z.string()),
  isActive: z.boolean().optional().default(true),
  metadata: z.record(z.any()).optional(),
  courseId: z.string().optional(),
  courseName: z.string().optional()
});

/**
 * 설문조사 카탈로그 입력 타입
 */
export type SurveyCatalogInput = z.infer<typeof SurveyCatalogInputSchema>;

/**
 * 설문조사 카탈로그 업데이트 입력 스키마
 */
export const UpdateSurveyCatalogInputSchema = z.object({
  surveyCatalogId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  courseId: z.string().optional(),
  courseName: z.string().optional()
});

/**
 * 설문조사 카탈로그 업데이트 입력 타입
 */
export type UpdateSurveyCatalogInput = z.infer<typeof UpdateSurveyCatalogInputSchema>;

/**
 * 설문조사 문항 입력 스키마
 */
export const QuestionItemInputSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(QuestionType),
  content: z.string(),
  required: z.boolean(),
  options: z.array(QuestionOptionSchema).optional(),
  order: z.number().optional()
});

/**
 * 설문조사 문항 입력 타입
 */
export type QuestionItemInput = z.infer<typeof QuestionItemInputSchema>;

/**
 * 설문조사 배포 입력 스키마
 */
export const DeploySurveyInputSchema = z.object({
  surveyCatalogId: z.string(),
  deployOption: z.nativeEnum(DeployOption),
  deployWhen: z.nativeEnum(DeployTiming).optional(),
  startDate: z.string(), // ISO 형식 날짜 문자열
  endDate: z.string(),   // ISO 형식 날짜 문자열
  notifyParticipants: z.boolean().optional(),
  sendReminders: z.boolean().optional(),
  sendReportToAdmin: z.boolean().optional()
});

/**
 * 설문조사 배포 입력 타입
 */
export type DeploySurveyInput = z.infer<typeof DeploySurveyInputSchema>;

/**
 * 설문조사 필터 스키마
 */
export const SurveyCatalogFilterSchema = z.object({
  title: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  courseId: z.string().optional()
});

/**
 * 설문조사 필터 타입
 */
export type SurveyCatalogFilter = z.infer<typeof SurveyCatalogFilterSchema>;