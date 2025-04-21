// amplify/data/schemas/module.ts
import { a } from '@aws-amplify/backend';
import { moduleTable } from '../datasources/tables';

export const moduleSchema = {
  Module: a
    .model({
      moduleId: a.id(),
      catalogId: a.string().required(),
      moduleNumber: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      duration: a.string(),
      // 관계 정의
      course: a.belongsTo('CourseCatalog'),
      labs: a.hasMany('Lab')
    })
    .dataSource(moduleTable)
    .authorization(allow => [
      allow.public().to(['read']),
      allow.authenticated().to(['read', 'create', 'update', 'delete'])
    ])
    // 복합 키 정의
    .primaryKey(keys => keys.partition('catalogId').sort('moduleNumber'))
};