// src/types/react-i18next.d.ts
import 'react-i18next';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    // returnNull을 false로 설정하면 undefined 대신 키를 반환합니다
    returnNull: false;
    // 결과 타입을 string으로 지정
    resources: {
      translation: Record<string, string>;
    };
  }
}