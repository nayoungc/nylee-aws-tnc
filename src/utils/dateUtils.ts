// src/utils/dateUtils.ts

/**
 * 날짜를 사용자 친화적인 형식으로 포맷팅합니다.
 * @param date - Date 객체 또는 ISO 문자열
 * @param locale - 사용할 로케일 (기본값: 브라우저 설정)
 * @returns 포맷팅된 문자열
 */
export function formatDate(
    date: Date | string | null | undefined,
    locale?: string,
    options?: Intl.DateTimeFormatOptions
  ): string {
    if (!date) return '-';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // 유효하지 않은 날짜인 경우
    if (isNaN(dateObj.getTime())) {
      return '-';
    }
    
    // 기본 옵션
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    
    return new Intl.DateTimeFormat(
      locale || navigator.language, 
      options || defaultOptions
    ).format(dateObj);
  }
  
  /**
   * 날짜와 시간을 포맷팅합니다.
   * @param dateTime - Date 객체 또는 ISO 문자열
   * @param locale - 사용할 로케일
   * @returns 포맷팅된 문자열
   */
  export function formatDateTime(
    dateTime: Date | string | null | undefined,
    locale?: string
  ): string {
    if (!dateTime) return '-';
    
    return formatDate(dateTime, locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  /**
   * 상대적 시간 표시 (예: "3일 전", "방금 전")
   * @param date - Date 객체 또는 ISO 문자열
   * @param locale - 사용할 로케일
   * @returns 상대적 시간 문자열
   */
  export function formatRelativeTime(
    date: Date | string | null | undefined,
    locale?: string
  ): string {
    if (!date) return '-';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // 유효하지 않은 날짜인 경우
    if (isNaN(dateObj.getTime())) {
      return '-';
    }
    
    const rtf = new Intl.RelativeTimeFormat(locale || navigator.language, { numeric: 'auto' });
    const now = new Date();
    const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000);
    
    // 시간 단위별 처리
    const secondsInMinute = 60;
    const secondsInHour = secondsInMinute * 60;
    const secondsInDay = secondsInHour * 24;
    const secondsInMonth = secondsInDay * 30;
    const secondsInYear = secondsInDay * 365;
    
    if (Math.abs(diffInSeconds) < secondsInMinute) {
      return rtf.format(Math.round(diffInSeconds), 'second');
    } else if (Math.abs(diffInSeconds) < secondsInHour) {
      return rtf.format(Math.round(diffInSeconds / secondsInMinute), 'minute');
    } else if (Math.abs(diffInSeconds) < secondsInDay) {
      return rtf.format(Math.round(diffInSeconds / secondsInHour), 'hour');
    } else if (Math.abs(diffInSeconds) < secondsInMonth) {
      return rtf.format(Math.round(diffInSeconds / secondsInDay), 'day');
    } else if (Math.abs(diffInSeconds) < secondsInYear) {
      return rtf.format(Math.round(diffInSeconds / secondsInMonth), 'month');
    } else {
      return rtf.format(Math.round(diffInSeconds / secondsInYear), 'year');
    }
  }
  
  /**
   * 두 날짜 사이의 일수 계산
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 일수
   */
  export function daysBetween(startDate: Date | string, endDate: Date | string): number {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    // 시간 부분 제거하여 일수만 계산
    const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    
    return Math.floor((utcEnd - utcStart) / (1000 * 60 * 60 * 24));
  }
  
  /**
   * 날짜가 유효한지 확인
   * @param date 확인할 날짜
   * @returns 유효 여부
   */
  export function isValidDate(date: any): boolean {
    if (!date) return false;
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  }