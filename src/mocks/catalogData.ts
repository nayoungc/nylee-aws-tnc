// src/mocks/catalogData.ts
import { CourseCatalog } from '@models/catalog';

// 모의 카탈로그 데이터
export const mockCatalogs: CourseCatalog[] = [
  {
    id: '1',
    title: 'AWS Solutions Architect 기초',
    awsCode: 'AWS-SA-100',
    version: '1.0',
    durations: 16,
    level: '입문',
    description: 'AWS 솔루션 아키텍트 자격증 준비를 위한 기초 과정. 이 과정에서는 AWS 클라우드의 핵심 서비스와 아키텍처 설계 원칙을 배우게 됩니다.',
    category: '자격증',
    tags: ['AWS', 'Solutions Architect', '입문', '자격증'],
    prerequisites: [],
    objectives: [
      'AWS 핵심 서비스 이해하기',
      '클라우드 아키텍처 설계 원칙 습득',
      'AWS 솔루션 아키텍트 자격증 시험 준비'
    ],
    status: 'ACTIVE',
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
    level: '중급',
    description: 'Amazon RDS, DynamoDB, ElastiCache 등 AWS 데이터베이스 서비스 실습. 각 서비스의 특징과 사용 사례를 배우고 실제 구현 방법을 실습합니다.',
    category: '데이터베이스',
    tags: ['AWS', 'RDS', 'DynamoDB', '중급', 'Database'],
    prerequisites: ['AWS-SA-100'],
    objectives: [
      'AWS 데이터베이스 서비스 비교 및 선택 방법 이해',
      'RDS 및 DynamoDB 설정 및 관리',
      '데이터베이스 마이그레이션 전략 수립'
    ],
    status: 'ACTIVE',
    createdAt: '2025-03-12T10:15:00.000Z',
    updatedAt: '2025-04-01T09:45:00.000Z',
    createdBy: 'admin@example.com'
  },
  {
    id: '3',
    title: 'AWS Lambda와 서버리스 아키텍처',
    awsCode: 'AWS-SVL-300',
    version: '1.5',
    durations: 12,
    level: '고급',
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
    status: 'DRAFT',
    createdAt: '2025-03-18T15:30:00.000Z',
    updatedAt: '2025-04-02T11:20:00.000Z',
    createdBy: 'admin@example.com'
  },
  {
    id: '4',
    title: 'AWS DevOps 파이프라인 구축',
    awsCode: 'AWS-DEV-400',
    version: '1.0',
    durations: 16,
    level: '고급',
    description: 'AWS CodePipeline, CodeBuild, CodeDeploy를 활용한 CI/CD 파이프라인 구축 방법. 코드 통합부터 배포까지 자동화된 파이프라인을 설계하고 구현합니다.',
    category: 'DevOps',
    tags: ['AWS', 'DevOps', 'CI/CD', '고급', 'CodePipeline'],
    prerequisites: ['AWS-SA-100'],
    objectives: [
      'CI/CD 파이프라인 설계 및 구축',
      'AWS DevOps 도구 활용 방법 습득',
      '자동 테스트 및 배포 전략 수립',
      '안전한 배포 관행 이해'
    ],
    status: 'ACTIVE',
    createdAt: '2025-03-20T09:00:00.000Z',
    updatedAt: '2025-04-03T16:40:00.000Z',
    createdBy: 'admin@example.com'
  },
  {
    id: '5',
    title: 'AWS 보안 및 규정 준수',
    awsCode: 'AWS-SEC-500',
    version: '2.0',
    durations: 12,
    level: '고급',
    description: 'AWS 환경에서의 보안 모범 사례 및 규정 준수 전략. IAM, KMS, Security Hub, GuardDuty 등을 활용한 보안 아키텍처 구성과 모니터링 방법을 배웁니다.',
    category: '보안',
    tags: ['AWS', '보안', '규정 준수', '고급', 'IAM'],
    prerequisites: ['AWS-SA-100'],
    objectives: [
      'AWS 보안 서비스 및 기능 이해',
      '보안 아키텍처 설계 및 구현',
      '규정 준수 요구 사항 충족 방법',
      '보안 사고 대응 전략 수립'
    ],
    status: 'ACTIVE',
    createdAt: '2025-03-25T11:45:00.000Z',
    updatedAt: '2025-04-05T10:30:00.000Z',
    createdBy: 'security-lead@example.com'
  },
  {
    id: '6',
    title: 'AWS 네트워킹 심화',
    awsCode: 'AWS-NET-250',
    version: '1.2',
    durations: 10,
    level: '중급',
    description: 'VPC, Subnet, Route Table, NAT Gateway 등 AWS 네트워킹 서비스 심화 학습. 안전하고 확장 가능한 네트워크 아키텍처 설계 방법을 배웁니다.',
    category: '네트워킹',
    tags: ['AWS', '네트워킹', 'VPC', '중급', 'Transit Gateway'],
    prerequisites: ['AWS-SA-100'],
    objectives: [
      '복잡한 VPC 설계 및 구현',
      'VPC 피어링 및 Transit Gateway 구성',
      '하이브리드 클라우드 네트워킹 전략 수립',
      '네트워크 문제 해결 및 최적화'
    ],
    status: 'ACTIVE',
    createdAt: '2025-03-28T14:15:00.000Z',
    updatedAt: '2025-04-08T09:20:00.000Z',
    createdBy: 'network-lead@example.com'
  },
  {
    id: '7',
    title: 'AWS 비용 최적화 전략',
    awsCode: 'AWS-CST-150',
    version: '1.0',
    durations: 6,
    level: '중급',
    description: 'AWS 환경에서의 비용 최적화 전략 및 도구 활용법. AWS Cost Explorer, Trusted Advisor, Savings Plans 등을 통한 비용 분석 및 절감 방법을 배웁니다.',
    category: '비용 관리',
    tags: ['AWS', '비용 최적화', '중급', 'Cost Explorer', 'Savings Plans'],
    prerequisites: ['AWS-SA-100'],
    objectives: [
      'AWS 비용 구조 이해',
      '비용 최적화 전략 수립',
      '비용 분석 도구 활용 방법 습득',
      '효과적인 리소스 관리 방법'
    ],
    status: 'ARCHIVED',
    createdAt: '2025-02-10T16:30:00.000Z',
    updatedAt: '2025-03-01T11:10:00.000Z',
    createdBy: 'finance@example.com'
  }
];