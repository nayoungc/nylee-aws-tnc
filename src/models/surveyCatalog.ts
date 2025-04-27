// src/models/surveyCatalog.ts
import { z } from 'zod';

/**
 * 설문조사 문항 항목 스키마
 */
export const SurveyQuestionItemSchema = z.object({
  questionId: z.string(),       // 문항 ID (SurveyQuestionBank 참조)
  order: z.number(),            // 질문 순서
  required: z.boolean().optional(), // 필수 응답 여부 (기본값 오버라이드)
});

/**
 * 설문조사 카탈로그 스키마 정의
 * 재사용 가능한 설문조사 템플릿
 */
export const SurveyCatalogSchema = z.object({
  surveyCatalogId: z.string(),  // 설문조사 카탈로그 ID
  title: z.string(),            // 설문조사 제목
  description: z.string().optional(), // 설문조사 설명
  questionItems: z.array(SurveyQuestionItemSchema), // 설문에 포함된 질문 정보
  category: z.string().optional(), // 카테고리
  tags: z.array(z.string()).optional(), // 태그 (검색용)
  isActive: z.boolean().default(true), // 활성 상태
  metadata: z.record(z.any()).optional(), // 추가 설정
  createdAt: z.string().optional(), // 생성 일시
  updatedAt: z.string().optional(), // 업데이트 일시
  createdBy: z.string().optional(), // 작성자 ID
});

export type SurveyCatalog = z.infer<typeof SurveyCatalogSchema>;
export type SurveyQuestionItem = z.infer<typeof SurveyQuestionItemSchema>;