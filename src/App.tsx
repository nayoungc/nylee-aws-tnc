// src/App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { useAuth } from './contexts/AuthContext';
import LoadingScreen from './components/LoadingScreen';

const App: React.FC = () => {
  const { loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen message="애플리케이션 로딩 중..." />;
  }
  
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;