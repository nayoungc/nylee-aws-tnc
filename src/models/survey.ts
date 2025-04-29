// src/models/survey.ts
import { z } from 'zod';
import { DeployOption, DeployTiming } from './surveyCatalog';

/**
 * 설문 인스턴스 상태 열거형
 */
export enum InstanceStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

/**
 * 설문조사 인스턴스 스키마
 * 설문조사 템플릿을 배포했을 때 생성되는 실제 설문조사 인스턴스
 */
export const surveySchema = z.object({
  instanceId: z.string(),
  surveyCatalogId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.nativeEnum(InstanceStatus),
  deployOption: z.nativeEnum(DeployOption),
  deployWhen: z.nativeEnum(DeployTiming).optional(),
  startDate: z.string(),
  endDate: z.string(),
  courseId: z.string().optional(),
  courseName: z.string().optional(),
  totalParticipants: z.number().optional(),
  totalResponses: z.number().optional(),
  completionRate: z.number().optional(),
  notifyParticipants: z.boolean().optional(),
  sendReminders: z.boolean().optional(),
  sendReportToAdmin: z.boolean().optional(),
  createdAt: z.string(),
  createdBy: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.any()).optional()
});

/**
 * 설문조사 인스턴스 타입
 */
export type survey = z.infer<typeof surveySchema>;

/**
 * 설문조사 인스턴스 입력 스키마
 */
export const surveyInputSchema = surveySchema.omit({
  instanceId: true,
  createdAt: true,
  updatedAt: true
});

/**
 * 설문조사 인스턴스 입력 타입
 */
export type surveyInput = z.infer<typeof surveyInputSchema>;