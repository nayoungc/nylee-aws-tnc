// src/services/api/calendarApi.ts
import { generateClient } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';
import { safelyExtractData } from '@/utils/graphql';

// 캘린더 관련 쿼리와 뮤테이션
import { 
  listCalendars, 
  getCalendar,
  calendarsByDate,
  recentCalendars
} from '@/graphql/calendar';
import { 
  createCalendar, 
  updateCalendar,
  deleteCalendar 
} from '@/graphql/calendar';
import {
  ListCalendarsResult,
  GetCalendarResult,
  CalendarsByDateResult,
  RecentCalendarsResult,
  CreateCalendarResult,
  UpdateCalendarResult,
  DeleteCalendarResult
} from '@/graphql/calendar';

// 모델과 모의 데이터
import { Calendar, CalendarInput } from '@/models/calendar';
import { mockCalendarEvents } from '@/mocks/calendarData';

// Amplify API 클라이언트 생성
const client = generateClient();

// 개발 모드 여부
const DEV_MODE = false;

/**
 * 모든 캘린더 이벤트 가져오기
 */
export const fetchAllCalendars = async (limit = 20, nextToken?: string): Promise<{ items: Calendar[], nextToken?: string }> => {
  // 개발 모드인 경우 모의 데이터 사용
  if (DEV_MODE) {
    console.log('[DEV_MODE] 모의 캘린더 데이터 사용 중');
    return Promise.resolve({ 
      items: [...mockCalendarEvents],
      nextToken: undefined 
    });
  }

  try {
    const response = await client.graphql({
      query: listCalendars,
      variables: { limit, nextToken }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<ListCalendarsResult>(response);
    return {
      items: data?.listCalendars?.items || [],
      nextToken: data?.listCalendars?.nextToken
    };
  } catch (error: unknown) {
    console.error('캘린더 이벤트 목록 조회 오류:', error);
    throw error;
  }
};

/**
 * ID로 특정 캘린더 이벤트 가져오기
 */
export const fetchCalendarById = async (id: string): Promise<Calendar | null> => {
  // 개발 모드인 경우 모의 데이터 사용
  if (DEV_MODE) {
    console.log(`[DEV_MODE] ID \${id}로 모의 캘린더 이벤트 조회`);
    const event = mockCalendarEvents.find(e => e.id === id);
    return Promise.resolve(event || null);
  }

  try {
    const response = await client.graphql({
      query: getCalendar,
      variables: { id }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<GetCalendarResult>(response);
    return data?.getCalendar || null;
  } catch (error: unknown) {
    console.error(`캘린더 이벤트 조회 오류 (ID: \${id}):`, error);
    throw error;
  }
};

/**
 * 특정 날짜의 캘린더 이벤트 가져오기
 */
export const fetchCalendarsByDate = async (date: string, limit = 20, nextToken?: string): Promise<{ items: Calendar[], nextToken?: string }> => {
  // 개발 모드인 경우 모의 데이터 필터링
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 날짜 \${date}로 모의 캘린더 이벤트 조회`);
    const filteredEvents = mockCalendarEvents.filter(e => e.date === date);
    return Promise.resolve({ 
      items: filteredEvents,
      nextToken: undefined 
    });
  }

  try {
    const response = await client.graphql({
      query: calendarsByDate,
      variables: { date, limit, nextToken }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<CalendarsByDateResult>(response);
    return {
      items: data?.calendarsByDate?.items || [],
      nextToken: data?.calendarsByDate?.nextToken
    };
  } catch (error: unknown) {
    console.error(`날짜별 캘린더 이벤트 조회 오류 (날짜: \${date}):`, error);
    throw error;
  }
};

/**
 * 최근 캘린더 이벤트 가져오기 (오늘 이후)
 */
export const fetchRecentCalendars = async (limit = 50): Promise<Calendar[]> => {
  // 개발 모드인 경우 모의 데이터 필터링
  if (DEV_MODE) {
    console.log('[DEV_MODE] 최근 모의 캘린더 이벤트 조회');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filteredEvents = mockCalendarEvents.filter(e => e.date >= today);
    return Promise.resolve(filteredEvents.slice(0, limit));
  }

  try {
    const response = await client.graphql({
      query: recentCalendars,
      variables: { limit }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<RecentCalendarsResult>(response);
    return data?.recentCalendars || [];
  } catch (error: unknown) {
    console.error('최근 캘린더 이벤트 조회 오류:', error);
    throw error;
  }
};

/**
 * 새 캘린더 이벤트 생성
 */
export const createCalendarEvent = async (input: CalendarInput): Promise<Calendar> => {
  // 개발 모드인 경우 모의 데이터에 추가
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 새 캘린더 이벤트 생성: \${input.title}`);
    const newEvent: Calendar = {
      id: uuidv4(),
      ...input,
      currentAttendees: input.currentAttendees || 0,
      createdAt: new Date().toISOString()
    };
    
    mockCalendarEvents.push(newEvent);
    return Promise.resolve({...newEvent});
  }

  try {
    const response = await client.graphql({
      query: createCalendar,
      variables: { input }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<CreateCalendarResult>(response);
    if (!data?.createCalendar) {
      throw new Error('캘린더 이벤트 생성 응답이 유효하지 않습니다');
    }
    
    return data.createCalendar;
  } catch (error: unknown) {
    console.error('캘린더 이벤트 생성 오류:', error);
    throw error;
  }
};

/**
 * 캘린더 이벤트 수정
 */
export const updateCalendarEvent = async (id: string, input: Partial<CalendarInput>): Promise<Calendar> => {
  // 개발 모드인 경우 모의 데이터 수정
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 캘린더 이벤트 수정 ID: \${id}`);
    const index = mockCalendarEvents.findIndex(e => e.id === id);
    
    if (index === -1) {
      throw new Error(`ID가 \${id}인 캘린더 이벤트를 찾을 수 없습니다`);
    }
    
    const updatedEvent = {
      ...mockCalendarEvents[index],
      ...input
    };
    
    mockCalendarEvents[index] = updatedEvent;
    return Promise.resolve({...updatedEvent});
  }

  try {
    const response = await client.graphql({
      query: updateCalendar,
      variables: { input: { id, ...input } }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<UpdateCalendarResult>(response);
    if (!data?.updateCalendar) {
      throw new Error(`ID가 \${id}인 캘린더 이벤트 수정 응답이 유효하지 않습니다`);
    }
    
    return data.updateCalendar;
  } catch (error: unknown) {
    console.error(`캘린더 이벤트 수정 오류 (ID: \${id}):`, error);
    throw error;
  }
};

/**
 * 캘린더 이벤트 삭제
 */
export const deleteCalendarEvent = async (id: string): Promise<{ success: boolean }> => {
  // 개발 모드인 경우 모의 데이터에서 삭제
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 캘린더 이벤트 삭제 ID: \${id}`);
    const index = mockCalendarEvents.findIndex(e => e.id === id);
    
    if (index === -1) {
      throw new Error(`ID가 \${id}인 캘린더 이벤트를 찾을 수 없습니다`);
    }
    
    mockCalendarEvents.splice(index, 1);
    return Promise.resolve({ success: true });
  }

  try {
    const response = await client.graphql({
      query: deleteCalendar,
      variables: { input: { id } }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<DeleteCalendarResult>(response);
    return { success: !!data?.deleteCalendar?.id };
  } catch (error: unknown) {
    console.error(`캘린더 이벤트 삭제 오류 (ID: \${id}):`, error);
    throw error;
  }
};