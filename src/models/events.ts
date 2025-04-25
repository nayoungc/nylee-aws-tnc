// src/models/events.ts
export interface Event {
    id: string;
    title: string;
    date: string;
    type: 'lecture' | 'session';
    description: string;
    location: string;
    instructor?: string;
  }
  
  // 샘플 이벤트 데이터
  export const events: Event[] = [
    {
      id: '1',
      title: '자바스크립트 기초',
      date: '2023-11-15T09:00:00',
      type: 'lecture',
      description: '자바스크립트 기초 문법 및 개념 소개',
      location: '온라인 강의실 A',
      instructor: '김교수'
    },
    {
      id: '2',
      title: 'React 실습 세션',
      date: '2023-11-15T14:00:00',
      type: 'session',
      description: 'React 컴포넌트 작성 실습',
      location: '온라인 강의실 B'
    },
    {
      id: '3',
      title: 'AWS 클라우드 개요',
      date: '2023-11-16T10:00:00',
      type: 'lecture',
      description: 'AWS 클라우드 서비스 소개 및 기본 개념',
      location: '온라인 강의실 A',
      instructor: '이교수'
    }
  ];
  // src/models/announcements.ts
  export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    link?: string;
    important?: boolean;
  }
  
  // 샘플 공지사항 데이터
  export const announcements: Announcement[] = [
    {
      id: '1',
      title: '2023년 2학기 개강 안내',
      content: '2023년 2학기가 8월 28일부터 시작됩니다. 모든 학생은 강의 일정을 확인하시기 바랍니다.',
      date: '2023-08-20',
      important: true
    },
    {
      id: '2',
      title: '온라인 강의 접속 방법',
      content: '온라인 강의는 Zoom을 통해 진행됩니다. 강의 링크는 강의 시작 30분 전에 이메일로 발송됩니다.',
      date: '2023-08-25',
      link: 'https://example.com/zoom-guide'
    },
    {
      id: '3',
      title: '중간고사 일정 안내',
      content: '중간고사는 10월 15일부터 10월 20일까지 진행됩니다. 세부 일정은 공지사항을 참고하세요.',
      date: '2023-09-30'
    }
  ];
  // src/models/resources.ts
  export interface Resource {
    id: string;
    title: string;
    description: string;
    category: string;
    uploadDate: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    externalLink?: string;
  }
  
  // 샘플 참고 자료 데이터
  export const resources: Resource[] = [
    {
      id: '1',
      title: '자바스크립트 기초 강의 자료',
      description: '자바스크립트 기초 문법 및 예제 코드',
      category: '강의 자료',
      uploadDate: '2023-08-25',
      fileUrl: '/assets/files/javascript-basics.pdf',
      fileName: 'javascript-basics.pdf',
      fileSize: 2500000
    },
    {
      id: '2',
      title: 'React 튜토리얼',
      description: 'React 시작하기 가이드',
      category: '실습 자료',
      uploadDate: '2023-09-05',
      externalLink: 'https://reactjs.org/tutorial/tutorial.html'
    },
    {
      id: '3',
      title: 'AWS 설명서',
      description: 'AWS 서비스 공식 문서',
      category: '참고 자료',
      uploadDate: '2023-09-10',
      externalLink: 'https://docs.aws.amazon.com'
    },
    {
      id: '4',
      title: '과제 제출 가이드',
      description: '과제 작성 및 제출 방법 안내',
      category: '안내 자료',
      uploadDate: '2023-09-15',
      fileUrl: '/assets/files/assignment-guide.pdf',
      fileName: 'assignment-guide.pdf',
      fileSize: 1200000
    }
  ];