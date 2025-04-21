import { client } from '../api';

// 목록 조회 쿼리
export const listCourseCatalogs = async (variables?: { 
  limit?: number; 
  nextToken?: string 
}) => {
  return client.queries.listCourseCatalogs(variables || {});
};

// 단일 항목 조회 쿼리
export const getCourseCatalog = async (variables: { 
  id: string; 
  version: string 
}) => {
  return client.queries.getCourseCatalog(variables);
};