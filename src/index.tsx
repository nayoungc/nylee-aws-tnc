// src/index.tsx
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import App from './App';
// import { AppProvider } from './contexts/AppContext';
// import { Amplify } from 'aws-amplify';
// import { AuthProvider } from './hooks/useAuth';
// import './i18n';
// import '@cloudscape-design/global-styles/index.css';


// // Amplify v6 형식에 맞게 구성
// Amplify.configure({
//   // v6에서는 Auth 구성이 변경됨
//   Auth: {
//     Cognito: {
//       userPoolId: "us-east-1_AFeIVnWIU",
//       userPoolClientId: "6tdhvgmafd2uuhbc2naqg96g12",
//       // identityPoolId는 사용하지 않으므로 생략
//     }
//   },
//   Storage: {
//     S3: {
//       bucket: "nylee-aws-tnc",
//       region: "us-east-1"
//     }
//   },
//   API: {
//     GraphQL: {
//       endpoint: "https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql",
//       region: "us-east-1",
//       defaultAuthMode: "userPool",
      
//     }
//   }
// });

// // 디버깅을 위한 로그 출력
// console.log('Amplify 구성 완료');

// const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
// root.render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <AuthProvider>
//         <AppProvider>
//           <App />
//         </AppProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   </React.StrictMode>
// );


// src/index.tsx
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import App from './App';
// import { AppProvider } from './contexts/AppContext';
// import { Amplify } from 'aws-amplify';
// import { AuthProvider } from './hooks/useAuth';
// import './i18n';

// // amplify_outputs.json 파일 임포트
// import amplifyConfig from './amplify_outputs.json';

// // Amplify 구성 - 타입 단언으로 타입 오류 우회
// Amplify.configure(amplifyConfig as any);

// console.log('Amplify 구성 완료');

// const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
// root.render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <AuthProvider>
//         <AppProvider>
//           <App />
//         </AppProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   </React.StrictMode>
// );

import { Amplify } from 'aws-amplify';
import config from './aws-exports.js';

Amplify.configure(config);