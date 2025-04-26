// src/services/mocks/calendarData.ts
import { CalendarEvent } from '@models/calendar';

export const mockCalendar: CalendarEvent[] = [
  {
    id: "event1",
    title: "AWS 아키텍처 워크샵",
    date: "2025-05-15",
    startTime: "10:00",
    endTime: "16:00",
    location: "강남 교육센터",
    instructorId: "inst1",
    maxAttendees: 20,
    currentAttendees: 12,
    tags: ["AWS", "아키텍처"],
    description: "AWS 서비스를 활용한 확장 가능한 아키텍처 설계 워크샵입니다."
  },
  {
    id: "event2",
    title: "서버리스 웹 애플리케이션 구축",
    date: "2025-05-15",
    startTime: "14:00",
    endTime: "18:00",
    location: "온라인 화상 강의",
    instructorId: "inst2",
    maxAttendees: 30,
    currentAttendees: 18,
    tags: ["서버리스", "Lambda", "API Gateway"],
    description: "AWS Lambda와 API Gateway를 활용한 서버리스 웹 애플리케이션 구축 방법을 배웁니다."
  },
  {
    id: "event3",
    title: "AWS 보안 베스트 프랙티스",
    date: "2025-05-20",
    startTime: "09:00",
    endTime: "17:00",
    location: "역삼 AWS 교육장",
    instructorId: "inst3",
    maxAttendees: 25,
    currentAttendees: 22,
    tags: ["보안", "IAM", "암호화"],
    description: "AWS 환경에서의 보안 위협에 대응하고 보안 서비스를 활용해 인프라를 보호하는 방법을 학습합니다."
  }
];