// src/types/i18next.d.ts
import { TFunction as OriginalTFunction } from 'react-i18next';

declare module 'react-i18next' {
  export interface TFunction extends OriginalTFunction {
    (key: string | string[], options?: any): string;
  }
}