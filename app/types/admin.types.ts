// app/types/admin.types.ts
export interface Course {
  id: string;
  code: string;
  title: string;
  description?: string;
  category: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  specialties: string[];
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  content: string;
  dismissible: boolean;
}
