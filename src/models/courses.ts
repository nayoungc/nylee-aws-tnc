export interface Course {
  courseId: string;
  startDate: string;
  catalogId: string;
  shareCode: string;
  instructor: string;
  customerId: string;
  endDate?: string;
  location?: string;
  maxStudents?: number;
  currentStudents?: number;
  status?: string;
}
