// src/models/CourseCatalog.ts
export interface CourseCatalog {
  id?: string;
  course_name: string;
  level?: string;
  duration?: string;
  delivery_method?: string;
  description?: string;
  objectives?: string[];
  target_audience?: string[];
  createdAt?: string;
  updatedAt?: string;
}