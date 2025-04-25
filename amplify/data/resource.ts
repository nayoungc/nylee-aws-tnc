// import { type ClientSchema, a, defineData } from '@aws-amplify/backend/data';

// // 스키마 정의
// const schema = a.schema({
//   Course: a
//     .model({
//       code: a.string().required(),
//       title: a.string().required(),
//       description: a.string(),
//       category: a.string().required(),
//       duration: a.integer().required(),
//       level: a.enum(['beginner', 'intermediate', 'advanced']),
//       prerequisites: a.string().array(),
//       createdAt: a.timestamp(),
//       updatedAt: a.timestamp(),
//     })
//     .authorization(allow => [
//       allow.public().to(['read']),
//       allow.authenticated().to(['create', 'update', 'delete']),
//     ]),

//   Customer: a
//     .model({
//       name: a.string().required(),
//       contactName: a.string().required(),
//       contactEmail: a.string().required(),
//       contactPhone: a.string().required(),
//       address: a.string(),
//       active: a.boolean().required(),
//       createdAt: a.timestamp(),
//       updatedAt: a.timestamp(),
//     })
//     .authorization(allow => [
//       allow.authenticated().to(['read', 'create', 'update', 'delete']),
//     ]),

//   Instructor: a
//     .model({
//       name: a.string().required(),
//       email: a.string().required(),
//       phone: a.string(),
//       bio: a.string(),
//       specialties: a.string().array().required(),
//       active: a.boolean(),
//       createdAt: a.timestamp(),
//       updatedAt: a.timestamp(),
//     })
//     .authorization(allow => [
//       allow.authenticated().to(['read', 'create', 'update', 'delete']),
//     ]),
// });

// export type Schema = ClientSchema<typeof schema>;

// // 데이터 리소스 정의
// export const data = defineData({
//   schema,
//   authorizationModes: {
//     defaultAuthorizationMode: 'userPool',
//   },
// });