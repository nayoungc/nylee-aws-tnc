// src/mocks/customerData.ts
import { Instructor } from '@models/instructor';



export const mockInstructors: Instructor[] = [
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
