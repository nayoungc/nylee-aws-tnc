// src/main.tsx 또는 src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import './i18n'; // i18n 설정 임포트

// i18n을 전역적으로 접근할 수 있도록 window 객체에 추가
import i18n from './i18n';
declare global {
  interface Window {
    i18n: typeof i18n;
  }
}
window.i18n = i18n;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);