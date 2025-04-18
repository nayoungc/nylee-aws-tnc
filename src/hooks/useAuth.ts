import { useEffect, useState } from 'react';
import { fetchAuthSession, signIn, signOut } from 'aws-amplify/auth';

// Amplify Gen 2 방식의 사용자 정보 타입 정의
interface AuthUser {
  sub: string;
  email?: string;
  name?: string;
  'custom:role'?: string;
  [key: string]: any;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const session = await fetchAuthSession();
      // Amplify Gen 2에서는 idToken의 payload에 사용자 정보가 들어있음
      setUser(session.tokens?.idToken?.payload as AuthUser || null);
    } catch (error) {
      console.error('인증 세션 확인 오류:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(username: string, password: string) {
    try {
      // Amplify Gen 2의 signIn API 사용
      const signInOutput = await signIn({ username, password });
      
      if (signInOutput.isSignedIn) {
        await checkUser(); // 사용자 정보 갱신
        return { success: true };
      }
      
      if (signInOutput.nextStep) {
        // MFA나 추가 인증 단계가 필요한 경우
        return { 
          success: false, 
          nextStep: signInOutput.nextStep 
        };
      }
      
      return { success: false };
    } catch (error) {
      console.error('로그인 오류:', error);
      return { 
        success: false, 
        error 
      };
    }
  }

  async function logout() {
    try {
      await signOut();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('로그아웃 오류:', error);
      return { 
        success: false, 
        error 
      };
    }
  }

  return { user, loading, login, logout };
}