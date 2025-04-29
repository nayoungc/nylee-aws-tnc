// src/graphql/customer/types.ts
import { Customer } from '@/models/customer';

/**
 * GraphQL API에서 반환되는 고객 타입
 * @description 백엔드 스키마와 일치하는 고객 데이터 타입
 */
export interface ApiCustomer {
  id: string;
  customerName: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 고객 연결 타입 (페이지네이션)
 */
export interface CustomerConnection {
  items: ApiCustomer[];
  nextToken?: string | null;
}

/**
 * 고객 목록 쿼리 결과 타입
 */
export interface ListCustomersResult {
  listCustomers: CustomerConnection;
}

/**
 * 단일 고객 조회 쿼리 결과 타입
 */
export interface GetCustomerResult {
  getCustomer: ApiCustomer | null;
}

/**
 * 고객 검색 쿼리 결과 타입
 */
export interface SearchCustomersResult {
  searchCustomers: CustomerConnection;
}

/**
 * 고객 생성 뮤테이션 결과 타입
 */
export interface CreateCustomerResult {
  createCustomer: ApiCustomer;
}

/**
 * 고객 수정 뮤테이션 결과 타입
 */
export interface UpdateCustomerResult {
  updateCustomer: ApiCustomer;
}

/**
 * 고객 삭제 뮤테이션 결과 타입
 */
export interface DeleteCustomerResult {
  deleteCustomer: {
    id: string;
    customerName?: string;
  };
}

/**
 * 고객 검색 필터 타입
 */
export interface CustomerFilterInput {
  text?: string;
  organization?: string;
}