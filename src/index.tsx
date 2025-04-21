import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App';
import './styles/theme.css';
import './styles/auth.css';
import './i18n';

// Amplify Gen 2 설정 방식으로 변경
// aws-exports.js 대신 amplify_outputs.json 사용
//import outputs from '../amplify_outputs.json';
import awsExports from './aws-exports';

// GraphQL 스키마 정보 요청을 위한 쿼리
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

// Amplify 설정
console.log('Amplify 설정 적용 시작');
try {
  // Gen 2 방식으로 설정
  //Amplify.configure(outputs);
  Amplify.configure(awsExports); 
  console.log('Amplify Gen 2 설정 완료', Amplify.getConfig());
} catch (error) {
  console.error('Amplify 설정 실패:', error);
  
  // 폴백: 이전 방식으로 시도
  try {
    import('./aws-exports').then(module => {
      const awsExports = module.default;
      Amplify.configure(awsExports);
      console.log('Amplify Gen 1 설정으로 폴백 완료');
    });
  } catch (fallbackError) {
    console.error('Amplify 폴백 설정도 실패:', fallbackError);
  }
}

// 디버그 정보 래퍼 컴포넌트
const AppWithDebugInfo = () => {
  const [showDebugPanel, setShowDebugPanel] = React.useState(false);
  const [schemaInfo, setSchemaInfo] = React.useState<any>(null);
  
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
          
          {/* 스키마 정보 표시 */}
          {schemaInfo && (
            <div style={{ marginTop: '10px' }}>
              <h4>사용 가능한 쿼리:</h4>
              <ul style={{ maxHeight: '200px', overflow: 'auto' }}>
                {schemaInfo.map((field: any, index: number) => (
                  <li key={index}>{field.name}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={async () => {
                try {
                  const { generateClient } = await import('aws-amplify/api');
                  const client = generateClient();
          
                  // Gen 2 방식으로 GraphQL 호출
                  const result = await client.graphql({
                    query: introspectionQuery,
                    // 다양한 인증 모드 시도
                    authMode: 'apiKey'  // userPool, apiKey, iam 중 적절한 것으로 설정
                  });

                  // 타입 가드 추가
                  if ('data' in result && result.data && result.data.__schema?.queryType?.fields) {
                    const queryFields = result.data.__schema.queryType.fields;
                    console.log('사용 가능한 쿼리:', queryFields);
                    setSchemaInfo(queryFields);
                    alert(`\${queryFields.length}개의 쿼리를 찾았습니다. 디버그 패널에서 확인하세요.`);
                  } else {
                    throw new Error('스키마 정보를 가져올 수 없습니다');
                  }
                } catch (err) {
                  console.error('스키마 확인 오류:', err);
                  alert('스키마 확인 실패: ' + (err instanceof Error ? err.message : String(err)));
                  
                  // 다른 인증 모드 시도 제안
                  const tryAgain = window.confirm('다른 인증 모드로 시도해보시겠습니까? (apiKey 대신 userPool)');
                  if (tryAgain) {
                    try {
                      const { generateClient } = await import('aws-amplify/api');
                      const client = generateClient();
                      const result = await client.graphql({
                        query: introspectionQuery,  // 이제 전역으로 선언되어 있어 접근 가능
                        authMode: 'userPool'
                      });
                      
                      if ('data' in result && result.data && result.data.__schema?.queryType?.fields) {
                        const queryFields = result.data.__schema.queryType.fields;
                        console.log('사용 가능한 쿼리 (userPool):', queryFields);
                        setSchemaInfo(queryFields);
                        alert('userPool 인증으로 성공했습니다!');
                      }
                    } catch (fallbackErr) {
                      console.error('userPool 인증 시도 실패:', fallbackErr);
                    }
                  }
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