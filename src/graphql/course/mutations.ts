// src/graphql/course/mutations.ts

/**
 * 과정 생성
 * @param input - 생성할 과정 정보
 */
export const createCourse = /* GraphQL */ `
  mutation CreateCourse(\$input: CreateCourseInput!) {
    createCourse(input: \$input) {
      courseId
      startDate
      catalogId
      shareCode
      instructor
      customerId
      durations
      location
      attendance
      status
      isAddedToCalendar
      createdAt
      updatedAt
    }
  }
`;

/**
 * 과정 수정
 * @param input - 수정할 과정 정보
 */
export const updateCourse = /* GraphQL */ `
  mutation UpdateCourse(\$input: UpdateCourseInput!) {
    updateCourse(input: \$input) {
      courseId
      startDate
      catalogId
      shareCode
      instructor
      customerId
      durations
      location
      attendance
      status
      isAddedToCalendar
      createdAt
      updatedAt
    }
  }
`;

/**
 * 과정 삭제
 * @param input - 삭제할 과정 ID
 */
export const deleteCourse = /* GraphQL */ `
  mutation DeleteCourse(\$input: DeleteCourseInput!) {
    deleteCourse(input: \$input) {
      courseId
    }
  }
`;

/**
 * 과정 상태 변경
 * @param courseId - 과정 ID
 * @param status - 변경할 상태
 */
export const updateCourseStatus = /* GraphQL */ `
  mutation UpdateCourseStatus(\$courseId: ID!, \$status: CourseStatus!) {
    updateCourseStatus(courseId: \$courseId, status: \$status) {
      courseId
      status
      updatedAt
    }
  }
`;

/**
 * 과정 캘린더 등록 상태 변경
 * @param courseId - 과정 ID
 * @param isAddedToCalendar - 캘린더 등록 여부
 */
export const updateCourseCalendarStatus = /* GraphQL */ `
  mutation UpdateCourseCalendarStatus(\$courseId: ID!, \$isAddedToCalendar: Boolean!) {
    updateCourseCalendarStatus(courseId: \$courseId, isAddedToCalendar: \$isAddedToCalendar) {
      courseId
      isAddedToCalendar
      updatedAt
    }
  }
`;