// amplify/data/models/dashboardMetric.ts
import { a } from '@aws-amplify/backend';

export const dashboardMetricSchema = a.schema({
  DashboardMetric: a
    .model({
      metricType: a.string().required(),
      timeFrame_entityId: a.string().required(), // 복합 키: timeFrame#entityId
      entityId: a.string().required(),
      timeFrame: a.string().required(),
      metricValue: a.float().required(),
      additionalData: a.string(), // JSON 문자열로 저장
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .identifier(['metricType', 'timeFrame_entityId'])
    .secondaryIndexes((index) => [
      index('entityId').sortKeys(['metricType']).name('byEntityAndMetricType')
    ])
});