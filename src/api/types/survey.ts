export interface SurveyQuestion {
    id?: string;
    question: string;
    options: string[];
    type: 'multiple' | 'single' | 'text';
  }
  
  export interface SurveyMeta {
    title: string;
    description: string;
    timeLimit: number;
    isRequired: boolean;
    shuffleQuestions: boolean;
    anonymous: boolean;
  }
  
  export interface Survey {
    id: string;
    title: string;
    courseId: string;
    courseName?: string;
    surveyType: 'pre' | 'post';
    description?: string;
    questions: SurveyQuestion[];
    questionCount: number;
    responseCount: number;
    meta?: SurveyMeta;
    createdAt: string;
    updatedAt?: string;
  }
  
  export interface SurveyInput {
    id?: string;
    courseId: string;
    surveyType: 'pre' | 'post';
    meta: SurveyMeta;
    questions: SurveyQuestion[];
  }
  
  export interface SurveyGenerationResponse {
    questions: SurveyQuestion[];
  }