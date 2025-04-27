// src/models/surveyCatalog.ts
import { z } from 'zod';

/**
 * 설문조사 카탈로그 스키마 정의
 * 재사용 가능한 설문조사 템플릿
 */
export const SurveyCatalogSchema = z.object({
  surveyCatalogId: z.string(),      // 설문조사 카탈로그 ID
  title: z.string(),                // 설문조사 제목
  description: z.string().optional(), // 설문조사 설명
  questions: z.array(z.any()),      // 질문 목록 (상세 구조는 필요에 따라 정의)
  tags: z.array(z.string()).optional(), // 태그 (검색용)
  createdAt: z.string().optional(), // 생성 일시
  updatedAt: z.string().optional()  // 업데이트 일시
});

export type SurveyCatalog = z.infer<typeof SurveyCatalogSchema>;