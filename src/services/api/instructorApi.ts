// src/services/api/instructorApi.ts
import { generateClient } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';
import { safelyExtractData } from '@/utils/graphql';

// 강사 관련 쿼리와 뮤테이션
import { 
  listInstructors, 
  getInstructor,
  searchInstructors
} from '@/graphql/instructor';
import { 
  createInstructor, 
  updateInstructor,
  changeInstructorStatus
} from '@/graphql/instructor';
import {
  ListInstructorsResult,
  GetInstructorResult,
  SearchInstructorsResult,
  CreateInstructorResult,
  UpdateInstructorResult,
  ChangeInstructorStatusResult,
  InstructorFilterInput
} from '@/graphql/instructor/types';

// 모델과 모의 데이터
import { Instructor, InstructorInput, InstructorFilter } from '@/models/instructor';

// Amplify API 클라이언트 생성
const client = generateClient();

// 개발 모드 여부
const DEV_MODE = true;

// 개발용 모의 강사 데이터
const mockInstructors: Instructor[] = [
  {
    id: '1',
    username: 'john.doe',
    email: 'john.doe@example.com',
    name: '존 도우',
    profile: '10년 경력의 AWS 솔루션스 아키텍트',
    status: 'ACTIVE',
    createdAt: '2025-01-15T08:30:00.000Z',
    updatedAt: '2025-03-20T14:15:00.000Z'
  },
  {
    id: '2',
    username: 'jane.smith',
    email: 'jane.smith@example.com',
    name: '제인 스미스',
    profile: 'AWS 데이터베이스 전문가',
    status: 'ACTIVE',
    createdAt: '2025-02-10T10:45:00.000Z',
    updatedAt: '2025-03-15T09:20:00.000Z'
  },
  {
    id: '3',
    username: 'robert.johnson',
    email: 'robert.johnson@example.com',
    name: '로버트 존슨',
    profile: '클라우드 보안 전문가',
    status: 'INACTIVE',
    createdAt: '2025-01-25T14:30:00.000Z',
    updatedAt: '2025-02-28T11:40:00.000Z'
  },
  {
    id: '4',
    username: 'sarah.lee',
    email: 'sarah.lee@example.com',
    name: '사라 리',
    profile: 'AWS 서버리스 아키텍처 전문가',
    status: 'ACTIVE',
    createdAt: '2025-03-05T09:15:00.000Z',
    updatedAt: '2025-04-01T16:50:00.000Z'
  },
  {
    id: '5',
    username: 'michael.park',
    email: 'michael.park@example.com',
    name: '마이클 박',
    profile: 'DevOps 및 CI/CD 파이프라인 전문가',
    status: 'ACTIVE',
    createdAt: '2025-02-20T13:10:00.000Z',
    updatedAt: '2025-03-25T10:30:00.000Z'
  }
];

/**
 * 모든 강사 가져오기
 */
