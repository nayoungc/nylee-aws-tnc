export interface UserSurvey {
  randomId: string;
  courseId_surveyType_surveyId: string;
  courseId: string;
  surveyType: string;
  surveyId: string;
  completionTime: string;
  feedback?: string;
  rating?: number;
}
