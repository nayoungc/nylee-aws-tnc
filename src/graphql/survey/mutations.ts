// GraphQL 뮤테이션 정의
export const createSurvey = /* GraphQL */ `
  mutation CreateSurvey(\$input: CreateSurveyInput!) {
    createSurvey(input: \$input) {
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

export const updateSurvey = /* GraphQL */ `
  mutation UpdateSurvey(\$input: UpdateSurveyInput!) {
    updateSurvey(input: \$input) {
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

export const deleteSurvey = /* GraphQL */ `
  mutation DeleteSurvey(\$instanceId: ID!) {
    deleteSurvey(instanceId: \$instanceId) {
      instanceId
    }
  }
`;

export const updateSurveyStatus = /* GraphQL */ `
  mutation UpdateSurveyStatus(\$instanceId: ID!, \$status: String!) {
    updateSurveyStatus(instanceId: \$instanceId, status: \$status) {
      instanceId
      status
      updatedAt
    }
  }
`;

export const sendSurveyReminders = /* GraphQL */ `
  mutation SendSurveyReminders(\$instanceId: ID!) {
    sendSurveyReminders(instanceId: \$instanceId) {
      instanceId
      sentCount
    }
  }
`;