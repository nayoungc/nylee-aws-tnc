// src/models/customer.ts
import { z } from 'zod';

/**
 * 고객 스키마 정의
 * @description 백엔드 GraphQL 스키마와 일치하는 고객 모델 정의
 */
export const CustomerSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

/**
 * 고객 입력 스키마
 * @description 고객 생성 및 수정에 사용되는 입력 스키마
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
 * @description 백엔드 CustomerFilterInput과 일치하는 필터 정의
 */
export interface CustomerFilter {
  text?: string;
  organization?: string;
}

/**
 * GraphQL 필터 타입
 * @description GraphQL API에서 사용되는 필터 입력 타입
 */
export interface ModelCustomerFilterInput {
  id?: { eq?: string; contains?: string };
  customerName?: { eq?: string; contains?: string };
  notes?: { eq?: string; contains?: string };
  and?: ModelCustomerFilterInput[];
  or?: ModelCustomerFilterInput[];
  not?: ModelCustomerFilterInput;
}