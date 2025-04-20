// index.tsx
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { createRoot } from 'react-dom/client';

// Amplify 설정
console.log('Amplify 설정 적용 시작');
Amplify.configure(awsExports);
console.log('Amplify 설정 완료', Amplify.getConfig());

// 앱 컴포넌트 대신 간단한 테스트 컴포넌트 렌더링
const TestApp = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>테스트 페이지</h1>
      <p>Amplify 설정이 완료되었습니다!</p>
      <button onClick={() => alert('버튼이 작동합니다!')}>
        테스트 버튼
      </button>
    </div>
  );
};

// 테스트 컴포넌트 렌더링
createRoot(document.getElementById('root')!).render(<TestApp />);