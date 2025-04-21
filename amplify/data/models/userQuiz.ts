// amplify/data/models/userQuiz.ts
import { a } from '@aws-amplify/backend';

export const userQuizSchema = a.schema({
    UserQuiz: a
        .model({
            userId: a.string().required(),
            courseId_quizType_quizId: a.string().required(),
            courseId: a.string().required(),
            quizType: a.string().required(),
            quizId: a.string().required(),
            completionTime: a.string(),
            score: a.integer(),
            status: a.string().required(),
            timeSpent: a.integer(),
            startTime: a.datetime(),
            endTime: a.datetime(),
            createdAt: a.datetime(),
            updatedAt: a.datetime(),
            // 관계 정의
            course: a.belongsTo('Course', 'courseId'),
            responses: a.hasMany('UserResponse', 'userId_courseId_quizId')
        })
        .identifier(['userId', 'courseId_quizType_quizId'])
        .secondaryIndexes((index) => [
            index('courseId').sortKeys(['userId']).name('byCourseAndUser'),
            index('quizId').sortKeys(['completionTime']).name('byQuiz')
        ])
});