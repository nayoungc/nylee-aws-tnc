// amplify/data/schemas/labs.ts
import { a } from '@aws-amplify/backend';
import { labTable } from '../datasources/tables';

export const labSchema = {
  Lab: a
    .model({
      labId: a.id().required(),
      catalogId: a.string().required(),
      moduleId: a.string().required(),
      labNumber: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      duration: a.string(),
      instructions: a.string(),
      // 관계 정의
      module: a.belongsTo('Module')
    })
    .dataSource(labTable)
    .authorization(allow => [
      allow.public().to(['read']),
      allow.authenticated().to(['read', 'create', 'update', 'delete'])
    ])
    // 복합 키 정의
    .primaryKey(keys => keys.partition('catalogId').sort('labId'))
    // GSI 정의
    .index('byModule', keys => keys.partition('moduleId').sort('labNumber'))
};