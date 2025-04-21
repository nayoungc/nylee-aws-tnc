// amplify/data/models/customer.ts
import { a } from '@aws-amplify/backend';

export const customerSchema = a.schema({
  Customer: a
    .model({
      customerId: a.id().required(),
      customerName: a.string().required(),
      email: a.string(),
      phone: a.string(),
      address: a.string(),
      organizationName: a.string(),
      organizationSize: a.integer(),
      industry: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),

      // 관계 정의
      courses: a.hasMany('Course', 'customerId')
    })
    .identifier(['customerId'])
    .secondaryIndexes((index) => [
      index('customerName').name('byCustomerName')
    ])
});