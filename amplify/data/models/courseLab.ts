// amplify/data/models/courseLab.ts
import { a } from '@aws-amplify/backend';

export const courseLabSchema = a.schema({
  CourseLab: a
    .model({
      catalogId: a.string().required(),
      labId: a.string().required(),
      moduleId: a.string().required(),
      labNumber: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      content: a.string(),
      duration: a.integer(),
      isPublished: a.boolean().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      
      // 관계 정의
      courseCatalog: a.belongsTo('CourseCatalog', 'catalogId'),
      module: a.belongsTo('CourseModule', 'moduleId')
    })
    .identifier(['catalogId', 'labId'])
    .secondaryIndexes((index) => [
      index('moduleId').sortKeys(['labNumber']).name('byModule')
    ])
});