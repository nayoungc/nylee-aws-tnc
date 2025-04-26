// amplify/data/resource.ts
import { type ClientSchema } from '@aws-amplify/backend';

export const schema = {
  CourseEvent: {
    primaryIndex: { partitionKey: 'id' },
    fields: {
      id: { type: 'ID', isRequired: true },
      title: { type: 'String', isRequired: true },
      description: { type: 'String' },
      startDate: { type: 'AWSDateTime', isRequired: true },
      endDate: { type: 'AWSDateTime', isRequired: true },
      time: { type: 'String', isRequired: true },
      instructorId: { type: 'ID', isRequired: true },
      locationId: { type: 'ID', isRequired: true },
      type: { type: 'String', isRequired: true }, // 'online' | 'offline'
      level: { type: 'String', isRequired: true }, // 'beginner' | 'intermediate' | 'advanced'
      maxSeats: { type: 'Int', isRequired: true },
      remainingSeats: { type: 'Int', isRequired: true },
      enrolledStudents: { type: 'String', isList: true },
      waitlistStudents: { type: 'String', isList: true },
      status: { type: 'String', isRequired: true } // 'scheduled' | 'canceled' | 'completed'
    }
  },
  Instructor: {
    primaryIndex: { partitionKey: 'id' },
    fields: {
      id: { type: 'ID', isRequired: true },
      name: { type: 'String', isRequired: true },
      email: { type: 'AWSEmail', isRequired: true },
      bio: { type: 'String' },
      specialties: { type: 'String', isList: true }
    }
  },
  Location: {
    primaryIndex: { partitionKey: 'id' },
    fields: {
      id: { type: 'ID', isRequired: true },
      name: { type: 'String', isRequired: true },
      address: { type: 'String', isRequired: true },
      capacity: { type: 'Int', isRequired: true },
      isVirtual: { type: 'Boolean', isRequired: true },
      facilities: { type: 'String', isList: true }
    }
  }
} ;