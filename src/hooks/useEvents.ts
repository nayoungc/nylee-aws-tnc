// src/hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchAllEvents, 
  fetchEventById, 
  fetchEventsByDate,
  fetchEventsByDateRange,
  registerForCalendarEvent,
  cancelEventRegistration
} from '../services/api/eventsApi';
import { CalendarEvent, EventRegistration } from '../models/events';

// 모든 이벤트 훅
export const useEvents = (enabled = true) => {
  return useQuery<CalendarEvent[]>({
    queryKey: ['events'],
    queryFn: fetchAllEvents,
    staleTime: 1000 * 60 * 5, // 5분
    enabled
  });
};

// ID로 이벤트 조회 훅
export const useEventById = (id: string | undefined, enabled = true) => {
  return useQuery<CalendarEvent | null>({
    queryKey: ['event', id],
    queryFn: () => (id ? fetchEventById(id) : Promise.resolve(null)),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

// 날짜별 이벤트 훅
export const useEventsByDate = (date: string | null, enabled = true) => {
  return useQuery<CalendarEvent[]>({
    queryKey: ['events', 'date', date],
    queryFn: () => (date ? fetchEventsByDate(date) : Promise.resolve([])),
    enabled: !!date && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

// 날짜 범위별 이벤트 훅 (월별 캘린더에 유용)
export const useEventsByDateRange = (startDate: string, endDate: string, enabled = true) => {
  return useQuery<CalendarEvent[]>({
    queryKey: ['events', 'dateRange', startDate, endDate],
    queryFn: () => fetchEventsByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

// 이벤트 등록 뮤테이션 훅
export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      eventId, 
      userName, 
      userEmail 
    }: { 
      eventId: string; 
      userName: string; 
      userEmail: string 
    }) => registerForCalendarEvent(eventId, userName, userEmail),
    
    // 등록 성공 시 관련 쿼리 무효화
    onSuccess: (_, variables) => {
      const { eventId } = variables;
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });
};

// 등록 취소 뮤테이션 훅
export const useCancelRegistration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (registrationId: string) => cancelEventRegistration(registrationId),
    
    // 취소 성공 시 관련 쿼리 무효화
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    }
  });
};

// 특정 날짜에 이벤트가 있는지 확인하는 훅 (캘린더 마커에 사용)
export const useHasEventsOnDate = (date: string) => {
  const { data: events } = useEventsByDate(date);
  return events && events.length > 0;
};