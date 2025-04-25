// app/api/coursesApi.ts
import { Course } from '../types/admin.types'; // 상대 경로로 수정

// Mock 데이터 정의
const MOCK_COURSES: Course[] = [
  {
    id: '1', 
    code: 'AWS-101',
    title: 'AWS 클라우드 기초',
    description: 'AWS 클라우드 서비스의 기본 개념을 배웁니다.',
    category: 'aws-fundamentals',
    duration: 3,
    level: 'beginner',
    prerequisites: []
  },
  {
    id: '2', 
    code: 'AWS-201',
    title: 'AWS 아키텍처 설계',
    description: '클라우드 아키텍처 설계 원칙과 모범 사례',
    category: 'aws-fundamentals',
    duration: 5,
    level: 'intermediate',
    prerequisites: ['AWS-101']
  },
  {
    id: '3', 
    code: 'SEC-101',
    title: 'AWS 보안 기초',
    description: '클라우드 보안 원칙과 모범 사례',
    category: 'security',
    duration: 2,
    level: 'beginner',
    prerequisites: ['AWS-101']
  }
];

// 임시 클라이언트 구현
// const mockClient = {
//   graphql: async ({ query, variables }: any) => {
//     console.log('Mock GraphQL 호출:', { query, variables });
    
//     // 쿼리 타입에 따라 다른 응답 반환
//     if (query.includes('listCourses')) {
//       return {
//         data: {
//           listCourses: {
//             items: MOCK_COURSES
//           }
//         }
//       };
//     }
    
//     if (query.includes('getCourse') && variables?.id) {
//       const course = MOCK_COURSES.find(c => c.id === variables.id);
//       return {
//         data: {
//           getCourse: course || null
//         }
//       };
//     }
    
//     if (query.includes('createCourse') && variables?.input) {
//       const newCourse = {
//         ...variables.input,
//         id: variables.input.id || Math.random().toString(36).substring(2, 11),
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString()
//       };
//       return {
//         data: {
//           createCourse: newCourse
//         }
//       };
//     }
    
//     if (query.includes('updateCourse') && variables?.input?.id) {
//       const updatedCourse = {
//         ...MOCK_COURSES.find(c => c.id === variables.input.id),
//         ...variables.input,
//         updatedAt: new Date().toISOString()
//       };
//       return {
//         data: {
//           updateCourse: updatedCourse
//         }
//       };
//     }
    
//     if (query.includes('deleteCourse') && variables?.input?.id) {
//       return {
//         data: {
//           deleteCourse: { id: variables.input.id }
//         }
//       };
//     }
    
//     throw new Error('Unhandled GraphQL operation');
//   }
// };

// GraphQL 오류를 방지하기 위해 클라이언트는 모의(mock) 객체 사용
// const client = mockClient;

// export const fetchCourses = async (): Promise<Course[]> => {
//   try {
//     // Mock GraphQL 호출
//     const result = await client.graphql({
//       query: 'query ListCourses { listCourses { items { id code title description category duration level prerequisites createdAt updatedAt } } }'
//     });
    
//     return result.data.listCourses.items;
//   } catch (error) {
//     console.error('Error fetching courses:', error);
//     return MOCK_COURSES; // 오류 발생시 Mock 데이터 반환
//   }
// };

// export const fetchCourseById = async (id: string): Promise<Course> => {
//   try {
//     const result = await client.graphql({
//       query: 'query GetCourse(\$id: ID!) { getCourse(id: \$id) { id code title description category duration level prerequisites createdAt updatedAt } }',
//       variables: { id }
//     });
    
//     return result.data.getCourse;
//   } catch (error) {
//     console.error(`Error fetching course with id \${id}:`, error);
//     return MOCK_COURSES.find(course => course.id === id) || MOCK_COURSES[0];
//   }
// };

// export const addCourse = async (course: Course): Promise<Course> => {
//   try {
//     const result = await client.graphql({
//       query: 'mutation CreateCourse(\$input: CreateCourseInput!) { createCourse(input: \$input) { id code title description category duration level prerequisites createdAt updatedAt } }',
//       variables: { input: course }
//     });
    
//     return result.data.createCourse;
//   } catch (error) {
//     console.error('Error creating course:', error);
//     // Mock 응답 반환
//     return {
//       ...course,
//       id: Math.random().toString(36).substring(2, 11),
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString()
//     };
//   }
// };

// export const updateCourse = async (id: string, course: Partial<Course>): Promise<Course> => {
//   try {
//     const input = { id, ...course };
//     const result = await client.graphql({
//       query: 'mutation UpdateCourse(\$input: UpdateCourseInput!) { updateCourse(input: \$input) { id code title description category duration level prerequisites createdAt updatedAt } }',
//       variables: { input }
//     });
    
//     return result.data.updateCourse;
//   } catch (error) {
//     console.error(`Error updating course with id \${id}:`, error);
//     // Mock 응답 반환
//     return {
//       ...MOCK_COURSES.find(c => c.id === id),
//       ...course,
//       id,
//       updatedAt: new Date().toISOString()
//     } as Course;
//   }
// };

// export const deleteCourse = async (id: string): Promise<string> => {
//   try {
//     const result = await client.graphql({
//       query: 'mutation DeleteCourse(\$input: DeleteCourseInput!) { deleteCourse(input: \$input) { id } }',
//       variables: { input: { id } }
//     });
    
//     return result.data.deleteCourse.id;
//   } catch (error) {
//     console.error(`Error deleting course with id \${id}:`, error);
//     return id; // 오류 발생해도 ID 반환
//   }
// };