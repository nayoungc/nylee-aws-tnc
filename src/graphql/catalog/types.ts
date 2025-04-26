// src/graphql/catalog/types.ts
import { BaseRecord } from '../common/types';
import { CourseCatalogStatus, CourseCatalog } from '@models/catalog';

export interface ListCourseCatalogsResult {
  listCourseCatalogs: {
    items: CourseCatalog[];
    nextToken?: string;
  };
}

export interface GetCourseCatalogResult {
  getCourseCatalog: CourseCatalog | null;
}

export interface SearchCourseCatalogResult {
  searchCatalog: CourseCatalog[];
}

export interface GetCourseCatalogByCategoryResult{
  getCatalogByCategory: CourseCatalog[];
}

export interface GetCourseCatalogByLevelResult {
  getCatalogByLevel: CourseCatalog[];
}

export interface GetCourseCatalogsByTagResult {
  getCatalogsByTag: CourseCatalog[];
}

export interface GetRecentlyUpdatedCourseCatalogsResult {
  getRecentlyUpdatedCatalogs: CourseCatalog[];
}

export interface CreateCourseCatalogResult {
  createCourseCatalog: CourseCatalog;
}

export interface UpdateCourseCatalogResult {
  updateCourseCatalog: CourseCatalog;
}

export interface DeleteCourseCatalogResult {
  deleteCourseCatalog: {
    id: string;
  };
}

export interface UpdateCourseCatalogStatusResult {
  updateCatalogStatus: {
    id: string;
    title: string;
    status: CourseCatalogStatus;
    updatedAt: string;
  };
}

export interface AddTagToCourseCatalogResult {
  addTagToCatalog: {
    id: string;
    title: string;
    tags: string[];
    updatedAt: string;
  };
}

export interface RemoveTagFromCourseCatalogResult {
  removeTagFromCatalog: {
    id: string;
    title: string;
    tags: string[];
    updatedAt: string;
  };
}

export interface BulkUpdateCourseCatalogsResult {
  bulkUpdateCatalogs: {
    successCount: number;
    failedItems: Array<{
      id: string;
      errorMessage: string;
    }>;
  };
}

export interface CourseCatalogFilterInput {
  text?: string;
  level?: string;
  category?: string;
  tags?: string[];
}