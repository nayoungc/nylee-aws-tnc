// src/mocks/catalogData.ts
import { CourseCatalog } from '@/models/catalog'; // 경로 별칭으로 수정

// 모의 카탈로그 데이터
export const mockCourseCatalogs: CourseCatalog[] = [
  // 기존 데이터 유지
  {
    id: '1',
    title: 'AWS Solutions Architect 기초',
    awsCode: 'AWS-SA-100',
    version: '1.0',
    durations: 16,
    level: 'beginner', // 'beginner'로 변경 (enum 값 일관성)
    description: 'AWS 솔루션 아키텍트 자격증 준비를 위한 기초 과정. 이 과정에서는 AWS 클라우드의 핵심 서비스와 아키텍처 설계 원칙을 배우게 됩니다.',
    category: '자격증',
    tags: ['AWS', 'Solutions Architect', '입문', '자격증'],
    prerequisites: [],
    objectives: [
      'AWS 핵심 서비스 이해하기',
      '클라우드 아키텍처 설계 원칙 습득',
      'AWS 솔루션 아키텍트 자격증 시험 준비'
    ],
    createdAt: '2025-03-10T08:30:00.000Z',
    updatedAt: '2025-03-15T14:20:00.000Z',
    createdBy: 'admin@example.com'
  },
  {
    id: '2',
    title: 'AWS 데이터베이스 서비스 실습',
    awsCode: 'AWS-DB-200',
    version: '2.1',
    durations: 8,
    level: 'intermediate', // 'intermediate'로 변경
    description: 'Amazon RDS, DynamoDB, ElastiCache 등 AWS 데이터베이스 서비스 실습. 각 서비스의 특징과 사용 사례를 배우고 실제 구현 방법을 실습합니다.',
    category: '데이터베이스',
    tags: ['AWS', 'RDS', 'DynamoDB', '중급', 'Database'],
    prerequisites: ['AWS-SA-100'],
    objectives: [
      'AWS 데이터베이스 서비스 비교 및 선택 방법 이해',
      'RDS 및 DynamoDB 설정 및 관리',
      '데이터베이스 마이그레이션 전략 수립'
    ],
    createdAt: '2025-03-12T10:15:00.000Z',
    updatedAt: '2025-04-01T09:45:00.000Z',
    createdBy: 'admin@example.com'
  },
  // 나머지 데이터도 level과 status 값을 일관성 있게 수정
  {
    id: '3',
    title: 'AWS Lambda와 서버리스 아키텍처',
    awsCode: 'AWS-SVL-300',
    version: '1.5',
    durations: 12,
    level: 'advanced',
    description: 'AWS Lambda를 활용한 서버리스 애플리케이션 개발 및 배포. API Gateway, DynamoDB, S3와 연계한 완전한 서버리스 아키텍처를 설계하고 구현하는 방법을 배웁니다.',
    category: '서버리스',
    tags: ['AWS', 'Lambda', 'Serverless', '고급', 'API Gateway'],
    prerequisites: ['AWS-SA-100', 'AWS-DB-200'],
    objectives: [
      '서버리스 아키텍처의 장단점 이해',
      'Lambda 함수 작성 및 배포',
      'API Gateway와 Lambda 통합',
      '서버리스 애플리케이션의 모니터링 및 디버깅'
    ],
    createdAt: '2025-03-18T15:30:00.000Z',
    updatedAt: '2025-04-02T11:20:00.000Z',
    createdBy: 'admin@example.com'
  },
];