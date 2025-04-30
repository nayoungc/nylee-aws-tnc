// src/models/survey.ts
/**
 * 설문조사 인스턴스 관련 모델 타입 정의 - Zod 스키마 활용
 */

import { z } from 'zod';

// 설문조사 상태 스키마
export const InstanceStatusSchema = z.enum([
  'SCHEDULED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED'
]);

// 배포 옵션 스키마
export const DeployOptionSchema = z.enum([
  'IMMEDIATE',
  'SCHEDULED',
  'MANUAL',
  'AUTO'
]);

// 배포 타이밍 스키마
export const DeployTimingSchema = z.enum([
  'BEFORE_COURSE',
  'AFTER_COURSE',
  'DURING_COURSE',
  'CUSTOM'
]);

// 질문 유형 스키마 (통합된 모든 가능한 값 포함)
export const QuestionTypeSchema = z.enum([
  'TEXT',
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'RATING',
  'OPEN_ENDED',
  'DROPDOWN',
  'MATRIX'
]);

// 타입 추출
export type InstanceStatus = z.infer<typeof InstanceStatusSchema>;
export type DeployOption = z.infer<typeof DeployOptionSchema>;
export type DeployTiming = z.infer<typeof DeployTimingSchema>;
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

// 메타데이터 스키마 - 좀더 구체적으로 정의
export const MetadataSchema = z.record(z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.any()),
  z.record(z.any())
]));

// 질문 옵션 스키마 - null 대신 기본값 빈 배열 사용
export const QuestionOptionsSchema = z.array(z.string()).default([]);

// 질문 항목 기본 스키마 - 공통 필드 분리
const BaseQuestionSchema = z.object({
  text: z.string().min(1, { message: "질문 텍스트는 필수입니다" }),
  type: QuestionTypeSchema,
  options: QuestionOptionsSchema,
  required: z.boolean(),
  order: z.number().int().optional(),
  metadata: MetadataSchema.optional()
});

// 질문 항목 스키마
export const QuestionItemSchema = BaseQuestionSchema.extend({
  id: z.string()
});

// 질문 항목 입력 스키마
export const QuestionItemInputSchema = BaseQuestionSchema.extend({
  id: z.string().optional()
});

// 설문조사 기본 스키마 - 공통 필드 분리
const BaseSurveySchema = z.object({
  title: z.string().min(1, { message: "제목은 필수입니다" }),
  description: z.string().optional(),
  status: InstanceStatusSchema,
  deployOption: DeployOptionSchema,
  deployWhen: DeployTimingSchema.optional(),
  startDate: z.string(),
  endDate: z.string(),
  courseId: z.string().optional(),
  courseName: z.string().optional(),
  notifyParticipants: z.boolean().optional(),
  sendReminders: z.boolean().optional(),
  sendReportToAdmin: z.boolean().optional(),
  metadata: MetadataSchema.optional(),
});

// 설문조사 통계 스키마 - 관련 필드 그룹화
const SurveyStatsSchema = z.object({
  totalParticipants: z.number().int().optional(),
  totalResponses: z.number().int().optional(),
  completionRate: z.number().min(0).max(100).optional(),
});

// 설문조사 스키마
export const SurveySchema = BaseSurveySchema.extend({
  instanceId: z.string(),
  surveyCatalogId: z.string(),
  ...SurveyStatsSchema.shape,
  createdAt: z.string(),
  createdBy: z.string(),
  updatedAt: z.string(),
  owner: z.string().optional(),
  questionItems: z.array(QuestionItemSchema)
});

// 설문조사 생성 입력 스키마
export const CreateSurveyInputSchema = BaseSurveySchema.extend({
  surveyCatalogId: z.string(),
  ...SurveyStatsSchema.shape,
  questionItems: z.array(QuestionItemInputSchema)
}).refine(data => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate > startDate;
}, {
  message: "종료일은 시작일보다 이후여야 합니다",
  path: ["endDate"]
});

// 설문조사 업데이트 입력 스키마
export const UpdateSurveyInputSchema = z.object({
  instanceId: z.string(),
  title: z.string().min(1, { message: "제목은 필수입니다" }).optional(),
  description: z.string().optional(),
  status: InstanceStatusSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  ...SurveyStatsSchema.partial().shape,
  notifyParticipants: z.boolean().optional(),
  sendReminders: z.boolean().optional(),
  sendReportToAdmin: z.boolean().optional(),
  metadata: MetadataSchema.optional(),
  questionItems: z.array(QuestionItemInputSchema).optional()
}).refine(data => {
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate > startDate;
  }
  return true;
}, {
  message: "종료일은 시작일보다 이후여야 합니다",
  path: ["endDate"]
});

// 날짜 범위 스키마
const DateRangeSchema = z.object({
  ge: z.string().optional(),
  le: z.string().optional()
});

// 설문조사 필터 스키마
export const SurveyFilterSchema = z.object({
  surveyCatalogId: z.object({ eq: z.string().optional() }).optional(),
  courseId: z.object({ eq: z.string().optional() }).optional(),
  status: z.object({ eq: InstanceStatusSchema.optional() }).optional(),
  startDate: DateRangeSchema.optional(),
  endDate: DateRangeSchema.optional()
}).optional();

// 타입 추출
export type QuestionItem = z.infer<typeof QuestionItemSchema>;
export type QuestionItemInput = z.infer<typeof QuestionItemInputSchema>;
export type Survey = z.infer<typeof SurveySchema>;
export type CreateSurveyInput = z.infer<typeof CreateSurveyInputSchema>;
export type UpdateSurveyInput = z.infer<typeof UpdateSurveyInputSchema>;
export type SurveyFilter = z.infer<typeof SurveyFilterSchema>;

// 설문조사 목록 결과 스키마
export const ListSurveysResultSchema = z.object({
  items: z.array(SurveySchema),
  nextToken: z.string().optional()
});

export type ListSurveysResult = z.infer<typeof ListSurveysResultSchema>;