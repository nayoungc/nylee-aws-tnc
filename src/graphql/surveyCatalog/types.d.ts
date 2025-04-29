// src/graphql/surveyCatalog/types.ts
import { SurveyCatalog, QuestionItem, QuestionType, DeployOption, DeployTiming } from '@/models/surveyCatalog';

// 쿼리 결과 타입
export interface GetSurveyCatalogResult {
  getSurveyCatalog: SurveyCatalog | null;
}

export interface ListSurveyCatalogsResult {
  listSurveyCatalogs: SurveyCatalogConnection;
}

export interface GetSurveyCatalogsByCategoryResult {
  getSurveyCatalogsByCategory: SurveyCatalogConnection;
}

export interface GetSurveyCatalogsByCreatorResult {
  getSurveyCatalogsByCreator: SurveyCatalogConnection;
}

export interface GetSurveyCatalogsByCourseResult {
  getSurveyCatalogsByCourse: SurveyCatalogConnection;
}

export interface SearchSurveyCatalogsByTagsResult {
  searchSurveyCatalogsByTags: SurveyCatalogConnection;
}

export interface SurveyCatalogConnection {
  items: SurveyCatalog[];
  nextToken?: string | null;
}

// 뮤테이션 입력 타입
export interface SurveyCatalogInput {
  title: string;
  description?: string;
  category: string;
  tags: string[];
  isActive?: boolean;
  metadata?: Record<string, any>;
  courseId?: string;
  courseName?: string;
}

export interface UpdateSurveyCatalogInput {
  surveyCatalogId: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  metadata?: Record<string, any>;
  courseId?: string;
  courseName?: string;
}

export interface QuestionItemInput {
  id: string;
  type: QuestionType;
  content: string;
  required: boolean;
  options?: QuestionOptionInput[];
  order?: number;
}

export interface QuestionOptionInput {
  value: string;
  label: string;
}

export interface DeploySurveyInput {
  surveyCatalogId: string;
  deployOption: DeployOption;
  deployWhen?: DeployTiming;
  startDate: string;
  endDate: string;
  notifyParticipants?: boolean;
  sendReminders?: boolean;
  sendReportToAdmin?: boolean;
}

// 뮤테이션 결과 타입
export interface CreateSurveyCatalogResult {
  createSurveyCatalog: SurveyCatalog;
}

export interface UpdateSurveyCatalogResult {
  updateSurveyCatalog: SurveyCatalog;
}

export interface DeleteSurveyCatalogResult {
  deleteSurveyCatalog: boolean;
}

export interface AddQuestionItemsResult {
  addQuestionItems: SurveyCatalog;
}

export interface RemoveQuestionItemsResult {
  removeQuestionItems: SurveyCatalog;
}

export interface UpdateQuestionOrderResult {
  updateQuestionOrder: SurveyCatalog;
}

export interface ActivateSurveyCatalogResult {
  activateSurveyCatalog: SurveyCatalog;
}

export interface DeactivateSurveyCatalogResult {
  deactivateSurveyCatalog: SurveyCatalog;
}

export interface DeploySurveyResult {
  deploySurvey: SurveyCatalog;
}

// 필터 타입
export interface SurveyCatalogFilterInput {
  title?: ModelStringInput;
  category?: ModelStringInput;
  tags?: ModelStringInput;
  isActive?: ModelBooleanInput;
  createdBy?: ModelStringInput;
  courseId?: ModelIDInput;
  and?: SurveyCatalogFilterInput[];
  or?: SurveyCatalogFilterInput[];
  not?: SurveyCatalogFilterInput;
}

export interface ModelStringInput {
  ne?: string;
  eq?: string;
  le?: string;
  lt?: string;
  ge?: string;
  gt?: string;
  contains?: string;
  notContains?: string;
  between?: [string, string];
  beginsWith?: string;
  attributeExists?: boolean;
  attributeType?: ModelAttributeTypes;
  size?: ModelSizeInput;
}

export interface ModelBooleanInput {
  ne?: boolean;
  eq?: boolean;
  attributeExists?: boolean;
  attributeType?: ModelAttributeTypes;
}

export interface ModelIDInput {
  ne?: string;
  eq?: string;
  le?: string;
  lt?: string;
  ge?: string;
  gt?: string;
  contains?: string;
  notContains?: string;
  between?: [string, string];
  beginsWith?: string;
  attributeExists?: boolean;
  attributeType?: ModelAttributeTypes;
  size?: ModelSizeInput;
}

export interface ModelSizeInput {
  ne?: number;
  eq?: number;
  le?: number;
  lt?: number;
  ge?: number;
  gt?: number;
  between?: [number, number];
}

export enum ModelAttributeTypes {
  binary = 'binary',
  binarySet = 'binarySet',
  bool = 'bool',
  list = 'list',
  map = 'map',
  number = 'number',
  numberSet = 'numberSet',
  string = 'string',
  stringSet = 'stringSet',
  _null = '_null'
}