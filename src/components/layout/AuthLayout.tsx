// src/components/layout/AuthLayout.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Box } from '@cloudscape-design/components';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  // 스타일 객체를 분리하여 가독성 개선
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      minHeight: '100vh',
      backgroundColor: '#f2f3f3',
      backgroundImage: 'linear-gradient(to bottom, #f8f8f8, #e9f0f8)'
    },
    header: {
      width: '100%',
      backgroundColor: '#232f3e', // AWS 네이비 블루 컬러
      color: '#ffffff',
      padding: '12px 20px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      position: 'relative' as const,
      zIndex: 100,
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center'
    },
    headerContent: {
      maxWidth: '1200px',
      width: '100%',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      color: '#ffffff'
    },
    logoImage: {
      height: '30px',
      filter: 'brightness(0) invert(1)' // 로고가 흰색이 아니면 흰색으로 변환
    },
    logoText: {
      marginLeft: '12px',
      fontSize: '18px',
      fontWeight: 'bold'
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px'
    },
    formContainer: {
      maxWidth: '420px',
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '32px',
    },
    footer: {
      width: '100%',
      borderTop: '1px solid #e9ebed',
      padding: '16px 0',
      backgroundColor: '#f8f8f8',
      textAlign: 'center' as const,
      color: '#687078',
      fontSize: '12px'
    },
    footerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px'
    }
  };

  return (
    <div style={styles.container}>
      {/* 헤더 부분 */}
      <div id="auth-header" style={styles.header}>
        <div style={styles.headerContent}>
          <Link to="/" style={styles.logo}>
            <img
              src="/assets/aws.png" // 경로 수정 
              alt="AWS Logo"
              style={styles.logoImage}
            />
            <span style={styles.logoText}>
              AWS T&C 교육 포털
            </span>
          </Link>

          {/* 로그인 페이지에서는 헤더 우측에 버튼 불필요 */}
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <main style={styles.mainContent}>
        {children}
      </main>
      
      {/* 푸터 영역 */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <Box>© {new Date().getFullYear()} Amazon Web Services, Inc. or its affiliates. All rights reserved.</Box>
          <Box margin={{ top: 'xs' }}>
            <Link to="/privacy" style={{ color: '#687078', marginRight: '16px', textDecoration: 'none' }}>
              개인정보처리방침
            </Link>
            <Link to="/terms" style={{ color: '#687078', textDecoration: 'none' }}>
              이용약관
            </Link>
          </Box>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;