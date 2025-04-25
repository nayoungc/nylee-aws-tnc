// src/services/catalogService.ts
// src/services/catalogService.ts
import { generateClient } from 'aws-amplify/api';
import { CourseCatalog } from '@models/catalog';

// API 클라이언트 생성
const client = generateClient();

// 응답 데이터 타입 정의
interface ListCourseCatalogsResponse {
  listCourseCatalogs: {
    items: CourseCatalog[];
  };
}

interface GetCourseCatalogResponse {
  getCourseCatalog: CourseCatalog;
}

// 모든 과정 카탈로그 가져오기
export async function fetchCourseCatalogs(): Promise<CourseCatalog[]> {
  try {
    const response = await client.graphql({
      query: `
        query ListCourseCatalogs {
          listCourseCatalogs {
            items {
              catalogId
              title
              version
              awsCode
              description
              hours
              level
              createdAt
              updatedAt
            }
          }
        }
      `
    });
    
    // 타입 단언을 사용하여 응답 처리
    const typedResponse = response as { data: ListCourseCatalogsResponse };
    return typedResponse.data.listCourseCatalogs.items;
  } catch (error) {
    console.error('Error fetching course catalogs:', error);
    return getMockCatalogs();
  }
}

// 카탈로그 아이디로 과정 카탈로그 상세 정보 가져오기
export async function fetchCourseCatalogById(catalogId: string): Promise<CourseCatalog | null> {
  try {
    const response = await client.graphql({
      query: `
        query GetCourseCatalog(\$catalogId: ID!) {
          getCourseCatalog(catalogId: \$catalogId) {
            catalogId
            title
            version
            awsCode
            description
            hours
            level
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        catalogId
      }
    });
    
    // 타입 단언을 사용하여 응답 처리
    const typedResponse = response as { data: GetCourseCatalogResponse };
    return typedResponse.data.getCourseCatalog;
  } catch (error) {
    console.error('Error fetching course catalog:', error);
    return null;
  }
}

// 임시 데이터 생성 (API 연동 전 사용)
function getMockCatalogs(): CourseCatalog[] {
  return [
    {
      catalogId: 'cat-001',
      title: 'AWS 클라우드 기초',
      version: '1.0',
      awsCode: 'AWS-CF-100',
      description: 'AWS 클라우드의 기본 개념과 서비스에 대한 소개 과정입니다.',
      hours: 8,
      level: '입문',
      createdAt: '2023-01-15T09:00:00Z',
      updatedAt: '2023-06-20T14:30:00Z'
    },
    {
      catalogId: 'cat-002',
      title: 'Amazon EC2 마스터하기',
      version: '2.1',
      awsCode: 'AWS-EC2-200',
      description: 'EC2 인스턴스 관리, 오토스케일링, 로드 밸런싱에 대해 배웁니다.',
      hours: 16,
      level: '중급',
      createdAt: '2023-02-10T10:15:00Z',
      updatedAt: '2023-07-05T11:20:00Z'
    },
    {
      catalogId: 'cat-003',
      title: 'AWS 데이터베이스 서비스',
      version: '1.5',
      awsCode: 'AWS-DB-300',
      description: 'RDS, DynamoDB, ElastiCache 등 AWS 데이터베이스 서비스 활용법을 배웁니다.',
      hours: 24,
      level: '중급',
      createdAt: '2023-03-05T08:45:00Z',
      updatedAt: '2023-08-18T16:00:00Z'
    },
    {
      catalogId: 'cat-004',
      title: 'AWS 보안 전문가',
      version: '3.0',
      awsCode: 'AWS-SEC-400',
      description: 'AWS 클라우드 환경에서의 보안 모범 사례와 도구 사용법을 배웁니다.',
      hours: 32,
      level: '고급',
      createdAt: '2023-04-20T13:30:00Z',
      updatedAt: '2023-09-10T09:45:00Z'
    },
    {
      catalogId: 'cat-005',
      title: 'AWS 네트워킹 심화',
      version: '2.2',
      awsCode: 'AWS-NET-350',
      description: 'VPC, 서브넷, 라우팅, VPN, Direct Connect 등 AWS 네트워킹에 대해 배웁니다.',
      hours: 24,
      level: '고급',
      createdAt: '2023-05-12T11:00:00Z',
      updatedAt: '2023-10-05T15:15:00Z'
    }
  ];
}