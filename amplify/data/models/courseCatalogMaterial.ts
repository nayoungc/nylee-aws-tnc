// amplify/data/models/courseCatalogMaterial.ts
import { a } from '@aws-amplify/backend';

export const courseCatalogMaterialSchema = a.schema({
    CourseCatalogMaterial: a
        .model({
            catalogId: a.string().required(),
            materialTypeId: a.string().required(),
            moduleId: a.string().required(),
            materialType: a.string().required(),
            title: a.string().required(),
            description: a.string(),
            url: a.string(),
            fileSize: a.integer(),
            fileType: a.string(),
            createdAt: a.datetime(),
            updatedAt: a.datetime(),
            
            // 관계 정의
            courseCatalog: a.belongsTo('CourseCatalog', 'catalogId'),
            module: a.belongsTo('CourseCatalogModule', 'moduleId')
        })
        .identifier(['catalogId', 'materialTypeId'])
        .secondaryIndexes((index) => [
            index('moduleId').sortKeys(['materialType']).name('byModuleAndType')
        ])
});