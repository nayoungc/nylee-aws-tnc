// src/api/types/course.tsx
export interface Course {
    lmsId: string;            // 파티션 키
    startDate: string;        // 정렬 키
    catalogId: string;        // GSI1 파티션 키
    shareCode?: string;       // GSI2 파티션 키
    instructor?: string;      // GSI3 파티션 키
    customerId: string;       // GSI4 파티션 키
    title: string;
    description?: string;
    duration: number;         // 과정 기간(일 수)
    status: string;           // 예정됨, 진행중, 완료됨 등
    deliveryMethod?: string;  // 온라인/오프라인/혼합
    assessments?: {           // 선택적 평가 요소들을 Map 타입으로 저장
      preQuiz?: string;
      postQuiz?: string;
      preSurvey?: string;
      postSurvey?: string;
      [key: string]: string | undefined;
    };
    createdAt?: string;
    updatedAt?: string;
  }