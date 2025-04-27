// src/models/customer.ts
import { z } from 'zod';

/**
 * 고객 스키마 정의
 * 고객 정보를 검증하고 타입을 정의하는 Zod 스키마
 */
export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  // notes 필드 제거 (백엔드에 존재하지 않음)
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

/**
 * 고객 입력 스키마
 * 고객 생성 시 필요한 필드만 포함하는 스키마
 */
export const CustomerInputSchema = CustomerSchema.omit({
  id: true,
  createdAt: true, 
  updatedAt: true
});

// 타입 추출
export type Customer = z.infer<typeof CustomerSchema>;
export type CustomerInput = z.infer<typeof CustomerInputSchema>;

/**
 * 고객 필터 타입
 * 고객 검색 시 사용되는 필터 옵션
 */
export interface CustomerFilter {
  text?: string;
  toDate?: string;
}

/**
 * GraphQL 필터 타입
 * GraphQL API에서 사용되는 필터 입력 타입
 */
export interface ModelCustomerFilterInput {
  id?: { eq?: string; contains?: string };
  name?: { eq?: string; contains?: string };
  and?: ModelCustomerFilterInput[];
  or?: ModelCustomerFilterInput[];
  not?: ModelCustomerFilterInput;
}

/**
 * 검색 필터 입력 타입
 * 고급 검색 기능을 위한 필터 옵션
 */
export interface SearchableCustomerFilterInput {
  text?: string;
  startDate?: string;
  endDate?: string;
}
