// amplify/data/models/courseCatalog.ts
import { a } from '@aws-amplify/backend';

export const courseCatalogSchema = a.schema({
  CourseCatalog: a
    .model({
      catalogId: a.id().required(),
      version: a.string().required(),
      title: a.string().required(),
      awsCode: a.string(),
      description: a.string(),
      level: a.string(),
      duration: a.integer(),
      price: a.float(),
      currency: a.string(),
      isPublished: a.boolean().required(),
      publishedDate: a.datetime(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      
      // 관계 정의
      modules: a.hasMany('CourseModule', 'catalogId'),
      labs: a.hasMany('CourseLab', 'catalogId'),
      materials: a.hasMany('CourseMaterial', 'catalogId')
    })
    .identifier(['catalogId', 'version'])
    .secondaryIndexes((index) => [
      index('title').sortKeys(['version']).name('byTitle'),
      index('awsCode').sortKeys(['version']).name('byAwsCode')
    ])
});