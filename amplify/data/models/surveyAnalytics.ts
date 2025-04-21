// amplify/data/models/surveyAnalytics.ts
import { a } from '@aws-amplify/backend';

export const surveyAnalyticsSchema = a.schema({
    SurveyAnalytics: a
        .model({
            surveyId: a.string().required(),
            courseId: a.string().required(),
            totalResponses: a.integer().required(),
            averageRating: a.float(),
            questionBreakdown: a.string(), // JSON 문자열로 저장
            keyInsights: a.string().array(),
            updatedAt: a.string().required(),
            createdAt: a.datetime(),

            // 관계 정의
            course: a.belongsTo('Course', 'courseId')
        })
        .identifier(['surveyId', 'courseId'])
        .secondaryIndexes((index) => [
            index('courseId').sortKeys(['updatedAt']).name('byCourseAndTime')
        ])
});