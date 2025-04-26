// src/services/api/eventsApi.ts
// import { generateClient } from 'aws-amplify/api';
// import { 
//   listCalendarEvents, 
//   getCalendarEvent, 
//   getEventsByDate,
//   getEventsByDateRange
// } from '../../graphql/queries';
// import { 
//   createCalendarEvent, 
//   updateCalendarEvent,
//   registerForEvent,
//   cancelRegistration
// } from '../../graphql/mutations';
// import { 
//   CalendarEvent, 
//   EventRegistration, 
//   mapGraphQLEventToModel, 
//   extractDateOnly,
//   EventRegistrationSchema
// } from '../../models/events';

// const client = generateClient();

// /**
//  * 모든 캘린더 이벤트 가져오기
//  */
// export const fetchAllEvents = async (): Promise<CalendarEvent[]> => {
//   try {
//     const result = await client.graphql({
//       query: listCalendarEvents
//     });
    
//     if (!result.data.listCalendarEvents?.items) {
//       return [];
//     }
    
//     return result.data.listCalendarEvents.items.map(mapGraphQLEventToModel);
//   } catch (error) {
//     console.error('Error fetching all events:', error);
//     throw error;
//   }
// };

// /**
//  * 특정 ID의 이벤트 가져오기
//  */
// export const fetchEventById = async (id: string): Promise<CalendarEvent | null> => {
//   try {
//     const result = await client.graphql({
//       query: getCalendarEvent,
//       variables: { id }
//     });
    
//     if (!result.data.getCalendarEvent) {
//       return null;
//     }
    
//     return mapGraphQLEventToModel(result.data.getCalendarEvent);
//   } catch (error) {
//     console.error(`Error fetching event \${id}:`, error);
//     throw error;
//   }
// };

// /**
//  * 특정 날짜의 이벤트 가져오기
//  */
// export const fetchEventsByDate = async (date: string): Promise<CalendarEvent[]> => {
//   try {
//     const dateOnly = date.includes('T') ? extractDateOnly(date) : date;
    
//     const result = await client.graphql({
//       query: getEventsByDate,
//       variables: { date: dateOnly }
//     });
    
//     if (!result.data.getEventsByDate) {
//       return [];
//     }
    
//     return result.data.getEventsByDate.map(mapGraphQLEventToModel);
//   } catch (error) {
//     console.error(`Error fetching events for date \${date}:`, error);
//     throw error;
//   }
// };

// /**
//  * 날짜 범위 내의 이벤트 가져오기 (월별 캘린더 뷰에 유용)
//  */
// export const fetchEventsByDateRange = async (startDate: string, endDate: string): Promise<CalendarEvent[]> => {
//   try {
//     const result = await client.graphql({
//       query: getEventsByDateRange,
//       variables: { startDate, endDate }
//     });
    
//     if (!result.data.getEventsByDateRange) {
//       return [];
//     }
    
//     return result.data.getEventsByDateRange.map(mapGraphQLEventToModel);
//   } catch (error) {
//     console.error(`Error fetching events for date range \${startDate} to \${endDate}:`, error);
//     throw error;
//   }
// };

// /**
//  * 이벤트 생성 (관리자 기능)
//  */
// export const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> => {
//   try {
//     const result = await client.graphql({
//       query: createCalendarEvent,
//       variables: { input: eventData }
//     });
    
//     return mapGraphQLEventToModel(result.data.createCalendarEvent);
//   } catch (error) {
//     console.error('Error creating event:', error);
//     throw error;
//   }
// };

// /**
//  * 이벤트 등록하기
//  */
// export const registerForCalendarEvent = async (
//   eventId: string, 
//   userName: string, 
//   userEmail: string
// ): Promise<EventRegistration> => {
//   try {
//     const result = await client.graphql({
//       query: registerForEvent,
//       variables: { eventId, userName, userEmail }
//     });
    
//     return EventRegistrationSchema.parse(result.data.registerForEvent);
//   } catch (error) {
//     console.error(`Error registering for event \${eventId}:`, error);
//     throw error;
//   }
// };

// /**
//  * 등록 취소하기
//  */
// export const cancelEventRegistration = async (registrationId: string): Promise<boolean> => {
//   try {
//     const result = await client.graphql({
//       query: cancelRegistration,
//       variables: { registrationId }
//     });
    
//     return result.data.cancelRegistration;
//   } catch (error) {
//     console.error(`Error cancelling registration \${registrationId}:`, error);
//     throw error;
//   }
// };

// /**
//  * 특정 날짜에 이벤트가 있는지 확인 (캘린더 마커용)
//  */
// export const checkEventExistsForDate = async (date: string): Promise<boolean> => {
//   try {
//     const events = await fetchEventsByDate(date);
//     return events.length > 0;
//   } catch (error) {
//     console.error(`Error checking events for date \${date}:`, error);
//     return false;
//   }
// };
