// src/graphql/courseSurvey/queries.ts
/**
 * 모든 코스-설문조사 연결 조회
 */
export const listCourseSurveys = /* GraphQL */ `
  query ListCourseSurveys(\$filter: ModelCourseSurveyFilterInput, \$limit: Int, \$nextToken: String) {
    listCourseSurveys(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
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
      nextToken
    }
  }
`;

/**
 * 특정 코스-설문조사 조회
 */
export const getCourseSurvey = /* GraphQL */ `
  query GetCourseSurvey(\$courseSurveyId: ID!) {
    getCourseSurvey(courseSurveyId: \$courseSurveyId) {
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
 * 코스별 설문조사 조회
 */
export const getCourseSurveysByCourseId = /* GraphQL */ `
  query GetCourseSurveysByCourseId(\$courseId: ID!, \$limit: Int, \$nextToken: String) {
    getCourseSurveysByCourseId(courseId: \$courseId, limit: \$limit, nextToken: \$nextToken) {
      items {
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
      nextToken
    }
  }
`;

/**
 * 활성화된 설문조사만 조회
 */
export const getActiveCourseSurveys = /* GraphQL */ `
  query GetActiveCourseSurveys(\$courseId: ID!, \$limit: Int, \$nextToken: String) {
    getActiveCourseSurveys(courseId: \$courseId, limit: \$limit, nextToken: \$nextToken) {
      items {
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
      nextToken
    }
  }
`;