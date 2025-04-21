// src/graphql/mutations/customer.ts
import { graphql } from '../../api';

export const createCustomer = graphql(`
  mutation CreateCustomer(\$input: CreateCustomerInput!) {
    createCustomer(input: \$input) {
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

export const updateCustomer = graphql(`
  mutation UpdateCustomer(\$input: UpdateCustomerInput!) {
    updateCustomer(input: \$input) {
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

export const deleteCustomer = graphql(`
  mutation DeleteCustomer(\$input: DeleteCustomerInput!) {
    deleteCustomer(input: \$input) {
      customerId
      customerName
    }
  }
`);