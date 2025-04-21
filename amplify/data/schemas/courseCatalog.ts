// amplify/data/schemas/courseCatalog.ts
import { a } from '@aws-amplify/backend';
import { catalogTable } from '../datasources/tables';

export const courseCatalogSchema = {
  CourseCatalog: a
    .model({
      catalogId: a.id().required(),
      version: a.string().required(),
      title: a.string().required(),
      awsCode: a.string(),
      description: a.string(),
      category: a.string(),
      level: a.string(),
      duration: a.string(),
      status: a.string(),
      objectives: a.array(a.string()),
      targetAudience: a.array(a.string()),
      deliveryMethod: a.string(),
      // 관계 정의
      modules: a.hasMany('Module')
    })
    .dataSource(catalogTable)
    .authorization(allow => [
      allow.public().to(['read']),
      allow.authenticated().to(['read', 'create', 'update', 'delete']),
    ])
};
