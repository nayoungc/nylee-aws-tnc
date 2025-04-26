// src/api/calendar.ts
import { generateClient } from 'aws-amplify/api';
import { schema } from '../../amplify/data/resource';

// 타입 안전한 API 클라이언트
const client = generateClient<typeof schema>();

// 이벤트 조회
export const fetchCourseEvents = async () => {
  const response = await client.models.CourseEvent.list();
  return response.data;
};

// 강사 조회
export const fetchInstructors = async () => {
  const response = await client.models.Instructor.list();
  return response.data;
};

// 장소 조회
export const fetchLocations = async () => {
  const response = await client.models.Location.list();
  return response.data;
};

// 이벤트 생성
export const createCourseEvent = async (event) => {
  const response = await client.models.CourseEvent.create(event);
  return response.data;
};

// 이벤트 업데이트
export const updateCourseEvent = async (event) => {
  const response = await client.models.CourseEvent.update({
    id: event.id,
    ...event
  });
  return response.data;
};

// 이벤트 삭제
export const deleteCourseEvent = async (id: string) => {
  const response = await client.models.CourseEvent.delete({
    id
  });
  return response.data;
};