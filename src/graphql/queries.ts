/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const listCourseCatalogs = /* GraphQL */ `query ListCourseCatalogs($limit: Int, $nextToken: String) {
  listCourseCatalogs(limit: $limit, nextToken: $nextToken) {
    items {
      id
      course_id
      course_name
      level
      duration
      delivery_method
      description
      objectives
      target_audience
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCourseCatalogsQueryVariables,
  APITypes.ListCourseCatalogsQuery
>;
export const getCourseCatalog = /* GraphQL */ `query GetCourseCatalog($id: ID!) {
  getCourseCatalog(id: $id) {
    id
    course_id
    course_name
    level
    duration
    delivery_method
    description
    objectives
    target_audience
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCourseCatalogQueryVariables,
  APITypes.GetCourseCatalogQuery
>;
export const listCustomers = /* GraphQL */ `query ListCustomers(
  $filter: ModelCustomerFilterInput
  $limit: Int
  $nextToken: String
) {
  listCustomers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCustomersQueryVariables,
  APITypes.ListCustomersQuery
>;
export const getCustomer = /* GraphQL */ `query GetCustomer($id: ID!) {
  getCustomer(id: $id) {
    id
    name
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCustomerQueryVariables,
  APITypes.GetCustomerQuery
>;
export const listInstructors = /* GraphQL */ `query ListInstructors(
  $filter: ModelInstructorFilterInput
  $limit: Int
  $nextToken: String
) {
  listInstructors(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      email
      status
      profile
      cognitoId
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListInstructorsQueryVariables,
  APITypes.ListInstructorsQuery
>;
export const getInstructor = /* GraphQL */ `query GetInstructor($id: ID!) {
  getInstructor(id: $id) {
    id
    name
    email
    status
    profile
    cognitoId
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetInstructorQueryVariables,
  APITypes.GetInstructorQuery
>;
