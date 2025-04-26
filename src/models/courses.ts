export interface Course {
  courseId: string;
  startDate: string;
  catalogId: string;
  shareCode: string;
  instructor: string;
  customerId: string;
  durations?: number;
  location?: string;
  attendance?: number;
  status?: string;
}
