export * from './catalog';
export * from './courses';
export * from './customers';
export * from './quiz';
export * from './survey';

export interface Assessment {
  id: string;
  type: string;
  title: string;
  questionCount: number;
  status: string;
}

export interface CourseItem {
  id: string;
  title: string;
  description?: string;
  level?: string;
  category?: string;
  version?: string;
}
