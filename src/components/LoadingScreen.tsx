// src/components/LoadingScreen.tsx
import React from 'react';
import { Box, SpaceBetween } from '@cloudscape-design/components';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = '로딩 중...' }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <SpaceBetween direction="vertical" size="s">
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #0972d3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <Box textAlign="center" fontSize="heading-s">
          {message}
        </Box>
      </SpaceBetween>
    </div>
  );
};

export default LoadingScreen;