// src/types/global.d.ts
import i18next from 'i18next';

declare global {
  interface Window {
    i18n: typeof i18next;
  }
}

// 이 파일이 모듈로 취급되도록 빈 export 추가
export {};