export const fetchAllInstructors = async (): Promise<Instructor[]> => {
  // 개발 모드인 경우 모의 데이터 사용
  if (DEV_MODE) {
    console.log('[DEV_MODE] 모의 강사 데이터 사용 중');
    return Promise.resolve([...mockInstructors]);
  }

  try {
    const response = await client.graphql({
      query: listInstructors
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<ListInstructorsResult>(response);
    return data?.listInstructors?.items || [];
  } catch (error: unknown) {
    console.error('강사 목록 조회 오류:', error);
    throw error;
  }
};

/**
 * ID로 특정 강사 가져오기
 */
export const fetchInstructorById = async (id: string): Promise<Instructor | null> => {
  // 개발 모드인 경우 모의 데이터 사용
  if (DEV_MODE) {
    console.log(`[DEV_MODE] ID \${id}로 모의 강사 조회`);
    const instructor = mockInstructors.find(i => i.id === id);
    return Promise.resolve(instructor || null);
  }

  try {
    const response = await client.graphql({
      query: getInstructor,
      variables: { id }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<GetInstructorResult>(response);
    return data?.getInstructor || null;
  } catch (error: unknown) {
    console.error(`강사 조회 오류 (ID: \${id}):`, error);
    throw error;
  }
};

/**
 * 필터를 사용하여 강사 검색
 */
export const searchInstructorsList = async (filter: InstructorFilter = {}): Promise<Instructor[]> => {
  // 개발 모드인 경우 모의 데이터 필터링
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 필터로 모의 강사 검색: \${JSON.stringify(filter)}`);
    let filteredInstructors = [...mockInstructors];
    
    // 상태로 필터링
    if (filter.status) {
      filteredInstructors = filteredInstructors.filter(i => i.status === filter.status);
    }
    
    // 텍스트 검색
    if (filter.searchText) {
      const searchText = filter.searchText.toLowerCase();
      filteredInstructors = filteredInstructors.filter(i => 
        i.name.toLowerCase().includes(searchText) ||
        i.username.toLowerCase().includes(searchText) ||
        i.email.toLowerCase().includes(searchText) ||
        (i.profile && i.profile.toLowerCase().includes(searchText))
      );
    }
    
    return Promise.resolve(filteredInstructors);
  }

  try {
    const variables = { filter };
    const response = await client.graphql({
      query: searchInstructors,
      variables
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<SearchInstructorsResult>(response);
    return data?.searchInstructors?.items || [];
  } catch (error: unknown) {
    console.error('강사 검색 오류:', error);
    throw error;
  }
};

/**
 * 새 강사 생성
 */
export const createNewInstructor = async (input: InstructorInput): Promise<Instructor> => {
  // 개발 모드인 경우 모의 데이터에 추가
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 새 강사 생성: \${input.name}`);
    const newInstructor: Instructor = {
      id: uuidv4(),
      username: input.username,
      email: input.email,
      name: input.name,
      profile: input.profile || '',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockInstructors.push(newInstructor);
    return Promise.resolve({...newInstructor});
  }

  try {
    const response = await client.graphql({
      query: createInstructor,
      variables: { input }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<CreateInstructorResult>(response);
    if (!data?.createInstructor) {
      throw new Error('강사 생성 응답이 유효하지 않습니다');
    }
    
    return data.createInstructor;
  } catch (error: unknown) {
    console.error('강사 생성 오류:', error);
    throw error;
  }
};

/**
 * 강사 정보 수정
 */
export const updateInstructorInfo = async (id: string, input: Partial<InstructorInput>): Promise<Instructor> => {
  // 개발 모드인 경우 모의 데이터 수정
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 강사 수정 ID: \${id}`);
    const index = mockInstructors.findIndex(i => i.id === id);
    
    if (index === -1) {
      throw new Error(`ID가 \${id}인 강사를 찾을 수 없습니다`);
    }
    
    const updatedInstructor = {
      ...mockInstructors[index],
      ...input,
      updatedAt: new Date().toISOString()
    };
    
    mockInstructors[index] = updatedInstructor;
    return Promise.resolve({...updatedInstructor});
  }

  try {
    const response = await client.graphql({
      query: updateInstructor,
      variables: { input: { id, ...input } }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<UpdateInstructorResult>(response);
    if (!data?.updateInstructor) {
      throw new Error(`ID가 \${id}인 강사 수정 응답이 유효하지 않습니다`);
    }
    
    return data.updateInstructor;
  } catch (error: unknown) {
    console.error(`강사 수정 오류 (ID: \${id}):`, error);
    throw error;
  }
};

/**
 * 강사 상태 변경
 */
export const changeInstructorStatusById = async (id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<{ id: string; status: string; updatedAt: string }> => {
    // 개발 모드인 경우 모의 데이터 수정
    if (DEV_MODE) {
      console.log(`[DEV_MODE] 강사 상태 변경 ID: \${id}, 상태: \${status}`);
      const index = mockInstructors.findIndex(i => i.id === id);
      
      if (index === -1) {
        throw new Error(`ID가 \${id}인 강사를 찾을 수 없습니다`);
      }
      
      // 현재 시간으로 업데이트 시간 설정
      const updateTime = new Date().toISOString();
      
      mockInstructors[index].status = status;
      mockInstructors[index].updatedAt = updateTime;
      
      return Promise.resolve({
        id,
        status,
        updatedAt: updateTime // 항상 문자열 값 반환 보장
      });
    }
  
    try {
      const response = await client.graphql({
        query: changeInstructorStatus,
        variables: { id, status }
      });
      
      // 안전하게 데이터 추출
      const data = safelyExtractData<ChangeInstructorStatusResult>(response);
      if (!data?.changeInstructorStatus) {
        throw new Error(`ID가 \${id}인 강사 상태 변경 응답이 유효하지 않습니다`);
      }
      
      return data.changeInstructorStatus;
    } catch (error: unknown) {
      console.error(`강사 상태 변경 오류 (ID: \${id}):`, error);
      throw error;
    }
  };