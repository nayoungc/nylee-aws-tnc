// src/graphql/courseSurvey/mutations.ts
/**
 * 코스-설문조사 연결 생성
 */
export const createCourseSurvey = /* GraphQL */ `
  mutation CreateCourseSurvey(\$input: CreateCourseSurveyInput!) {
    createCourseSurvey(input: \$input) {
      courseSurveyId
      courseId
      surveyCatalogId
      title
      description
      startDate
      endDate
      isAnonymous
      isActive
      createdAt
      updatedAt
    }
  }
`;

/**
 * 코스-설문조사 연결 수정
 */
export const updateCourseSurvey = /* GraphQL */ `
  mutation UpdateCourseSurvey(\$input: UpdateCourseSurveyInput!) {
    updateCourseSurvey(input: \$input) {
      courseSurveyId
      courseId
      surveyCatalogId
      title
      description
      startDate
      endDate
      isAnonymous
      isActive
      createdAt
      updatedAt
    }
  }
`;

/**
 * 코스-설문조사 연결 삭제
 */
export const deleteCourseSurvey = /* GraphQL */ `
  mutation DeleteCourseSurvey(\$input: DeleteCourseSurveyInput!) {
    deleteCourseSurvey(input: \$input) {
      courseSurveyId
    }
  }
`;

/**
 * 코스-설문조사 활성화/비활성화
 */
export const activateCourseSurvey = /* GraphQL */ `
  mutation ActivateCourseSurvey(\$courseSurveyId: ID!, \$isActive: Boolean!) {
    activateCourseSurvey(courseSurveyId: \$courseSurveyId, isActive: \$isActive) {
      courseSurveyId
      isActive
    }
  }
`;