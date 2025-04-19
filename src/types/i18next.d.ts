import 'react-i18next';

declare module 'react-i18next' {
  interface TFunction {
    (key: string | string[], options?: any): string;
  }
}