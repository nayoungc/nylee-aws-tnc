// src/models/instructor.ts
import { z } from 'zod';

// 강사 스키마 정의 (Cognito UserPool 기반)
export const InstructorSchema = z.object({
  id: z.string(), // Cognito User ID
  username: z.string(),
  email: z.string().email(),
  name: z.string(),
  profile: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// 강사 입력 스키마 수정 - email과 name 필드 포함
export const InstructorInputSchema = InstructorSchema.omit({
  id: true,
  username: true, // 백엔드에 없는 필드이므로 제외
  createdAt: true, 
  updatedAt: true
});

// 타입 추출
export type Instructor = z.infer<typeof InstructorSchema>;
export type InstructorInput = z.infer<typeof InstructorInputSchema>;

// 강사 필터 타입
export interface InstructorFilter {
  specialties?: string[];
  status?: 'ACTIVE' | 'INACTIVE';
  searchText?: string;
}