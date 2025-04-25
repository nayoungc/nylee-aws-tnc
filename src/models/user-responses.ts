export interface UserResponse {
  userId_courseId_quizId: string;
  questionNumber_attemptNumber: string;
  quizId: string;
  questionNumber: string;
  courseId: string;
  isCorrect: string;
  selectedAnswer?: string;
  timeSpent?: number;
  submitTime?: string;
}
