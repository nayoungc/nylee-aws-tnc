// src/models/courseQuiz.ts
import { z } from 'zod';

/**
 * 코스-퀴즈 연결 스키마
 * 특정 과정에서 사용되는 퀴즈 인스턴스
 */
export const CourseQuizSchema = z.object({
  courseQuizId: z.string(),     // 코스-퀴즈 ID
  courseId: z.string(),         // 코스 ID
  quizCatalogId: z.string(),    // 퀴즈 카탈로그 ID
  quizType: z.enum(['pre', 'post', 'practice', 'final']), // 이 코스에서의 퀴즈 유형
  title: z.string().optional(), // 선택적 커스텀 제목
  description: z.string().optional(), // 선택적 커스텀 설명
  timeLimit: z.number().optional(), // 이 코스에서의 시간 제한
  startDate: z.string().optional(), // 퀴즈 시작 가능 시간
  endDate: z.string().optional(), // 퀴즈 마감 시간
  passingScore: z.number().optional(), // 통과 점수
  weight: z.number().optional(), // 전체 성적에서의 가중치
  maxAttempts: z.number().optional(), // 최대 시도 횟수
  showAnswers: z.boolean().optional(), // 정답 공개 여부
  randomizeQuestions: z.boolean().optional(), // 문항 순서 랜덤화 여부
  isActive: z.boolean().default(true), // 활성화 여부
  createdAt: z.string().optional(), // 생성 일시
  updatedAt: z.string().optional(), // 업데이트 일시
});

export type CourseQuiz = z.infer<typeof CourseQuizSchema>;