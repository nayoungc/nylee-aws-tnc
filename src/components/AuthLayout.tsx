import React, { ReactNode } from 'react';
import { Box, Container, SpaceBetween } from '@cloudscape-design/components';

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
      backgroundColor: '#f2f4f4'
    }}>
      <Box 
        padding="l" 
        textAlign="center" 
        margin={{ bottom: "l" }}
      >
        <img src="/logo.png" alt="AWS English Practice" width="120" />
      </Box>
      
      <div style={{ width: '100%', maxWidth: '450px' }}>
        <Container>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '20px'
          }}>
            <SpaceBetween size="l">
              {children}
            </SpaceBetween>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AuthLayout;