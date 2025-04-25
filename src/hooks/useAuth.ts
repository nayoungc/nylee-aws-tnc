// src/hooks/useAuth.ts
/*
Amplify v6(Gen 2)에서 사용 가능한 auth 이벤트 목록:

signedIn - 사용자 로그인 성공
signedOut - 사용자 로그아웃 성공
tokenRefresh - 토큰 새로고침 성공
tokenRefresh_failure - 토큰 새로고침 실패
signInWithRedirect - 리디렉션 로그인 시작
signInWithRedirect_failure - 리디렉션 로그인 실패
customOAuthState - 커스텀 OAuth 상태
*/
import { useState, useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUserInfo, login, logout } from '@services/authService';
import { AuthUser, UserAttributeKey } from 'aws-amplify/auth';


export interface UserInfo {
  user: AuthUser;
  attributes: Partial<Record<UserAttributeKey, string>>;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: UserInfo | null;
  isAdmin: boolean;
  isInstructor: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userInfo: null,
    isAdmin: false,
    isInstructor: false,
  });

  useEffect(() => {
    // 초기 인증 상태 확인
    checkAuthState();

    // Auth 이벤트 리스너 설정 (Gen 2 업데이트된 이벤트 이름)
    const listener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkAuthState();
          break;
        case 'signedOut':
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            userInfo: null,
            isAdmin: false,
            isInstructor: false,
          });
          break;
        default:
          break;
      }
    });

    return () => {
      listener();
    };
  }, []);

  const checkAuthState = async () => {
    try {
      const userInfo = await getCurrentUserInfo();
      
      if (userInfo) {
        // 역할 확인 (custom:role 속성 활용)
        const role = userInfo.attributes['custom:role'] || '';
        
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          userInfo: userInfo,
          isAdmin: role === 'admin',
          isInstructor: role === 'instructor',
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          userInfo: null,
          isAdmin: false,
          isInstructor: false,
        });
      }
    } catch (error) {
      console.error('인증 상태 확인 중 오류:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        userInfo: null,
        isAdmin: false,
        isInstructor: false,
      });
    }
  };

  const loginUser = async (username: string, password: string) => {
    try {
      await login(username, password);
      await checkAuthState();
      return true;
    } catch (error) {
      console.error('로그인 에러:', error);
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        userInfo: null,
        isAdmin: false,
        isInstructor: false,
      });
    } catch (error) {
      console.error('로그아웃 에러:', error);
      throw error;
    }
  };

  return {
    ...authState,
    login: loginUser,
    logout: logoutUser,
    refreshAuthState: checkAuthState,
  };
}