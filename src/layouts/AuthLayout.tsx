// src/layouts/AuthLayout.tsx
import React, { ReactNode } from 'react';
import { Container, SpaceBetween } from '@cloudscape-design/components';
import SimpleHeader from '@components/SimpleHeader'; // 간소화된 헤더 컴포넌트

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div style={{ 
      height: '100vh',
      display: 'flex', 
      flexDirection: 'column'
    }}>
      {/* 간소화된 헤더 추가 */}
      <SimpleHeader />
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--color-background-layout-main)'
      }}>
        <div style={{ width: '100%', maxWidth: '650px' }}>
          <Container>
            <SpaceBetween size="l">
              {children}
            </SpaceBetween>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;