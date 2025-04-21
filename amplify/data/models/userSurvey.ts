// amplify/data/models/userSurvey.ts
import { a } from '@aws-amplify/backend';

export const userSurveySchema = a.schema({
    UserSurvey: a
        .model({
            randomId: a.string().required(),
            courseId_surveyType_surveyId: a.string().required(), // 복합 키: courseId#surveyType#surveyId
            courseId: a.string().required(),
            surveyType: a.string().required(),
            surveyId: a.string().required(),
            completionTime: a.string(),
            comments: a.string(),
            createdAt: a.datetime(),
            updatedAt: a.datetime(),

            // 관계 정의
            course: a.belongsTo('Course', 'courseId'),
            responses: a.hasMany('UserSurveyResponse', ['randomId_courseId_surveyId'])
        })
        .identifier(['randomId', 'courseId_surveyType_surveyId'])
        .secondaryIndexes((index) => [
            index('courseId').sortKeys(['surveyType']).name('byCourseAndSurveyType'),
            index('surveyId').sortKeys(['completionTime']).name('bySurveyAndTime')
        ])
});