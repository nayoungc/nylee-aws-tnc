// src/hooks/useCalendar.ts
import { useState, useCallback } from 'react';
import {
  fetchAllCalendars,
  fetchCalendarById,
  fetchCalendarsByDate,
  fetchRecentCalendars,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from '@/services/api/calendarApi';
import { Calendar, CalendarInput } from '@/models/calendar';

/**
 * 캘린더 이벤트 관리를 위한 커스텀 훅
 * 
 * 캘린더 이벤트 조회, 생성, 수정, 삭제 기능을 제공합니다.
 */
export function useCalendar() {
  // 상태 관리
  const [events, setEvents] = useState<Calendar[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Calendar | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);

  /**
   * 모든 캘린더 이벤트 가져오기
   * @param limit 최대 항목 수
   * @param token 다음 페이지 토큰
   */
  const getCalendars = useCallback(async (limit = 20, token?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllCalendars(limit, token);
      setEvents(response.items);
      setNextToken(response.nextToken);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('캘린더 이벤트를 불러오는 중 오류가 발생했습니다.');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 다음 페이지 이벤트 불러오기
   * @param limit 최대 항목 수
   */
  const loadMoreEvents = useCallback(async (limit = 20) => {
    if (!nextToken) return null;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllCalendars(limit, nextToken);
      setEvents(prevEvents => [...prevEvents, ...response.items]);
      setNextToken(response.nextToken);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('다음 페이지를 불러오는 중 오류가 발생했습니다.');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [nextToken]);

  /**
   * 특정 날짜의 이벤트 가져오기
   * @param date YYYY-MM-DD 형식의 날짜
   * @param limit 최대 항목 수
   */
  const getEventsByDate = useCallback(async (date: string, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCalendarsByDate(date, limit);
      setEvents(response.items);
      setNextToken(response.nextToken);
      return response.items;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('날짜별 이벤트를 불러오는 중 오류가 발생했습니다.');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 오늘 이후의 최근 이벤트 가져오기
   * @param limit 최대 항목 수
   */
  const getRecentEvents = useCallback(async (limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const events = await fetchRecentCalendars(limit);
      setEvents(events);
      return events;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('최근 이벤트를 불러오는 중 오류가 발생했습니다.');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 특정 ID의 이벤트 상세 정보 가져오기
   * @param id 이벤트 ID
   */
  const getEventById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const event = await fetchCalendarById(id);
      setSelectedEvent(event);
      return event;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('이벤트 상세 정보를 불러오는 중 오류가 발생했습니다.');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 새 이벤트 생성
   * @param input 이벤트 입력 데이터
   */
  const createEvent = useCallback(async (input: CalendarInput) => {
    setLoading(true);
    setError(null);
    try {
      const newEvent = await createCalendarEvent(input);
      setEvents(prevEvents => [newEvent, ...prevEvents]);
      return newEvent;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('이벤트 생성 중 오류가 발생했습니다.');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 기존 이벤트 수정
   * @param id 수정할 이벤트 ID
   * @param input 수정할 데이터
   */
  const updateEvent = useCallback(async (id: string, input: Partial<CalendarInput>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedEvent = await updateCalendarEvent(id, input);
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === id ? updatedEvent : event
        )
      );
      if (selectedEvent?.id === id) {
        setSelectedEvent(updatedEvent);
      }
      return updatedEvent;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('이벤트 수정 중 오류가 발생했습니다.');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [selectedEvent]);

  /**
   * 이벤트 삭제
   * @param id 삭제할 이벤트 ID
   */
  const deleteEvent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteCalendarEvent(id);
      if (result.success) {
        setEvents(prevEvents => 
          prevEvents.filter(event => event.id !== id)
        );
        if (selectedEvent?.id === id) {
          setSelectedEvent(null);
        }
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('이벤트 삭제 중 오류가 발생했습니다.');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [selectedEvent]);

  /**
   * 오류 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 이벤트 정보를 찾거나 가져오기
   * 로컬 상태에 없는 경우 API 호출
   * @param id 이벤트 ID
   */
  const findOrFetchEvent = useCallback(async (id: string) => {
    // 먼저 현재 events 배열에서 찾기
    const localEvent = events.find(event => event.id === id);
    if (localEvent) {
      setSelectedEvent(localEvent);
      return localEvent;
    }
    
    // 로컬에 없으면 API 호출
    return getEventById(id);
  }, [events, getEventById]);

  return {
    // 상태
    events,
    selectedEvent,
    loading,
    error,
    hasMore: !!nextToken,
    
    // 액션
    getCalendars,
    loadMoreEvents,
    getEventsByDate,
    getRecentEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    clearError,
    findOrFetchEvent
  };
}