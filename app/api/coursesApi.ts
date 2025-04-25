// app/api/coursesApi.ts
import { generateClient } from 'aws-amplify/api';
// import { listCourses, getCourse } from '@/graphql/queries';
// import { createCourse, updateCourse as updateCourseGQL, deleteCourse as deleteCourseGQL } from '@/graphql/mutations';
// import { Course } from '@app/types/admin.types';

// const client = generateClient();

// export const fetchCourses = async (): Promise<Course[]> => {
//   try {
//     const result = await client.graphql({
//       query: listCourses
//     });
    
//     return result.data.listCourses.items;
//   } catch (error) {
//     console.error('Error fetching courses:', error);
//     throw error;
//   }
// };

// export const fetchCourseById = async (id: string): Promise<Course> => {
//   try {
//     const result = await client.graphql({
//       query: getCourse,
//       variables: { id }
//     });
    
//     return result.data.getCourse;
//   } catch (error) {
//     console.error(`Error fetching course with id \${id}:`, error);
//     throw error;
//   }
// };

// export const addCourse = async (course: Course): Promise<Course> => {
//   try {
//     const result = await client.graphql({
//       query: createCourse,
//       variables: { input: course }
//     });
    
//     return result.data.createCourse;
//   } catch (error) {
//     console.error('Error creating course:', error);
//     throw error;
//   }
// };

// export const updateCourse = async (id: string, course: Partial<Course>): Promise<Course> => {
//   try {
//     const input = { id, ...course };
//     const result = await client.graphql({
//       query: updateCourseGQL,
//       variables: { input }
//     });
    
//     return result.data.updateCourse;
//   } catch (error) {
//     console.error(`Error updating course with id \${id}:`, error);
//     throw error;
//   }
// };

// export const deleteCourse = async (id: string): Promise<string> => {
//   try {
//     const result = await client.graphql({
//       query: deleteCourseGQL,
//       variables: { input: { id } }
//     });
    
//     return result.data.deleteCourse.id;
//   } catch (error) {
//     console.error(`Error deleting course with id \${id}:`, error);
//     throw error;
//   }
// };