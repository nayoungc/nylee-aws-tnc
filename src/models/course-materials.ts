export interface CourseMaterial {
  catalogId: string;
  materialTypeId: string;
  moduleId: string;
  materialType: string;
  title?: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  order?: number;
}
