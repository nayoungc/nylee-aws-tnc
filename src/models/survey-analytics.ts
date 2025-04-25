export interface SurveyAnalytic {
  surveyId: string;
  courseId: string;
  updatedAt: string;
  averageRating?: number;
  participationRate?: number;
  positiveResponses?: number;
  negativeResponses?: number;
  keyThemes?: string[];
}
