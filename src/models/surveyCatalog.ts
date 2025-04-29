// src/models/surveyCatalog.ts (Zod 스키마)
import { z } from 'zod';

/**
 * 질문 유형 열거형
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
 * 설문조사 문항 스키마
 */
export const QuestionItemSchema = z.object({
  id: z.string(),               // 문항 ID
  type: z.nativeEnum(QuestionType), // 문항 유형
  content: z.string(),          // 문항 내용
  required: z.boolean(),        // 필수 응답 여부
  options: z.array(QuestionOptionSchema).optional(), // 문항 옵션 (객관식, 평점 등에 사용)
  order: z.number().optional()  // 문항 순서
});

/**
 * 설문조사 카탈로그 스키마
 */
export const SurveyCatalogSchema = z.object({
  surveyCatalogId: z.string(),   // 설문조사 카탈로그 ID
  title: z.string(),            // 설문조사 제목
  description: z.string().optional(), // 설명
  questionItems: z.array(QuestionItemSchema), // 설문 문항들
  category: z.string(),         // 카테고리 
  tags: z.array(z.string()),    // 태그 (검색용)
  isActive: z.boolean().default(true), // 활성 상태
  metadata: z.record(z.any()).optional(), // 추가 메타데이터
  createdAt: z.string(),        // 생성 일시
  updatedAt: z.string(),        // 업데이트 일시
  createdBy: z.string(),        // 작성자 ID
  courseId: z.string().optional(), // 연결된 과정 ID
  courseName: z.string().optional() // 연결된 과정 이름
});

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

export type SurveyCatalog = z.infer<typeof SurveyCatalogSchema>;
export type QuestionItem = z.infer<typeof QuestionItemSchema>;
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;
export type DeploySurveyInput = z.infer<typeof DeploySurveyInputSchema>;