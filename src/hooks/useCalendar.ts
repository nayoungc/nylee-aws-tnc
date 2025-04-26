// src/hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchEventsByDate, 
  fetchEventsByDateAndTags, 
  fetchEventsByDateRange,
  registerForCalendarEvent
} from '@services/calendarService';

// 날짜별 이벤트 훅
export const useEventsByDate = (date: string | null, enabled = true) => {
  return useQuery({
    queryKey: ['events', 'date', date],
    queryFn: () => (date ? fetchEventsByDate(date) : Promise.resolve([])),
    enabled: !!date && enabled,
    staleTime: 1000 * 60 * 5 // 5분
  });
};

// 날짜와 태그로 이벤트 필터링 훅
export const useEventsByDateAndTags = (date: string | null, tags: string[] = [], enabled = true) => {
  return useQuery({
    queryKey: ['events', 'date', date, 'tags', tags],
    queryFn: () => (date ? fetchEventsByDateAndTags(date, tags) : Promise.resolve([])),
    enabled: !!date && enabled
  });
};

// 날짜 범위 이벤트 훅
export const useEventsByDateRange = (startDate: string, endDate: string, enabled = true) => {
  return useQuery({
    queryKey: ['events', 'range', startDate, endDate],
    queryFn: () => fetchEventsByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate && enabled
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
      userEmail: string; 
    }) => registerForCalendarEvent(eventId, userName),
    
    onSuccess: () => {
      // 등록 성공 시 이벤트 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });
};