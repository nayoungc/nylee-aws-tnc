import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import AWS from 'aws-sdk'; 
import { fetchAuthSession } from 'aws-amplify/auth';
import App from './App';
import './styles/theme.css';
import './styles/auth.css';
import './i18n';

import awsExports from './aws-exports';

// AWS 자격 증명을 저장할 전역 변수
let awsCredentials: AWS.Credentials | null = null;
let credentialsInitialized = false;

// Amplify 설정
console.log('Amplify 설정 적용 시작');
try {
  Amplify.configure(awsExports);
  console.log('Amplify Gen 2 설정 완료', Amplify.getConfig());
  
  // AWS SDK 리전 설정 (리전은 바로 설정 가능)
  const region = awsExports.API?.GraphQL?.region || 'us-east-1';
  AWS.config.region = region;
  console.log('AWS SDK 리전 설정:', region);
  
  // AWS 서비스 사용을 위한 헬퍼 함수들
  // 자격 증명 초기화 함수
  async function initializeCredentials(): Promise<boolean> {
    if (credentialsInitialized && awsCredentials) return true;
    
    try {
      const session = await fetchAuthSession();
      if (session.credentials) {
        awsCredentials = new AWS.Credentials({
          accessKeyId: session.credentials.accessKeyId,
          secretAccessKey: session.credentials.secretAccessKey,
          sessionToken: session.credentials.sessionToken
        });
        
        // AWS SDK 글로벌 설정에도 적용
        AWS.config.credentials = awsCredentials;
        
        credentialsInitialized = true;
        console.log('AWS SDK 자격 증명 설정 완료');
        return true;
      } else {
        console.error('세션에서 자격 증명을 찾을 수 없음');
        return false;
      }
    } catch (err) {
      console.error('AWS 자격 증명 설정 실패:', err);
      return false;
    }
  }
  
  // 초기 자격 증명 설정 시도
  initializeCredentials();
  
} catch (error) {
  console.error('Amplify 설정 실패:', error);
}

// AWS 서비스 생성을 위한 함수 추가
export async function createAWSService<T>(ServiceClass: new (config: AWS.ServiceConfigurationOptions) => T): Promise<T> {
  await initializeCredentials();
  
  if (!awsCredentials) {
    throw new Error('AWS 자격 증명을 설정할 수 없습니다');
  }
  
  return new ServiceClass({
    credentials: awsCredentials,
    region: AWS.config.region
  });
}

// TypeScript 타입 선언 추가
declare global {
  interface Window {
    updateAWSCredentials: () => Promise<boolean>;
    getAWSCredentials: () => AWS.Credentials | null;
    createAWSService: typeof createAWSService;
  }
}

// 전역 함수로 등록
window.updateAWSCredentials = initializeCredentials;
window.getAWSCredentials = () => awsCredentials;
window.createAWSService = createAWSService;

// 디버그 정보 래퍼 컴포넌트
const AppWithDebugInfo = () => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [schemaInfo, setSchemaInfo] = useState<any>(null);
  const [awsStatus, setAwsStatus] = useState<string>('초기화 중...');

  // 자격 증명 상태 확인
  useEffect(() => {
    const checkCredentials = async () => {
      const hasCredentials = await initializeCredentials();
      setAwsStatus(hasCredentials ? '자격 증명 설정됨 ✅' : '자격 증명 없음 ❌');
    };
    
    checkCredentials();
  }, []);
  
  // IntrospectionQuery 정의
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
  
  return (
    <>
      {/* 디버그 패널 토글 버튼 */}
      <div style={{ position: 'fixed', bottom: '5px', right: '5px', zIndex: 9999 }}>
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
          <div>
            <strong>AWS SDK:</strong> {awsStatus}
          </div>
          <div>
            <strong>리전:</strong> {AWS.config.region || '설정되지 않음'}
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
          
          <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
            <button 
              onClick={async () => {
                try {
                  const { generateClient } = await import('aws-amplify/api');
                  const client = generateClient();
          
                  // Gen 2 방식으로 GraphQL 호출
                  const result = await client.graphql({
                    query: introspectionQuery,
                    authMode: 'userPool'  
                  });

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
            
            <button 
              onClick={async () => {
                const updated = await window.updateAWSCredentials();
                setAwsStatus(updated ? '자격 증명 갱신됨 ✅' : '자격 증명 갱신 실패 ❌');
              }}
              style={{
                padding: '5px 10px',
                background: '#009933',
                border: 'none',
                borderRadius: '3px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              AWS 자격 증명 갱신
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