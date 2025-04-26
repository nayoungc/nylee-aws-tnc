// src/componetns/layout/AuthLayout.tsx
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f2f3f3',
      backgroundImage: 'linear-gradient(to bottom, #f8f8f8, #e9f0f8)'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.1)',
        padding: '30px',
        marginBottom: '20px'
      }}>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;