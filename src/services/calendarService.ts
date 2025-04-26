// src/services/api/catalogApi.ts
import { generateClient } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';
import { safelyExtractData } from '@utils/graphql';

// 카탈로그 관련 쿼리와 뮤테이션
import { 
  listCourseCatalogs, 
  getCourseCatalog,
  searchCatalog,
  getCatalogByCategory 
} from '@graphql/catalog/queries';
import { 
  createCourseCatalog, 
  updateCourseCatalog,
  deleteCourseCatalog 
} from '@graphql/catalog/mutations';
import {
  ListCourseCatalogsResult,
  GetCourseCatalogResult,
  SearchCatalogResult,
  GetCatalogByCategoryResult,
  CreateCourseCatalogResult,
  UpdateCourseCatalogResult,
  DeleteCourseCatalogResult,
  CatalogFilterInput
} from '@graphql/catalog';

// 모델과 모의 데이터
import { CatalogFilter, CourseCatalog, CourseCatalogInput } from '@models/catalog';
import { CalendarEvent } from '@models/calendar';  // CalendarEvent 타입 임포트 추가
import { mockCatalogs } from '../mocks/catalogData';
import { mockCalendar } from '../mocks/calendarData';


// Amplify API 클라이언트 생성
const client = generateClient();

// 개발 모드 여부
const DEV_MODE = true;

// // 모의 캘린더 이벤트
// const mockCalendar: CalendarEvent[] = [
//   {
//     id: "event1",
//     title: "AWS 아키텍처 워크샵",
//     date: "2025-05-15",
//     startTime: "10:00",
//     endTime: "16:00",
//     location: "강남 교육센터",
//     instructorId: "inst1",
//     maxAttendees: 20,
//     currentAttendees: 12,
//     tags: ["AWS", "아키텍처"],
//     description: "AWS 서비스를 활용한 확장 가능한 아키텍처 설계 워크샵입니다."
//   },
//   {
//     id: "event2",
//     title: "서버리스 웹 애플리케이션 구축",
//     date: "2025-05-15",
//     startTime: "14:00",
//     endTime: "18:00",
//     location: "온라인 화상 강의",
//     instructorId: "inst2",
//     maxAttendees: 30,
//     currentAttendees: 18,
//     tags: ["서버리스", "Lambda", "API Gateway"],
//     description: "AWS Lambda와 API Gateway를 활용한 서버리스 웹 애플리케이션 구축 방법을 배웁니다."
//   },
//   {
//     id: "event3",
//     title: "AWS 보안 베스트 프랙티스",
//     date: "2025-05-20",
//     startTime: "09:00",
//     endTime: "17:00",
//     location: "역삼 AWS 교육장",
//     instructorId: "inst3",
//     maxAttendees: 25,
//     currentAttendees: 22,
//     tags: ["보안", "IAM", "암호화"],
//     description: "AWS 환경에서의 보안 위협에 대응하고 보안 서비스를 활용해 인프라를 보호하는 방법을 학습합니다."
//   }
// ];

/**
 * 모든 코스 카탈로그 가져오기
 */
