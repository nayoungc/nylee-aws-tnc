export interface CourseModule {
  catalogId: string;
  moduleNumber: string;
  moduleId: string;
  title?: string;
  description?: string;
  duration?: string;
  objectives?: string[];
  order?: number;
}
