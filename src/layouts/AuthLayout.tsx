// src/layouts/AuthLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from '@cloudscape-design/components';

const AuthLayout: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f2f3f3'
    }}>
      {/* maxWidth를 제거하고 CloudScape에서 지원하는 size 속성 사용 */}
      <Container>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </Container>
    </div>
  );
};

export default AuthLayout;