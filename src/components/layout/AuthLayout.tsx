// src/components/layout/AuthLayout.tsx
import React from 'react';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface AuthLayoutProps {
  children: React.ReactNode;
  titleKey?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  titleKey = 'auth_layout_title'
}) => {
  const { t } = useAppTranslation();
  
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f8f8f8',
        padding: '20px'
      }}
      role="main"
      aria-label={t(titleKey)}
    >
      <div className="auth-container">
        <h1 className="auth-title">
          {t(titleKey)}
        </h1>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;