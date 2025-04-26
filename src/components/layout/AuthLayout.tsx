// src/components/layout/AuthLayout.tsx
import React from 'react';
import { Box, Container, Header } from '@cloudscape-design/components';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-layout-root" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f2f3f3',
      backgroundImage: 'linear-gradient(to bottom, #f8f8f8, #e9f0f8)'
    }}>
      {/* 헤더 영역 */}
      <div className="auth-header" style={{
        backgroundColor: '#232f3e',
        padding: '16px 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <Container>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img
                src="/images/aws-white.png"
                alt="AWS Logo"
                style={{ height: '30px', marginRight: '12px' }}
              />
              <span style={{ 
                color: 'white', 
                fontSize: '18px', 
                fontWeight: 500 
              }}>
                AWS Management Console
              </span>
            </Link>
          </div>
        </Container>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="auth-content" style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px'
      }}>
        <div className="auth-card" style={{
          maxWidth: '420px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          transition: 'transform 0.2s ease-in-out',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          {children}
        </div>
      </div>

      {/* 푸터 영역 */}
      <div className="auth-footer" style={{
        borderTop: '1px solid #e9ebed',
        padding: '24px 0',
        backgroundColor: '#fff'
      }}>
        <Container>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            fontSize: '12px',
            color: '#687078'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <a href="https://aws.amazon.com/privacy/" style={{ color: '#0073bb', marginRight: '16px', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="https://aws.amazon.com/terms/" style={{ color: '#0073bb', marginRight: '16px', textDecoration: 'none' }}>Terms of Use</a>
              <a href="https://aws.amazon.com/contact-us/" style={{ color: '#0073bb', textDecoration: 'none' }}>Contact Us</a>
            </div>
            <div>
              © {new Date().getFullYear()}, Amazon Web Services, Inc. or its affiliates. All rights reserved.
            </div>
          </div>
        </Container>
      </div>

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .auth-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.12);
          }
          
          @media (max-width: 480px) {
            .auth-card {
              padding: 24px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AuthLayout;