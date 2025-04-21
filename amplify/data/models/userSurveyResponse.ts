// amplify/data/models/userSurveyResponse.ts
import { a } from '@aws-amplify/backend';

export const userSurveyResponseSchema = a.schema({
    UserSurveyResponse: a
        .model({
            randomId_courseId_surveyId: a.string().required(), // 복합 키: randomId#courseId#surveyId
            questionNumber: a.string().required(),
            surveyId: a.string().required(),
            courseId: a.string().required(),
            randomId: a.string().required(),
            questionText: a.string().required(),
            responseType: a.string().required(),
            responseValue: a.string(),
            responseText: a.string(),
            createdAt: a.datetime(),
            updatedAt: a.datetime(),

            // 관계 정의
            userSurvey: a.belongsTo('UserSurvey', ['randomId', 'courseId_surveyType_surveyId'])
        })
        .identifier(['randomId_courseId_surveyId', 'questionNumber'])
        .secondaryIndexes((index) => [
            index('surveyId').sortKeys(['questionNumber']).name('bySurveyAndQuestion'),
            index('courseId').sortKeys(['surveyId']).name('byCourseAndSurvey')
        ])
});