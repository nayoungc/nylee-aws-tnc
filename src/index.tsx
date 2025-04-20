// index.tsx
import React, { useState, Suspense } from 'react';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { createRoot } from 'react-dom/client';
import './styles/theme.css';
import './styles/auth.css';
import './i18n';

// Amplify 설정
console.log('Amplify 설정 적용 시작');
Amplify.configure(awsExports);
console.log('Amplify 설정 완료', Amplify.getConfig());

// 오류 상태 추적을 위한 래퍼 컴포넌트
const AppWithErrorHandling = () => {
  const [error, setError] = useState<Error | null>(null);
  
  // 실제 App 컴포넌트를 동적으로 임포트
  const App = React.lazy(() => import('./App')
    .catch(e => {
      console.error('App 로딩 실패:', e);
      setError(e);
      // 빈 모듈 반환하여 렌더링 오류 방지
      return { default: () => null };
    })
  );
  
  if (error) {
    return (
      <div style={{ padding: '20px', margin: '10px', border: '1px solid red' }}>
        <h2>앱 로딩 중 오류 발생</h2>
        <pre>{error.message}</pre>
        <button onClick={() => window.location.reload()}>
          새로고침
        </button>
      </div>
    );
  }
  
  return (
    <Suspense fallback={
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>앱 로딩 중...</h2>
      </div>
    }>
      <App />
    </Suspense>
  );
};

// 손상된 컴포넌트가 있는지 확인할 수 있는 테스트 스위치 추가
const RootComponent = () => {
  const [showRealApp, setShowRealApp] = useState(false);
  
  if (!showRealApp) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>테스트 페이지</h1>
        <p>Amplify 설정이 완료되었습니다!</p>
        <button 
          onClick={() => setShowRealApp(true)}
          style={{
            padding: '10px 20px',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          실제 앱 보기
        </button>
      </div>
    );
  }
  
  return <AppWithErrorHandling />;
};

// 렌더링
createRoot(document.getElementById('root')!).render(<RootComponent />);