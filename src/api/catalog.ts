// src/api/catalog.ts
import { getDocumentClient, shouldUseMockData } from './auth-provider';
import { CourseCatalog } from './types/catalog';

// 모의 데이터
const mockCourses: CourseCatalog[] = [
  {
    catalogId: "NET-001",
    title: "네트워크 기초 및 보안",
    description: "IT 전문가를 위한 네트워크 기초 및 보안 개념 입문 과정입니다.",
    duration: 6,
    level: "입문",
    createdAt: "2023-06-10T11:15:00Z",
    updatedAt: "2023-09-05T10:45:00Z",
    version: "1.1",
  },
  {
    catalogId: "SEC-001",
    title: "클라우드 보안 전문가",
    description: "AWS 환경에서의 보안 설계, 구현 및 모니터링 방법을 배웁니다.",
    duration: 12,
    level: "고급",
    createdAt: "2023-07-05T15:30:00Z",
    updatedAt: "2023-10-15T14:00:00Z",
    version: "1.3",
    awsCode: "AWS-SEC-S01"
  },
];

// 테이블 이름
const TABLE_NAME = 'Tnc-CourseCatalog';

/**
 * 코스 카탈로그 목록을 가져오는 함수 - Gen 2 스타일
 * (authContext 매개변수 선택적으로 변경)
 */
export const listCourseCatalogs = async (authContext?: any): Promise<any> => {
  // 모의 데이터 모드 확인
  if (shouldUseMockData() || (authContext?.useMockData || authContext?.hasCredentials === false)) {
    console.log('모의 데이터 사용 중 - listCourseCatalogs');
    return { 
      data: mockCourses, // 모의 데이터도 data 속성 안에 배열로 반환
      success: true
    };
  }

  try {
    // Gen 2 스타일로 DynamoDB 클라이언트 생성
    const documentClient = await getDocumentClient();
    
    // DynamoDB 스캔 요청
    const result = await documentClient.scan({
      TableName: TABLE_NAME
    }).promise();

    // 결과가 있으면 반환
    return {
      data: result.Items || [],
      success: true
    };
  } catch (error) {
    console.error('코스 카탈로그 목록 가져오기 실패:', error);
    
    // 오류 발생 시 모의 데이터 반환
    return {
      data: mockCourses,
      success: false,
      error: error
    };
  }
};

/**
 * 특정 코스 카탈로그를 가져오는 함수 - Gen 2 스타일
 * (authContext 매개변수 선택적으로 변경)
 */
export const getCourseCatalog = async (catalogId: string, authContext?: any): Promise<CourseCatalog | null> => {
  // 모의 데이터 모드 확인
  if (shouldUseMockData() || (authContext?.useMockData || authContext?.hasCredentials === false)) {
    console.log('모의 데이터 사용 중 - getCourseCatalog');
    const mockCourse = mockCourses.find(c => c.catalogId === catalogId);
    return mockCourse || null;
  }

  try {
    // Gen 2 스타일로 DynamoDB 클라이언트 생성
    const documentClient = await getDocumentClient();

    // DynamoDB 항목 가져오기 요청
    const result = await documentClient.get({
      TableName: TABLE_NAME,
      Key: { catalogId }
    }).promise();

    // 결과가 있으면 반환
    if (result.Item) {
      return result.Item as CourseCatalog;
    }

    return null;
  } catch (error) {
    console.error(`코스 카탈로그 가져오기 실패 (ID: \${catalogId}):`, error);

    // 오류 시 모의 데이터에서 검색
    const mockCourse = mockCourses.find(c => c.catalogId === catalogId);
    return mockCourse || null;
  }
};