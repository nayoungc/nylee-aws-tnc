// src/api/instructorApi.ts
import { generateClient } from 'aws-amplify/api';
import { safelyExtractData } from '@/utils/graphql';

// 강사 관련 쿼리와 뮤테이션
import { 
  listInstructors, 
  getInstructor,
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

// 모델
import { Instructor, InstructorInput, InstructorFilter, InstructorStatus } from '@/models/instructor';

// Amplify API 클라이언트 생성
const client = generateClient();

/**
 * 백엔드 응답을 프론트엔드 모델로 변환
 * @param apiInstructor 백엔드에서 반환된 강사 데이터
 * @returns 프론트엔드에서 사용하는 Instructor 타입으로 변환된 데이터
 */
const mapToFrontendModel = (apiInstructor: ApiInstructor): Instructor => {
  return {
    id: apiInstructor.id,
    email: apiInstructor.email,
    name: apiInstructor.name,
    profile: apiInstructor.profile || '',
    status: apiInstructor.status || InstructorStatus.ACTIVE,
    createdAt: apiInstructor.createdAt,
    updatedAt: apiInstructor.updatedAt,
    username: apiInstructor.email.split('@')[0] // username은 프론트엔드에서 생성
  };
};

/**
 * 필터를 백엔드 API 필터로 변환
 * @param filter 프론트엔드 필터
 * @returns 백엔드 API 필터
 */
const mapToApiFilter = (filter: InstructorFilter): ModelInstructorFilterInput => {
  const apiFilter: ModelInstructorFilterInput = {};
  
  // 상태 필터 적용
  if (filter.status) {
    apiFilter.status = filter.status;
  }
  
  // 검색어 필터 적용
  if (filter.searchText) {
    const searchFilters: ModelInstructorFilterInput[] = [];
    
    // 이름 검색
    searchFilters.push({
      name: { contains: filter.searchText }
    });
    
    // 이메일 검색
    searchFilters.push({
      email: { contains: filter.searchText }
    });
    
    // 프로필 검색
    searchFilters.push({
      profile: { contains: filter.searchText }
    });
    
    // OR 조건으로 필터 적용
    apiFilter.or = searchFilters;
  }
  
  return apiFilter;
};

/**
 * 모든 강사 가져오기
 * @returns 강사 목록
 */
export const fetchAllInstructors = async (): Promise<Instructor[]> => {
  try {
    const response = await client.graphql({
      query: listInstructors
    });
    
    // 안전하게 데이터 추출
    const data = safelyExtractData<ListInstructorsResult>(response);
    return (data?.listInstructors?.items || []).map(mapToFrontendModel);
  } catch (error: unknown) {
    console.error('강사 목록 조회 오류:', error);
    throw error;
  }
};

/**
 * ID로 특정 강사 가져오기
 * @param id 강사 ID
 * @returns 강사 정보 또는 null
 */
export const fetchInstructorById = async (id: string): Promise<Instructor | null> => {
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
  try {
    const apiFilter = mapToApiFilter(filter);
    
    // searchInstructors 대신 listInstructors를 필터와 함께 사용
    const response = await client.graphql({
      query: listInstructors,
      variables: { filter: apiFilter }
    });
    
    // 안전하게 데이터 추출 (여기서 ListInstructorsResult 타입 사용)
    const data = safelyExtractData<ListInstructorsResult>(response);
    return (data?.listInstructors?.items || []).map(mapToFrontendModel);
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
export const changeInstructorStatusById = async (id: string, status: InstructorStatus): Promise<{ id: string; status: string; updatedAt: string }> => {
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