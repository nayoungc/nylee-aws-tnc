// src/models/Instructor.ts
export interface Instructor {
    id?: string;
    cognitoId?: string;
    name: string;
    email: string;
    phone?: string;
    specialization?: string;
    bio?: string;
    status?: string;
    joinDate?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  