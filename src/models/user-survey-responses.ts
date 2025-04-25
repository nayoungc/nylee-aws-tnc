export interface UserSurveyResponse {
  randomId_courseId_surveyId: string;
  questionNumber: string;
  surveyId: string;
  courseId: string;
  response?: string;
  rating?: number;
  comment?: string;
}
