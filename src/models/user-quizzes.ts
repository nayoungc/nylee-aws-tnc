export interface UserQuiz {
  userId: string;
  courseId_quizType_quizId: string;
  courseId: string;
  quizId: string;
  completionTime: string;
  score?: number;
  passed?: boolean;
  attemptNumber?: number;
  duration?: number;
}
