import { generateClient } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';
import { safelyExtractData } from '@/utils/graphql';
import { mockInstructors } from '@/mocks/instructorData';

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
  ModelInstructorFilterInput,
  ApiInstructor
} from '@/graphql/instructor/types';

// 모델과 모의 데이터
import { Instructor, InstructorInput, InstructorFilter } from '@/models/instructor';

// Amplify API 클라이언트 생성
const client = generateClient();

/**
 * 개발 모드 활성화 여부
 * GraphQL 스키마 불일치 문제를 해결하기 위해 모의 데이터 사용
 */
const DEV_MODE = false; // 개발 모드 활성화로 변경

/**
 * 백엔드 응답을 프론트엔드 모델로 변환
 * @param apiInstructor 백엔드에서 반환된 강사 데이터
 * @returns 프론트엔드에서 사용하는 Instructor 타입으로 변환된 데이터
 */
const mapToFrontendModel = (apiInstructor: ApiInstructor): Instructor => {
  return {
    id: apiInstructor.id,
    username: apiInstructor.email.split('@')[0], // username이 없으므로 이메일에서 임시 생성
    email: apiInstructor.email,
    name: apiInstructor.name,
    profile: apiInstructor.profile || '',
    status: apiInstructor.status || 'ACTIVE',
    createdAt: apiInstructor.createdAt,
    updatedAt: apiInstructor.updatedAt
  };
};

/**
 * 모든 강사 가져오기
 * @returns 강사 목록
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
    return (data?.listInstructors?.items || []).map(mapToFrontendModel);
  } catch (error: unknown) {
    console.error('강사 목록 조회 오류:', error);
    // 오류 발생 시 모의 데이터 반환 (개발 환경)
    if (process.env.NODE_ENV !== 'production') {
      console.warn('오류 발생으로 모의 데이터 반환');
      return [...mockInstructors];
    }
    throw error;
  }
};

/**
 * ID로 특정 강사 가져오기
 * @param id 강사 ID
 * @returns 강사 정보 또는 null
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
    return data?.getInstructor ? mapToFrontendModel(data.getInstructor) : null;
  } catch (error: unknown) {
    console.error(`강사 조회 오류 (ID: \${id}):`, error);
    throw error;
  }
};

/**
 * 필터를 사용하여 강사 검색
 * @param filter 검색 필터
 * @returns 검색 조건에 맞는 강사 목록
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
    return (data?.searchInstructors?.items || []).map(mapToFrontendModel);
  } catch (error: unknown) {
    console.error('강사 검색 오류:', error);
    throw error;
  }
};

/**
 * 새 강사 생성
 * @param input 강사 생성 정보
 * @returns 생성된 강사 정보
 */
export const createNewInstructor = async (input: InstructorInput): Promise<Instructor> => {
  // 개발 모드인 경우 모의 데이터에 추가
  if (DEV_MODE) {
    console.log(`[DEV_MODE] 새 강사 생성: \${input.name}`);
    const newInstructor: Instructor = {
      id: uuidv4(),
      username: `user_\${uuidv4().substring(0, 8)}`,
      email: input.email || `instructor_\${uuidv4().substring(0, 8)}@example.com`,
      name: input.name || '새 강사',
      profile: input.profile || '',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockInstructors.push(newInstructor);
    return Promise.resolve({...newInstructor});
  }

  try {
    // username 필드 제거 (백엔드 스키마에 없음)
    const { username, ...apiInput } = input as any;
    
    const response = await client.graphql({
      query: createInstructor,
      variables: { input: apiInput }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<CreateInstructorResult>(response);
    if (!data?.createInstructor) {
      throw new Error('강사 생성 응답이 유효하지 않습니다');
    }
    
    return mapToFrontendModel(data.createInstructor);
  } catch (error: unknown) {
    console.error('강사 생성 오류:', error);
    throw error;
  }
};

/**
 * 강사 정보 수정
 * @param id 강사 ID
 * @param input 수정할 정보
 * @returns 수정된 강사 정보
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
    // username 필드 제거 (백엔드 스키마에 없음)
    const { username, ...apiInput } = input as any;
    
    const response = await client.graphql({
      query: updateInstructor,
      variables: { input: { id, ...apiInput } }
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<UpdateInstructorResult>(response);
    if (!data?.updateInstructor) {
      throw new Error(`ID가 \${id}인 강사 수정 응답이 유효하지 않습니다`);
    }
    
    return mapToFrontendModel(data.updateInstructor);
  } catch (error: unknown) {
    console.error(`강사 수정 오류 (ID: \${id}):`, error);
    throw error;
  }
};

/**
 * 강사 상태 변경
 * @param id 강사 ID
 * @param status 변경할 상태
 * @returns 상태 변경 결과
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
      updatedAt: updateTime
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
