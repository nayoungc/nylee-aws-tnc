import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './components/SignIn';
import CourseCatalogPage from './pages/admin/CourseCatalogTab';
import CustomerTab from './pages/admin/CustomerTab';
import { useAuth } from './contexts/AuthContext';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      
      <Route path="/courses" element={
        <ProtectedRoute 
          authenticated={isAuthenticated} 
          redirectPath="/signin"
        >
          <CourseCatalogPage />
        </ProtectedRoute>
      } />
      
      <Route path="/customers" element={
        <ProtectedRoute 
          authenticated={isAuthenticated} 
          redirectPath="/signin"
        >
          <CustomerTab />
        </ProtectedRoute>
      } />
      
      <Route path="/" element={<Navigate to="/courses" />} />
    </Routes>
  );
};