// src/graphql/catalog/types.ts
import { BaseRecord } from '../common/types';
import { CatalogStatus, CourseCatalog } from '../../models/catalog';

export interface ListCourseCatalogsResult {
  listCourseCatalogs: {
    items: CourseCatalog[];
    nextToken?: string;
  };
}

export interface GetCourseCatalogResult {
  getCourseCatalog: CourseCatalog | null;
}

export interface SearchCatalogResult {
  searchCatalog: CourseCatalog[];
}

export interface GetCatalogByCategoryResult {
  getCatalogByCategory: CourseCatalog[];
}

export interface GetCatalogByLevelResult {
  getCatalogByLevel: CourseCatalog[];
}

export interface GetCatalogsByTagResult {
  getCatalogsByTag: CourseCatalog[];
}

export interface GetRecentlyUpdatedCatalogsResult {
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

export interface UpdateCatalogStatusResult {
  updateCatalogStatus: {
    id: string;
    title: string;
    status: CatalogStatus;
    updatedAt: string;
  };
}

export interface AddTagToCatalogResult {
  addTagToCatalog: {
    id: string;
    title: string;
    tags: string[];
    updatedAt: string;
  };
}

export interface RemoveTagFromCatalogResult {
  removeTagFromCatalog: {
    id: string;
    title: string;
    tags: string[];
    updatedAt: string;
  };
}

export interface BulkUpdateCatalogsResult {
  bulkUpdateCatalogs: {
    successCount: number;
    failedItems: Array<{
      id: string;
      errorMessage: string;
    }>;
  };
}

export interface CatalogFilterInput {
  text?: string;
  level?: string;
  category?: string;
  tags?: string[];
}