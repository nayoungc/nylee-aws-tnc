// src/components/layout/AuthLayout.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f2f3f3',
      backgroundImage: 'linear-gradient(to bottom, #f8f8f8, #e9f0f8)'
    }}>
      {/* 헤더 부분 - 확실한 배경색과 높이 지정 */}
      <header style={{
        width: '100%',
        backgroundColor: '#232f3e', // AWS 네이비 블루 컬러
        color: '#ffffff',
        padding: '12px 20px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        position: 'relative',
        zIndex: 100,
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link to="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: '#ffffff'
          }}>
            <img
              src="/images/aws-white.png" // 흰색 AWS 로고 (없으면 표준 로고를 사용하고 필터링)
              alt="AWS Logo"
              style={{ 
                height: '30px', 
                filter: 'brightness(0) invert(1)' // 이미지가 흰색이 아닐 경우 흰색으로 변환
              }}
            />
            <span style={{ 
              marginLeft: '12px', 
              fontSize: '18px', 
              fontWeight: 'bold' 
            }}>
              AWS Management Console
            </span>
          </Link>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: '420px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '32px',
        }}>
          {children}
        </div>
      </div>
      
      {/* 푸터 영역 */}
      <footer style={{
        width: '100%',
        borderTop: '1px solid #e9ebed',
        padding: '16px 0',
        backgroundColor: '#f8f8f8',
        textAlign: 'center',
        color: '#687078',
        fontSize: '12px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          padding: '0 20px' 
        }}>
          © {new Date().getFullYear()} Amazon Web Services, Inc. or its affiliates. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;