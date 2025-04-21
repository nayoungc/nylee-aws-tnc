// amplify/data/models/course.ts
import { a } from '@aws-amplify/backend';

export const courseSchema = a.schema({
  Course: a
    .model({
      courseId: a.string().required(),
      startDate: a.string().required(),
      catalogId: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      endDate: a.string(),
      status: a.string().required(),
      shareCode: a.string(),
      instructor: a.string(),
      customerId: a.string().required(),
      maxSeats: a.integer(),
      currentSeats: a.integer(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),

      // 관계 정의
      courseCatalog: a.belongsTo('CourseCatalog', 'catalogId'),
      customer: a.belongsTo('Customer', 'customerId'),
      userQuizzes: a.hasMany('UserQuiz', 'courseId')
    })
    .identifier(['courseId', 'startDate'])
    .secondaryIndexes((index) => [
      index('catalogId').sortKeys(['startDate']).name('byCatalogId'),
      index('shareCode').name('byShareCode'),
      index('instructor').sortKeys(['startDate']).name('byInstructor'),
      index('customerId').sortKeys(['startDate']).name('byCustomerId')
    ])
});