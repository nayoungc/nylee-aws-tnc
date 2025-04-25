export interface CourseQuestion {
  quizId: string;
  questionNumber: string;
  catalogId: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points?: number;
}
