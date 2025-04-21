import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';

// 타입이 지정된 클라이언트 생성
export const client = generateClient<Schema>();