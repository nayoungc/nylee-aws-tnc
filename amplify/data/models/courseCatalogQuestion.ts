// amplify/data/models/courseCatalogQuestion.ts
import { a } from '@aws-amplify/backend';

export const courseCatalogQuestionSchema = a.schema({
    CourseQuestion: a
        .model({
            quizId: a.string().required(),
            questionNumber: a.string().required(),
            catalogId: a.string().required(),
            questionText: a.string().required(),
            options: a.string().array(),
            correctAnswer: a.string().required(),
            explanation: a.string(),
            difficulty: a.string(),
            createdAt: a.datetime(),
            updatedAt: a.datetime(),

            // 관계 정의
            courseCatalog: a.belongsTo('CourseCatalog', 'catalogId')
        })
        .identifier(['quizId', 'questionNumber'])
        .secondaryIndexes((index) => [
            index('catalogId').name('byCatalogId')
        ])
});