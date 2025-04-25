// src/models/events.ts
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'lecture' | 'session';
  description: string;
  location: string;
  instructor?: string;
}
  
 // 목업 이벤트 데이터 (2개만 포함)
export const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'AWS 클라우드 아키텍처 기초',
    date: '2023-12-15T10:00:00',
    type: 'lecture',
    description: 'AWS 클라우드 서비스 기초 및 아키텍처 설계 원칙',
    location: '온라인 강의실 A',
    instructor: '김철수 교수'
  },
  {
    id: '2',
    title: 'Amplify 배포 실습',
    date: '2023-12-18T14:30:00',
    type: 'session',
    description: 'AWS Amplify를 활용한 웹 애플리케이션 배포 실습',
    location: '온라인 실습실 B'
  }
];