// amplify/data/schemas/course.ts
import { a } from '@aws-amplify/backend';
import { courseTable } from '../datasources/tables';

export const courseSchema = {
  Course: a
    .model({
      courseId: a.id().required(),
      startDate: a.string().required(),
      endDate: a.string(),
      catalogId: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      shareCode: a.string(),
      instructor: a.string(),
      customerId: a.string(),
      status: a.string(),
      maxStudents: a.integer(),
      enrolledStudents: a.integer(),
      // 관계 정의
      catalog: a.belongsTo('CourseCatalog'),
      customer: a.belongsTo('Customer')
    })
    .dataSource(courseTable)
    .authorization(allow => [
      allow.authenticated().to(['read', 'create', 'update', 'delete'])
    ])
    // 복합 키 정의
    .primaryKey(keys => keys.partition('courseId').sort('startDate'))
    // GSI 정의
    .index('byCatalog', keys => keys.partition('catalogId').sort('startDate'))
    .index('byShareCode', keys => keys.partition('shareCode'))
    .index('byInstructor', keys => keys.partition('instructor').sort('startDate'))
    .index('byCustomer', keys => keys.partition('customerId').sort('startDate'))
};