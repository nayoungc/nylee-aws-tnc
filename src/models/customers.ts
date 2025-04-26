// src/models/customer.ts
import { z } from 'zod';

// 고객 스키마 정의
export const CustomerSchema = z.object({
  customerId: z.string(),
  customerName: z.string(),
  notes: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// 고객 입력 스키마
export const CustomerInputSchema = CustomerSchema.omit({
  customerId: true,
  createdAt: true, 
  updatedAt: true
});

// 타입 추출
export type Customer = z.infer<typeof CustomerSchema>;
export type CustomerInput = z.infer<typeof CustomerInputSchema>;

// 고객 필터 타입
export interface CustomerFilter {
  text?: string;
  organization?: string;
}