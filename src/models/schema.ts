// src/models/schema.ts
export const schema = {
  Customer: {
    name: "Customer",
    fields: {
      id: { type: "ID", isRequired: true },
      customerName: { type: "String", isRequired: true },
      notes: { type: "String" },
      email: { type: "String" },
      phone: { type: "String" },
      organization: { type: "String" },
      createdAt: { type: "AWSDateTime" },
      updatedAt: { type: "AWSDateTime" },
      locale: { type: "String" },
      translations: { type: "Collection", itemType: { type: "CustomerTranslation" } }
    },
    primaryKeyInfo: { name: "id", type: "ID" }
  },
  CustomerTranslation: {
    name: "CustomerTranslation",
    fields: {
      id: { type: "ID", isRequired: true },
      locale: { type: "String", isRequired: true },
      customerName: { type: "String" },
      notes: { type: "String" },
      customerId: { type: "ID", isRequired: true },
      customer: { type: "Customer" }
    },
    primaryKeyInfo: { name: "id", type: "ID" }
  },
  CourseCatalog: {
    name: "CourseCatalog",
    fields: {
      id: { type: "ID", isRequired: true },
      title: { type: "String", isRequired: true },
      awsCode: { type: "String" },
      version: { type: "String" },
      durations: { type: "Int" },
      level: { type: "String" },
      description: { type: "String" },
      category: { type: "String" },
      tags: { type: "Collection", itemType: { type: "String" } },
      prerequisites: { type: "Collection", itemType: { type: "String" } },
      objectives: { type: "Collection", itemType: { type: "String" } },
      createdAt: { type: "AWSDateTime" },
      updatedAt: { type: "AWSDateTime" },
      createdBy: { type: "String" },
      status: { type: "CatalogStatus" },
      locale: { type: "String" },
      translations: { type: "Collection", itemType: { type: "CatalogTranslation" } }
    },
    primaryKeyInfo: { name: "id", type: "ID" }
  },
  CatalogTranslation: {
    name: "CatalogTranslation",
    fields: {
      id: { type: "ID", isRequired: true },
      locale: { type: "String", isRequired: true },
      title: { type: "String" },
      description: { type: "String" },
      prerequisites: { type: "Collection", itemType: { type: "String" } },
      objectives: { type: "Collection", itemType: { type: "String" } },
      catalogId: { type: "ID", isRequired: true },
      catalog: { type: "CourseCatalog" }
    },
    primaryKeyInfo: { name: "id", type: "ID" }
  },
  Instructor: {
    name: "Instructor",
    fields: {
      id: { type: "ID", isRequired: true },
      username: { type: "String", isRequired: true },
      email: { type: "String", isRequired: true },
      name: { type: "String", isRequired: true },
      profile: { type: "String" },
      specialties: { type: "Collection", itemType: { type: "String" } },
      status: { type: "InstructorStatus" },
      createdAt: { type: "AWSDateTime" },
      updatedAt: { type: "AWSDateTime" },
      locale: { type: "String" },
      translations: { type: "Collection", itemType: { type: "InstructorTranslation" } }
    },
    primaryKeyInfo: { name: "id", type: "ID" }
  },
  InstructorTranslation: {
    name: "InstructorTranslation",
    fields: {
      id: { type: "ID", isRequired: true },
      instructorId: { type: "ID", isRequired: true },
      locale: { type: "String", isRequired: true },
      name: { type: "String" },
      profile: { type: "String" }
    },
    primaryKeyInfo: { name: "id", type: "ID" }
  }
} as const;

export type Schema = typeof schema;
export type Customer = Schema["Customer"]["fields"];
export type CustomerTranslation = Schema["CustomerTranslation"]["fields"];
export type CourseCatalog = Schema["CourseCatalog"]["fields"];
export type CatalogTranslation = Schema["CatalogTranslation"]["fields"];
export type Instructor = Schema["Instructor"]["fields"];
export type InstructorTranslation = Schema["InstructorTranslation"]["fields"];
export type CatalogStatus = "ACTIVE" | "DRAFT" | "ARCHIVED";
export type InstructorStatus = "ACTIVE" | "INACTIVE";

export const modelProvider = {
  schema: schema 
};