export const fetchAllCatalogs = async (): Promise<CourseCatalog[]> => {
  // 개발 모드인 경우 모의 데이터 사용
  if (DEV_MODE) {
    console.log('[DEV_MODE] 모의 카탈로그 데이터 사용 중');
    return Promise.resolve([...mockCatalogs]);
  }

  try {
    const response = await client.graphql({
      query: listCourseCatalogs
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<ListCourseCatalogsResult>(response);
    return data?.listCourseCatalogs?.items || [];
  } catch (error: unknown) {
    console.error('카탈로그 목록 조회 오류:', error);
    throw error;
  }
};

/**
 * ID로 특정 카탈로그 가져오기
 */
export const fetchCatalogById = async (id: string): Promise<CourseCatalog | null> => {
  // 개발 모드인 경우 모의 데이터 사용
  if (DEV_MODE) {
    console.log(`[DEV_MODE] ID \${id}로 모의 카탈로그 조회`);
    const catalog = mockCatalogs.find(c => c.id === id);
    return Promise.resolve(catalog || null);
  }

  try {
    const response = await client.graphql({
      query: getCourseCatalog,
      variables: { id }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<GetCourseCatalogResult>(response);
    return data?.getCourseCatalog || null;
  } catch (error: unknown) {
    console.error(`카탈로그 조회 오류 (ID: \${id}):`, error);
    throw error;
  }
};

/**
 * 필터를 사용하여 카탈로그 검색
 */
export const searchCatalogs = async (filter: CatalogFilter = {}): Promise<CourseCatalog[]> => {
  // 개발 모드인 경우 모의 데이터 필터링
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 필터로 모의 카탈로그 검색: \${JSON.stringify(filter)}`);
    let filteredCatalogs = [...mockCatalogs];
    
    // 레벨 필터링
    if (filter.level) {
      filteredCatalogs = filteredCatalogs.filter(c => c.level === filter.level);
    }
    
    // 카테고리 필터링
    if (filter.category) {
      filteredCatalogs = filteredCatalogs.filter(c => c.category === filter.category);
    }
    
    // 텍스트 검색
    if (filter.text) {
      const searchText = filter.text.toLowerCase();
      filteredCatalogs = filteredCatalogs.filter(c => 
        c.title.toLowerCase().includes(searchText) ||
        (c.description && c.description.toLowerCase().includes(searchText)) ||
        (c.awsCode && c.awsCode.toLowerCase().includes(searchText)) ||
        (c.tags && c.tags.some(tag => tag.toLowerCase().includes(searchText)))
      );
    }
    
    // 태그 필터링
    if (filter.tags && filter.tags.length > 0) {
      filteredCatalogs = filteredCatalogs.filter(c => 
        c.tags && c.tags.some(tag => 
          filter.tags!.includes(tag)
        )
      );
    }
    
    return Promise.resolve(filteredCatalogs);
  }

  try {
    const variables = { filter: filter as CatalogFilterInput };
    const response = await client.graphql({
      query: searchCatalog,
      variables
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<SearchCatalogResult>(response);
    return data?.searchCatalog || [];
  } catch (error: unknown) {
    console.error('카탈로그 검색 오류:', error);
    throw error;
  }
};

/**
 * 카테고리별 카탈로그 조회
 */
export const fetchCatalogsByCategory = async (category: string): Promise<CourseCatalog[]> => {
  // 개발 모드인 경우 모의 데이터 필터링
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 카테고리 "\${category}"로 모의 카탈로그 조회`);
    const filteredCatalogs = mockCatalogs.filter(c => c.category === category);
    return Promise.resolve(filteredCatalogs);
  }

  try {
    const response = await client.graphql({
      query: getCatalogByCategory,
      variables: { category }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<GetCatalogByCategoryResult>(response);
    return data?.getCatalogByCategory || [];
  } catch (error: unknown) {
    console.error(`카테고리별 카탈로그 조회 오류 (\${category}):`, error);
    throw error;
  }
};

/**
 * 새 카탈로그 생성
 */
export const createCatalog = async (input: CourseCatalogInput): Promise<CourseCatalog> => {
  // 개발 모드인 경우 모의 데이터에 추가
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 새 카탈로그 생성: \${input.title}`);
    const newCatalog: CourseCatalog = {
      id: uuidv4(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockCatalogs.push(newCatalog);
    return Promise.resolve({...newCatalog});
  }

  try {
    const response = await client.graphql({
      query: createCourseCatalog,
      variables: { input }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<CreateCourseCatalogResult>(response);
    if (!data?.createCourseCatalog) {
      throw new Error('카탈로그 생성 응답이 유효하지 않습니다');
    }
    
    return data.createCourseCatalog;
  } catch (error: unknown) {
    console.error('카탈로그 생성 오류:', error);
    throw error;
  }
};

/**
 * 카탈로그 수정
 */
export const updateCatalog = async (id: string, input: Partial<CourseCatalogInput>): Promise<CourseCatalog> => {
  // 개발 모드인 경우 모의 데이터 수정
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 카탈로그 수정 ID: \${id}`);
    const index = mockCatalogs.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(`ID가 \${id}인 카탈로그를 찾을 수 없습니다`);
    }
    
    const updatedCatalog = {
      ...mockCatalogs[index],
      ...input,
      updatedAt: new Date().toISOString()
    };
    
    mockCatalogs[index] = updatedCatalog;
    return Promise.resolve({...updatedCatalog});
  }

  try {
    const response = await client.graphql({
      query: updateCourseCatalog,
      variables: { input: { id, ...input } }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<UpdateCourseCatalogResult>(response);
    if (!data?.updateCourseCatalog) {
      throw new Error(`ID가 \${id}인 카탈로그 수정 응답이 유효하지 않습니다`);
    }
    
    return data.updateCourseCatalog;
  } catch (error: unknown) {
    console.error(`카탈로그 수정 오류 (ID: \${id}):`, error);
    throw error;
  }
};

/**
 * 카탈로그 삭제
 */
export const deleteCatalog = async (id: string): Promise<boolean> => {
  // 개발 모드인 경우 모의 데이터에서 삭제
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 카탈로그 삭제 ID: \${id}`);
    const index = mockCatalogs.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(`ID가 \${id}인 카탈로그를 찾을 수 없습니다`);
    }
    
    mockCatalogs.splice(index, 1);
    return Promise.resolve(true);
  }

  try {
    const response = await client.graphql({
      query: deleteCourseCatalog,
      variables: { input: { id } }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<DeleteCourseCatalogResult>(response);
    return !!data?.deleteCourseCatalog?.id;
  } catch (error: unknown) {
    console.error(`카탈로그 삭제 오류 (ID: \${id}):`, error);
    throw error;
  }
};


// ==================== 새로 추가된 캘린더 이벤트 관련 API 함수 ====================

/**
 * 특정 날짜의 이벤트 목록 조회
 */
export const fetchEventsByDate = async (date: string): Promise<CalendarEvent[]> => {
  // 개발 모드인 경우 모의 데이터 필터링
  if (DEV_MODE) {
    console.log(`[DEV_MODE] \${date} 날짜의 이벤트 조회`);  // 템플릿 리터럴 수정
    const events = mockCalendar.filter(event => event.date === date);
    return Promise.resolve([...events]);
  }

  try {
    // 실제 API 요청 구현
    // const response = await client.graphql({
    //   query: getEventsByDate,
    //   variables: { date }
    // });
    
    // 안전하게 데이터 추출
    // const data = safelyExtractData<GetEventsByDateResult>(response);
    // return data?.getEventsByDate || [];
    
    // 실제 API 구현 전 모의 데이터 반환
    return mockCalendar.filter(event => event.date === date);
  } catch (error: unknown) {
    console.error(`날짜별 이벤트 조회 오류 (\${date}):`, error);  // 템플릿 리터럴 수정
    throw error;
  }
};

/**
 * 특정 날짜와 태그에 해당하는 이벤트 목록 조회
 */
export const fetchEventsByDateAndTags = async (date: string, tags: string[]): Promise<CalendarEvent[]> => {
  // 개발 모드인 경우 모의 데이터 필터링
  if (DEV_MODE) {
    console.log(`[DEV_MODE] \${date} 날짜와 태그 \${tags.join(', ')}의 이벤트 조회`);  // 템플릿 리터럴 수정
    const events = mockCalendar.filter(event => 
      event.date === date && 
      event.tags && 
      tags.some(tag => event.tags!.includes(tag))
    );
    return Promise.resolve([...events]);
  }

  try {
    // 실제 API 요청 구현
    // const response = await client.graphql({
    //   query: getEventsByDateAndTags,
    //   variables: { date, tags }
    // });
    
    // 안전하게 데이터 추출
    // const data = safelyExtractData<GetEventsByDateAndTagsResult>(response);
    // return data?.getEventsByDateAndTags || [];
    
    // 실제 API 구현 전 모의 데이터 반환
    return mockCalendar.filter(event => 
      event.date === date && 
      event.tags && 
      tags.some(tag => event.tags!.includes(tag))
    );
  } catch (error: unknown) {
    console.error(`날짜 및 태그별 이벤트 조회 오류 (\${date}, \${tags.join(', ')}):`, error);  // 템플릿 리터럴 수정
    throw error;
  }
};

/**
 * 날짜 범위에 해당하는 이벤트 목록 조회
 */
export const fetchEventsByDateRange = async (startDate: string, endDate: string): Promise<CalendarEvent[]> => {
  // 개발 모드인 경우 모의 데이터 필터링
  if (DEV_MODE) {
    console.log(`[DEV_MODE] \${startDate}부터 \${endDate}까지의 이벤트 조회`);  // 템플릿 리터럴 수정
    const events = mockCalendar.filter(event => {
      const eventDate = new Date(event.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return eventDate >= start && eventDate <= end;
    });
    return Promise.resolve([...events]);
  }

  try {
    // 실제 API 요청 구현
    // const response = await client.graphql({
    //   query: getEventsByDateRange,
    //   variables: { startDate, endDate }
    // });
    
    // 안전하게 데이터 추출
    // const data = safelyExtractData<GetEventsByDateRangeResult>(response);
    // return data?.getEventsByDateRange || [];
    
    // 실제 API 구현 전 모의 데이터 반환
    return mockCalendar.filter(event => {
      const eventDate = new Date(event.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return eventDate >= start && eventDate <= end;
    });
  } catch (error: unknown) {
    console.error(`날짜 범위별 이벤트 조회 오류 (\${startDate}~\${endDate}):`, error);  // 템플릿 리터럴 수정
    throw error;
  }
};

/**
 * 캘린더 이벤트 등록
 */
export const registerForCalendarEvent = async (eventId: string, userId: string): Promise<{ success: boolean; message?: string }> => {
  // 개발 모드인 경우 모의 이벤트 등록
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 사용자 \${userId}가 이벤트 \${eventId}에 등록`);  // 템플릿 리터럴 수정
    const eventIndex = mockCalendar.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      return Promise.resolve({ 
        success: false, 
        message: `이벤트 ID \${eventId}를 찾을 수 없습니다.`  // 템플릿 리터럴 수정
      });
    }
    
    const event = mockCalendar[eventIndex];
    
    // 등록 인원 초과 검사
    if (event.currentAttendees >= event.maxAttendees) {
      return Promise.resolve({ 
        success: false, 
        message: '이벤트가 이미 마감되었습니다. 대기자 명단에 등록하시겠습니까?' 
      });
    }
    
    // 등록 처리
    mockCalendar[eventIndex] = {
      ...event,
      currentAttendees: event.currentAttendees + 1
    };
    
    return Promise.resolve({ 
      success: true, 
      message: '이벤트에 성공적으로 등록되었습니다.' 
    });
  }

  try {
    // 실제 API 요청 구현
    // const response = await client.graphql({
    //   query: registerForEvent,
    //   variables: { eventId, userId }
    // });
    
    // 안전하게 데이터 추출
    // const data = safelyExtractData<RegisterForEventResult>(response);
    // return { 
    //   success: !!data?.registerForEvent?.id,
    //   message: data?.registerForEvent?.message
    // };
    
    // 실제 API 구현 전 모의 응답 반환
    const eventIndex = mockCalendar.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      return { 
        success: false, 
        message: `이벤트 ID \${eventId}를 찾을 수 없습니다.`  // 템플릿 리터럴 수정
      };
    }
    
    const event = mockCalendar[eventIndex];
    
    // 등록 인원 초과 검사
    if (event.currentAttendees >= event.maxAttendees) {
      return { 
        success: false, 
        message: '이벤트가 이미 마감되었습니다. 대기자 명단에 등록하시겠습니까?' 
      };
    }
    
    // 등록 처리 (실제로는 서버에서 처리)
    mockCalendar[eventIndex] = {
      ...event,
      currentAttendees: event.currentAttendees + 1
    };
    
    return { 
      success: true, 
      message: '이벤트에 성공적으로 등록되었습니다.' 
    };
  } catch (error: unknown) {
    console.error(`이벤트 등록 오류 (이벤트ID: \${eventId}, 사용자ID: \${userId}):`, error);  // 템플릿 리터럴 수정
    throw error;
  }
};