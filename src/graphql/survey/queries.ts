// GraphQL 쿼리 정의
export const getSurvey = /* GraphQL */ `
  query GetSurvey(\$instanceId: ID!) {
    getSurvey(instanceId: \$instanceId) {
      instanceId
      surveyCatalogId
      title
      description
      status
      deployOption
      deployWhen
      startDate
      endDate
      courseId
      courseName
      totalParticipants
      totalResponses
      completionRate
      notifyParticipants
      sendReminders
      sendReportToAdmin
      createdAt
      createdBy
      updatedAt
      owner
      metadata
      questionItems {
        id
        text
        type
        options
        required
        order
        metadata
      }
    }
  }
`;

export const listSurveys = /* GraphQL */ `
  query ListSurveys(\$filter: ModelSurveyFilterInput, \$limit: Int, \$nextToken: String) {
    listSurveys(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        instanceId
        surveyCatalogId
        title
        description
        status
        deployOption
        deployWhen
        startDate
        endDate
        courseId
        courseName
        totalParticipants
        totalResponses
        completionRate
        notifyParticipants
        sendReminders
        sendReportToAdmin
        createdAt
        createdBy
        updatedAt
        owner
        metadata
        questionItems {
          id
          text
          type
          options
          required
          order
          metadata
        }
      }
      nextToken
    }
  }
`;

export const getSurveysByCatalog = /* GraphQL */ `
  query GetSurveysByCatalog(\$surveyCatalogId: ID!, \$limit: Int, \$nextToken: String) {
    getSurveysByCatalog(surveyCatalogId: \$surveyCatalogId, limit: \$limit, nextToken: \$nextToken) {
      items {
        instanceId
        surveyCatalogId
        title
        description
        status
        deployOption
        deployWhen
        startDate
        endDate
        courseId
        courseName
        totalParticipants
        totalResponses
        completionRate
        notifyParticipants
        sendReminders
        sendReportToAdmin
        createdAt
        createdBy
        updatedAt
        owner
        metadata
        questionItems {
          id
          text
          type
          options
          required
          order
          metadata
        }
      }
      nextToken
    }
  }
`;

export const getSurveysByCourse = /* GraphQL */ `
  query GetSurveysByCourse(\$courseId: ID!, \$limit: Int, \$nextToken: String) {
    getSurveysByCourse(courseId: \$courseId, limit: \$limit, nextToken: \$nextToken) {
      items {
        instanceId
        surveyCatalogId
        title
        description
        status
        deployOption
        deployWhen
        startDate
        endDate
        courseId
        courseName
        totalParticipants
        totalResponses
        completionRate
        notifyParticipants
        sendReminders
        sendReportToAdmin
        createdAt
        createdBy
        updatedAt
        owner
        metadata
        questionItems {
          id
          text
          type
          options
          required
          order
          metadata
        }
      }
      nextToken
    }
  }
`;
