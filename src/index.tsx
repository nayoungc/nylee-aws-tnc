// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import App from './App';
import './styles/theme.css';
import './styles/auth.css';
import './i18n';

// Amplify 설정
console.log('Amplify 설정 적용 시작');
Amplify.configure(awsExports);
console.log('Amplify 설정 완료', Amplify.getConfig());

// 디버그 정보 래퍼 컴포넌트
const AppWithDebugInfo = () => {
  const [showDebugPanel, setShowDebugPanel] = React.useState(false);
  
  return (
    <>
      {/* 디버그 패널 토글 버튼 */}
      <div style={{ position: 'fixed', top: '5px', right: '5px', zIndex: 9999 }}>
        <button 
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          style={{ 
            padding: '5px 10px', 
            background: '#333', 
            color: 'white', 
            border: 'none', 
            borderRadius: '3px', 
            cursor: 'pointer' 
          }}
        >
          {showDebugPanel ? '디버그 정보 숨기기' : '디버그 정보 보기'}
        </button>
      </div>
      
      {/* 디버그 패널 */}
      {showDebugPanel && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          padding: '15px',
          borderRadius: '4px',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflow: 'auto',
          zIndex: 9998,
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <h3>Amplify 설정 정보</h3>
          <div>
            <strong>Auth:</strong> {Amplify.getConfig().Auth ? '설정됨 ✅' : '없음 ❌'}
          </div>
          <div>
            <strong>API:</strong> {Amplify.getConfig().API ? '설정됨 ✅' : '없음 ❌'}
          </div>
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={async () => {
                try {
                  const { generateClient } = await import('aws-amplify/api');
                  const client = generateClient();
          
                  
                  // GraphQL 스키마 정보 요청
                  const introspectionQuery = `
                    query IntrospectionQuery {
                      __schema {
                        queryType {
                          name
                          fields {
                            name
                            description
                          }
                        }
                        mutationType {
                          name
                          fields {
                            name
                            description
                          }
                        }
                      }
                    }
                  `;
                  
                  const result = await client.graphql({
                    query: introspectionQuery,
                    authMode: 'userPool'
                  });

                  // 타입 가드 추가
                  if ('data' in result && result.data) {
                    console.log('사용 가능한 쿼리:', result.data.__schema?.queryType?.fields);
                    alert('콘솔에서 사용 가능한 쿼리 목록을 확인하세요.');
                  } else {
                    throw new Error('스키마 정보를 가져올 수 없습니다');
                  }
                  console.log('사용 가능한 쿼리:', result.data.__schema.queryType.fields);
                  alert('콘솔에서 사용 가능한 쿼리 목록을 확인하세요.');
                } catch (err) {
                  console.error('스키마 확인 오류:', err);
                  alert('스키마 확인 실패: ' + (err instanceof Error ? err.message : String(err)));
                }
              }}
              style={{
                padding: '5px 10px',
                background: '#0066cc',
                border: 'none',
                borderRadius: '3px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              API 스키마 확인
            </button>
          </div>
        </div>
      )}
      
      {/* 실제 앱 컴포넌트 */}
      <App />
    </>
  );
};

// 렌더링
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithDebugInfo />
  </React.StrictMode>
);