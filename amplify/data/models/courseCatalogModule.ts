// amplify/data/models/courseCatalogModule.ts
import { a } from '@aws-amplify/backend';

export const courseCatalogModuleSchema = a.schema({
    CourseCatalogModule: a
        .model({
            catalogId: a.string().required(),
            moduleNumber: a.string().required(),
            moduleId: a.string().required(),
            title: a.string().required(),
            description: a.string(),
            duration: a.integer(),
            order: a.integer().required(),
            isPublished: a.boolean().required(),
            createdAt: a.datetime(),
            updatedAt: a.datetime(),

            // 관계 정의
            courseCatalog: a.belongsTo('CourseCatalog', 'catalogId'),
            labs: a.hasMany('CourseCatalogLab', 'moduleId'),
            materials: a.hasMany('CourseCatalogMaterial', 'moduleId')
        })
        .identifier(['catalogId', 'moduleNumber'])
        .secondaryIndexes((index) => [
            index('moduleId').name('byModuleId')
        ])
});