// src/layouts/AuthLayout.tsx
import React, { ReactNode } from 'react';
import { Container, SpaceBetween } from '@cloudscape-design/components';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div style={{ 
      height: '100vh',
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'var(--color-background-layout-main)'
    }}>
      <div style={{ width: '100%', maxWidth: '450px' }}>
        <Container>
          <SpaceBetween size="l">
            {children}
          </SpaceBetween>
        </Container>
      </div>
    </div>
  );
};

export default AuthLayout;