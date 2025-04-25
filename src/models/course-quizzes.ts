export interface CourseQuiz {
  catalogId: string;
  quizTypeId: string;
  quizType: string;
  moduleId: string;
  quizId: string;
  title?: string;
  description?: string;
  passingScore?: number;
  timeLimit?: number;
}
