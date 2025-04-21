// amplify/data/models/course.ts
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Course: a
    .model({
      courseId: a.id().required(),
      title: a.string().required(),
      catalogId: a.string().required(),
      version: a.string().required(),
      customerId: a.string().required(),
      startDate: a.datetime(),
      endDate: a.datetime(),
      status: a.string().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      // 복합 키를 사용한 관계는 필드 이름 배열로 전달
      courseCatalog: a.belongsTo('CourseCatalog', ['catalogId', 'version']),
      customer: a.belongsTo('Customer', 'customerId')
    })
    .identifier(['courseId'])
    .secondaryIndexes((index) => [
      index('catalogId').name('byCourseCatalog'),
      index('customerId').name('byCustomer')
    ]),
  
  CourseCatalog: a
    .model({
      catalogId: a.id().required(),
      version: a.string().required(),
      title: a.string().required(),
      // hasMany 관계도 동일하게 배열로 전달
      courses: a.hasMany('Course', ['catalogId', 'version'])
    })
    .identifier(['catalogId', 'version']),

  Customer: a
    .model({
      customerId: a.id().required(),
      name: a.string().required(),
      courses: a.hasMany('Course', 'customerId')
    })
    .identifier(['customerId'])
})
.authorization((allow) => [
  allow.authenticated().to(['read']), 
  allow.group('Admin').to(['create', 'read', 'update', 'delete']),
  allow.owner().to(['read', 'create', 'update', 'delete'])
]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  }
});