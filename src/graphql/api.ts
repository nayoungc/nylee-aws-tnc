// src/graphql/api.ts
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/schema';

export const client = generateClient<Schema>();