// amplify/data/models/userResponse.ts
import { a } from '@aws-amplify/backend';

export const userResponseSchema = a.schema({
    UserResponse: a
        .model({
            userId_courseId_quizId: a.string().required(), // 복합 키: userId#courseId#quizId
            questionNumber_attemptNumber: a.string().required(), // 복합 키: questionNumber#attemptNumber
            quizId: a.string().required(),
            questionNumber: a.string().required(),
            courseId: a.string().required(),
            userId: a.string().required(),
            attemptNumber: a.integer().required(),
            selectedAnswer: a.string(),
            isCorrect: a.string().required(),
            timeSpent: a.integer(),
            createdAt: a.datetime(),
            updatedAt: a.datetime(),

            // 관계 정의
            userQuiz: a.belongsTo('UserQuiz', ['userId', 'courseId_quizType_quizId'])
        })
        .identifier(['userId_courseId_quizId', 'questionNumber_attemptNumber'])
        .secondaryIndexes((index) => [
            index('quizId').sortKeys(['questionNumber']).name('byQuizAndQuestion'),
            index('courseId').sortKeys(['isCorrect']).name('byCourseAndCorrectness')
        ])
});