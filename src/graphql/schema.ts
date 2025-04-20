// src/graphql/schema.ts
export const schema = /* GraphQL */ `
  // 스키마 버전과 필요한 스칼라 타입 정의 추가
  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }

  scalar AWSDateTime
  scalar AWSJSON
  scalar AWSEmail
  scalar AWSPhone
  scalar AWSIPAddress

  type CourseCatalog @model @auth(rules: [{allow: private}]) {
    id: ID!
    title: String!
    level: String
    duration: Int
    description: String
    delivery_method: String
    objectives: String
    target_audience: String
  }

  type CourseCatalogModule @model @auth(rules: [{allow: private}]) {
    id: ID!
    catalogID: ID! @index(name: "byCatalog", sortKeyFields: ["order"])
    title: String!
    description: String
    duration: Int
    order: Int
    catalog: CourseCatalog @belongsTo(fields: ["catalogID"])
    exercises: [Exercise] @hasMany(indexName: "byModule", fields: ["id"])
  }

  type Exercise @model @auth(rules: [{allow: private}]) {
    id: ID!
    moduleID: ID! @index(name: "byModule", sortKeyFields: ["order"])
    title: String!
    description: String
    type: String
    durationMinutes: Int
    order: Int
    module: CourseCatalogModule @belongsTo(fields: ["moduleID"])
  }

  type Course @model @auth(rules: [{allow: private}]) {
    id: ID!
    catalogID: ID! @index(name: "byCatalog")
    title: String!
    description: String
    startDate: AWSDateTime!
    endDate: AWSDateTime!
    location: String
    isOnline: Boolean
    maxStudents: Int
    instructorID: ID! @index(name: "byInstructor")
    instructorName: String
    customerID: ID! @index(name: "byCustomer")
    customerName: String
    tags: [String]
    catalog: CourseCatalog @belongsTo(fields: ["catalogID"])
    instructor: Instructor @belongsTo(fields: ["instructorID"])
    customer: Customer @belongsTo(fields: ["customerID"])
    announcements: [Announcement] @hasMany(indexName: "byCourse", fields: ["id"])
    assessments: [Assessment] @hasMany(indexName: "byCourse", fields: ["id"])
  }

  type Announcement @model @auth(rules: [{allow: private}]) {
    id: ID!
    courseID: ID! @index(name: "byCourse")
    title: String!
    content: String!
    createdAt: AWSDateTime
    course: Course @belongsTo(fields: ["courseID"])
  }

  type Assessment @model @auth(rules: [{allow: private}]) {
    id: ID!
    courseID: ID! @index(name: "byCourse")
    name: String!
    type: String! # pre-quiz, post-quiz, survey
    status: String! # active, completed, draft
    dueDate: AWSDateTime
    course: Course @belongsTo(fields: ["courseID"])
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
    courses: [Course] @hasMany(indexName: "byCustomer", fields: ["id"])
  }

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
    courses: [Course] @hasMany(indexName: "byInstructor", fields: ["id"])
  }
`;