// amplify/data/models/courseModule.ts
import { a } from '@aws-amplify/backend';

export const courseModuleSchema = a.schema({
  CourseModule: a
    .model({
      moduleId: a.id().required(),
      catalogId: a.string().required(),
      moduleNumber: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      duration: a.integer(),
      isPublished: a.boolean().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      
      // 관계 정의
      courseCatalog: a.belongsTo('CourseCatalog', 'catalogId'),
      labs: a.hasMany('CourseLab', 'moduleId'),
      materials: a.hasMany('CourseMaterial', 'moduleId')
    })
    .identifier(['catalogId', 'moduleNumber'])
    .secondaryIndexes((index) => [
      index('moduleId').name('byModuleId')
    ])
});
