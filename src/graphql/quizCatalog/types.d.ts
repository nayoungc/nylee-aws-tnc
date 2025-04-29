// types.ts
export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export interface QuestionItem {
  questionId: string;
  order?: number; // order 추가
  points: number;
}

export interface QuizCatalog {
  quizCatalogId: string;
  title: string;
  description?: string;
  questionItems: QuestionItem[];
  totalPoints: number;
  defaultTimeLimit: number;
  category: string;
  difficulty: Difficulty;
  tags: string[];
  isActive: boolean;
  metadata?: Record<string, any>; // metadata 필드 추가
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  courseId?: string;
  courseName?: string;
}

export interface QuizCatalogInput {
  title: string;
  description?: string;
  questionItems: QuestionItemInput[];
  defaultTimeLimit: number;
  category: string;
  difficulty: Difficulty;
  tags: string[];
  isActive: boolean;
  metadata?: Record<string, any>; // metadata 필드 추가
  courseId?: string;
  courseName?: string;
}

export interface QuestionItemInput {
  questionId: string;
  order?: number; // order 추가
  points: number;
}

export interface UpdateQuizCatalogInput {
  quizCatalogId: string;
  title?: string;
  description?: string;
  questionItems?: QuestionItemInput[];
  defaultTimeLimit?: number;
  category?: string;
  difficulty?: Difficulty;
  tags?: string[];
  isActive?: boolean;
  metadata?: Record<string, any>; // metadata 필드 추가
  courseId?: string;
  courseName?: string;
}

export interface QuizCatalogFilterInput {
  category?: string;
  difficulty?: Difficulty;
  createdBy?: string;
  courseId?: string;
  searchTerm?: string;
  isActive?: boolean;
  tags?: string[]; // tags 필터링 추가
}

export interface QuizCatalogConnection {
  items: QuizCatalog[];
  nextToken?: string;
}

// 퀴즈 유형 추가 (src/models/quizCatalog.ts에서 정의됨)
export type QuizType = 'pre' | 'post';

// 퀴즈 타입 인터페이스 추가
export interface QuizTypeDetails {
  type?: QuizType;
  // 기타 타입 관련 속성 추가 가능
}

// QuizCatalog에 타입 정보를 포함시키려면 아래처럼 확장할 수 있음
export interface QuizCatalogWithType extends QuizCatalog, QuizTypeDetails {}