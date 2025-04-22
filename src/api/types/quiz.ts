export interface Question {
    id?: string;
    question: string;
    options: string[];
    correctAnswer: string | number;
    explanation?: string;
    difficulty?: string;
    tags?: string[];
    quality?: number;
  }
  
  export interface Quiz {
    id: string;
    courseId: string;
    courseName?: string;
    quizType: 'pre' | 'post';
    title: string;
    description?: string;
    timeLimit?: number;
    passScore?: number;
    status?: string;  // 속성 추가
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showFeedback?: boolean;
    questions?: Question[];
    questionCount?: number;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export type QuizParams = {
    courseId: string;
    quizType: 'pre' | 'post';
    modelType: 'basic' | 'advanced';
    questionCount: number;
    contextPrompt?: string;
  };