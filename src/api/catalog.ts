import { DynamoDB } from 'aws-sdk';
import { useAuth, withAuthErrorHandling } from '../contexts/AuthContext';
import { CourseCatalog } from './types/catalog';

// 모의 데이터 (자격 증명 없을 때 사용)
const mockCourses : CourseCatalog[] = [
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
 * 코스 카탈로그 목록을 가져오는 함수
 */
export const listCourseCatalogs = async (authContext: ReturnType<typeof useAuth>): Promise<CourseCatalog[]> => {
  // 모의 데이터 모드 확인
  if (authContext.useMockData || !authContext.hasCredentials) {
    console.log('모의 데이터 사용 중 - listCourseCatalogs');
    return mockCourses;
  }

  try {
    // AWS DynamoDB 서비스 생성
    const dynamoDB = await authContext.createAWSService(DynamoDB.DocumentClient);

    // DynamoDB 스캔 요청
    const result = await withAuthErrorHandling(async () => {
      return dynamoDB.scan({
        TableName: TABLE_NAME
      }).promise();
    }, authContext)();

    // 결과가 있으면 반환
    if (result.Items) {
      return result.Items as CourseCatalog[];
    }

    return [];
  } catch (error) {
    console.error('코스 카탈로그 목록 가져오기 실패:', error);

    // 오류 시 모의 데이터로 대체
    return mockCourses;
  }
};

/**
 * 특정 코스 카탈로그를 가져오는 함수
 */
export const getCourseCatalog = async (
  catalogId: string,
  authContext: ReturnType<typeof useAuth>
): Promise<CourseCatalog | null> => {
  // 모의 데이터 모드 확인
  if (authContext.useMockData || !authContext.hasCredentials) {
    console.log('모의 데이터 사용 중 - getCourseCatalog');
    const mockCourse = mockCourses.find(c => c.catalogId === catalogId);
    return mockCourse || null;
  }

  try {
    // AWS DynamoDB 서비스 생성
    const dynamoDB = await authContext.createAWSService(DynamoDB.DocumentClient);

    // DynamoDB 항목 가져오기 요청
    const result = await withAuthErrorHandling(async () => {
      return dynamoDB.get({
        TableName: TABLE_NAME,
        Key: { catalogId }
      }).promise();
    }, authContext)();

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