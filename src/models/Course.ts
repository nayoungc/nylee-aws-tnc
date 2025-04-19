// src/models/Course.ts
export interface Course {
    id?: string;
    title: string;
    description?: string;
    duration?: number;
    level?: string;
    price?: number;
    category?: string;
    publishedDate?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }