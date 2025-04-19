// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  handleSignIn, 
  handleSignUp, 
  refreshAuthToken,
  getCurrentAuthState,
  AuthState 
} from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 인증 상태 확인
  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const currentState = await getCurrentAuthState();
      setAuthState(currentState);
    } catch (error) {
      setAuthState({ isAuthenticated: false });
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그인
  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const result = await handleSignIn(username, password);
      
      if (result.isSignedIn) {
        await checkAuth();
        return { success: true, data: result };
      }
      
      return { success: false, data: result };
    } catch (error) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  // 로그아웃
  const logout = useCallback(() => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userAttributes');
    localStorage.removeItem('lastLoginTime');
    setAuthState({ isAuthenticated: false });
    navigate('/signin');
  }, [navigate]);

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    authState,
    loading,
    login,
    logout,
    checkAuth
  };
}