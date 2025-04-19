export const schema = /* GraphQL */ `
  type Course @model @auth(rules: [{allow: private}]) {
    id: ID!
    title: String!
    description: String
    duration: Int
    level: String
    price: Float
    category: String
    publishedDate: AWSDateTime
    isActive: Boolean
  }

  type Customer @model @auth(rules: [{allow: private}]) {
    id: ID!
    name: String!
    contactPerson: String
    email: String
    phone: String
    address: String
    status: String
    joinDate: AWSDateTime
  }

  # 강사 정보 - Cognito와 연동
  type Instructor @model @auth(rules: [{allow: private}]) {
    id: ID!
    cognitoId: String!
    name: String!
    email: String!
    phone: String
    specialization: String
    bio: String
    status: String
    joinDate: AWSDateTime
  }
`;