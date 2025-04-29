// src/graphql/surveyQuestionBank/queries.ts
/**
 * 설문 질문 은행 관련 GraphQL 쿼리 및 뮤테이션
 * 
 * 설문조사 시스템의 재사용 가능한 질문 항목들을 관리하기 위한 GraphQL 작업 정의
 * @module graphql/surveyQuestionBank
 */

// Amplify Gen 2에서는 graphql 태그 템플릿을 사용하지 않고 문자열로 직접 정의
export const listSurveyQuestionBankItems = `
  query ListSurveyQuestionBankItems(\$filter: ModelSurveyQuestionBankFilterInput, \$limit: Int, \$nextToken: String) {
    listSurveyQuestionBankItems(filter: \$filter, limit: \$limit, nextToken: \$nextToken) {
      items {
        questionId
        content
        questionType
        options {
          value
          label
        }
        required
        tags
        courseId
        courseName
        moduleId
        moduleName
        createdAt
        updatedAt
        createdBy
        metadata
      }
      nextToken
    }
  }
`;

export const getSurveyQuestionBankItem = `
  query GetSurveyQuestionBankItem(\$questionId: ID!) {
    getSurveyQuestionBankItem(questionId: \$questionId) {
      questionId
      content
      questionType
      options {
        value
        label
      }
      required
      tags
      courseId
      courseName
      moduleId
      moduleName
      createdAt
      updatedAt
      createdBy
      metadata
    }
  }
`;

export const searchSurveyQuestionBankItems = `
  query SearchSurveyQuestionBankItems(\$text: String!, \$limit: Int, \$nextToken: String) {
    searchSurveyQuestionBankItems(text: \$text, limit: \$limit, nextToken: \$nextToken) {
      items {
        questionId
        content
        questionType
        options {
          value
          label
        }
        required
        tags
        courseId
        courseName
        moduleId
        moduleName
        createdAt
        updatedAt
        createdBy
        metadata
      }
      nextToken
    }
  }
`;

export const getSurveyQuestionBankItemsByTag = `
  query GetSurveyQuestionBankItemsByTag(\$tag: String!, \$limit: Int, \$nextToken: String) {
    getSurveyQuestionBankItemsByTag(tag: \$tag, limit: \$limit, nextToken: \$nextToken) {
      items {
        questionId
        content
        questionType
        options {
          value
          label
        }
        required
        tags
        courseId
        courseName
        moduleId
        moduleName
        createdAt
        updatedAt
        createdBy
        metadata
      }
      nextToken
    }
  }
`;

export const getSurveyQuestionBankItemsByType = `
  query GetSurveyQuestionBankItemsByType(\$type: String!, \$limit: Int, \$nextToken: String) {
    getSurveyQuestionBankItemsByType(type: \$type, limit: \$limit, nextToken: \$nextToken) {
      items {
        questionId
        content
        questionType
        options {
          value
          label
        }
        required
        tags
        courseId
        courseName
        moduleId
        moduleName
        createdAt
        updatedAt
        createdBy
        metadata
      }
      nextToken
    }
  }
`;