// src/services/courseService.ts
import { generateClient } from 'aws-amplify/data';
import { v4 as uuidv4 } from 'uuid';
//import { Schema } from '../../amplify/data/resource';
import { CourseCatalog, CourseCatalogInput } from '@/models/catalog';

