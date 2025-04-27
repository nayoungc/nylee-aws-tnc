// src/utils/dateUtils.ts
/**
 * 날짜 문자열(YYYY-MM-DD)을 사용자 친화적 형식으로 변환
 * 
 * @param dateString YYYY-MM-DD 형식의 날짜 문자열
 * @returns 포맷된 날짜 문자열(예: 2025년 4월 15일)
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  } catch (error) {
    console.error('날짜 변환 오류:', error);
    return dateString;
  }
};

/**
 * 날짜를 'YYYY-MM-DD' 형식의 문자열로 변환
 * 
 * @param date 날짜 객체
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const toDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * 오늘 날짜를 'YYYY-MM-DD' 형식의 문자열로 반환
 * 
 * @returns 오늘 날짜를 YYYY-MM-DD 형식으로 표현한 문자열
 */
export const getTodayString = (): string => {
  return toDateString(new Date());
};

/**
 * 문자열 형태의 날짜를 Date 객체로 변환
 * 
 * @param dateString YYYY-MM-DD 형식의 날짜 문자열
 * @returns Date 객체
 */
export const toDateObject = (dateString: string): Date => {
  return new Date(dateString);
};
