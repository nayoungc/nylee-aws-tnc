// src/graphql/queries/customers.ts
import { graphql } from '../../api';

export const getCustomer = graphql(`
  query GetCustomer(\$customerId: ID!) {
    getCustomer(customerId: \$customerId) {
      customerId
      customerName
      address
      contactPerson
      email
      phone
      status
      createdAt
      updatedAt
    }
  }
`);

export const listCustomers = graphql(`
  query ListCustomers(\$limit: Int, \$nextToken: String) {
    listCustomers(limit: \$limit, nextToken: \$nextToken) {
      items {
        customerId
        customerName
        contactPerson
        email
        status
        createdAt
      }
      nextToken
    }
  }
`);

export const customersByName = graphql(`
  query CustomersByName(\$customerName: String!, \$limit: Int, \$nextToken: String) {
    customersByName(customerName: \$customerName, limit: \$limit, nextToken: \$nextToken) {
      items {
        customerId
        customerName
        contactPerson
        status
      }
      nextToken
    }
  }
`);