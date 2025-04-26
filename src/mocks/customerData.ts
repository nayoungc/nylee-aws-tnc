// src/mocks/customerData.ts
import { Customer } from '@models/customers';

export const mockCustomers: Customer[] = [
  {
    customerId: '1',
    customerName: '삼성전자',
    notes: '대기업 교육 계약',
    createdAt: '2025-01-10T09:00:00.000Z',
    updatedAt: '2025-01-15T14:30:00.000Z'
  },
  {
    customerId: '2',
    customerName: '네이버',
    notes: '클라우드 교육 진행중',
    createdAt: '2025-01-12T10:15:00.000Z',
    updatedAt: '2025-01-20T11:45:00.000Z'
  },
  {
    customerId: '3',
    customerName: '스타트업 허브',
    notes: '스타트업 대상 AWS 교육',
    createdAt: '2025-01-18T13:30:00.000Z',
    updatedAt: '2025-01-25T09:20:00.000Z'
  },
  {
    customerId: '4',
    customerName: '서울대학교',
    notes: '학생 대상 클라우드 컴퓨팅 교육',
    createdAt: '2025-01-20T08:45:00.000Z',
    updatedAt: '2025-01-28T16:10:00.000Z'
  },
  {
    customerId: '5',
    customerName: 'ABC 중소기업',
    notes: '클라우드 마이그레이션 교육',
    createdAt: '2025-01-22T14:20:00.000Z',
    updatedAt: '2025-01-30T10:05:00.000Z'
  }
];