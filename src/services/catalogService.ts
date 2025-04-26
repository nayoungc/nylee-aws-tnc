// src/services/catalogService.ts
import { generateClient } from 'aws-amplify/data';
import { v4 as uuidv4 } from 'uuid';
import { Schema } from '../../amplify/data/resource';
import { CourseCatalog, CourseCatalogInput } from '@/models/catalog';

// Amplify Gen 2 클라이언트 생성
const client = generateClient<Schema>();

/**
 * 모든 코스 카탈로그 항목을 가져오는 함수
 */
export async function listCatalogs(): Promise<CourseCatalog[]> {
  try {
    const response = await client.models.CourseCatalog.list();
    return (response.data || []) as CourseCatalog[];
  } catch (error) {
    console.error('Failed to list catalogs:', error);
    throw error;
  }
}

/**
 * 특정 ID의 카탈로그 상세 정보를 가져오는 함수
 */
export async function getCatalog(id: string): Promise<CourseCatalog | null> {
  try {
    const response = await client.models.CourseCatalog.get({ id });
    return response.data as CourseCatalog || null;
  } catch (error) {
    console.error(`Failed to get catalog with ID \${id}:`, error);
    throw error;
  }
}

/**
 * 새로운 코스 카탈로그를 생성하는 함수
 */
export async function createCatalog(input: CourseCatalogInput): Promise<CourseCatalog> {
  const timestamp = new Date().toISOString();
  
  // id 필드 사용 (catalogId 대신)
  const newCatalog = {
    id: uuidv4(), // Amplify Gen 2는 id를 PK로 사용
    ...input,
    status: input.status || 'draft',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  try {
    const response = await client.models.CourseCatalog.create(newCatalog);
    return response.data as CourseCatalog;
  } catch (error) {
    console.error('Failed to create catalog:', error);
    throw error;
  }
}

/**
 * 기존 카탈로그를 업데이트하는 함수
 */
export async function updateCatalog(id: string, input: Partial<CourseCatalogInput>): Promise<CourseCatalog> {
  try {
    // 먼저 현재 데이터 가져오기
    const existingCatalog = await getCatalog(id);
    if (!existingCatalog) {
      throw new Error(`Catalog with ID \${id} not found`);
    }
    
    // 중요: id 필드가 포함되어야 함
    const updatedData = {
      id: existingCatalog.id, // 반드시 id를 포함
      ...input,
      updatedAt: new Date().toISOString()
    };
    
    const response = await client.models.CourseCatalog.update(updatedData);
    return response.data as CourseCatalog;
  } catch (error) {
    console.error(`Failed to update catalog with ID \${id}:`, error);
    throw error;
  }
}

/**
 * 카탈로그를 삭제하는 함수
 */
export async function deleteCatalog(id: string): Promise<void> {
  try {
    // id를 사용하여 삭제
    await client.models.CourseCatalog.delete({ id });
  } catch (error) {
    console.error(`Failed to delete catalog with ID \${id}:`, error);
    throw error;
  }
}