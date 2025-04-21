// amplify/data/schemas/customer.ts
import { a } from '@aws-amplify/backend';
import { customerTable } from '../datasources/tables';

export const customerSchema = {
  Customer: a
    .model({
      customerId: a.id().required(),
      customerName: a.string().required(),
      address: a.string(),
      contactPerson: a.string(),
      email: a.string(),
      phone: a.string(),
      status: a.string(),
      // 관계 정의
      courses: a.hasMany('Course')
    })
    .dataSource(customerTable)
    .authorization(allow => [
      allow.authenticated().to(['read', 'create', 'update', 'delete'])
    ])
    // 복합 키 정의
    .primaryKey(keys => keys.partition('customerId'))
    // GSI 정의
    .index('byName', keys => keys.partition('customerName'))
};