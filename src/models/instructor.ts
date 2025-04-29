// src/models/instructor.ts
import { z } from 'zod';

/**
 * 강사 상태 열거형
 */
export enum InstructorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

/**
 * 강사 모델 타입 - 백엔드 GraphQL 스키마에 맞춤
 */
export interface Instructor {
  id: string;
  email: string;
  name: string;
  profile?: string;
  status?: InstructorStatus;
  createdAt?: string;
  updatedAt?: string;
  // 프론트엔드에서만 사용되는 필드
  username?: string; // email에서 파싱하여 사용
}

/**
 * 강사 생성/수정 입력 타입
 */
export interface InstructorInput {
  email: string;
  name: string;
  profile?: string;
  status?: InstructorStatus;
}

/**
 * 강사 필터 타입
 */
export interface InstructorFilter {
  status?: InstructorStatus;
  searchText?: string;
}

// Zod 스키마
export const InstructorSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  profile: z.string().optional(),
  status: z.nativeEnum(InstructorStatus).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  username: z.string().optional()
});

export const InstructorInputSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  profile: z.string().optional(),
  status: z.nativeEnum(InstructorStatus).optional()
});