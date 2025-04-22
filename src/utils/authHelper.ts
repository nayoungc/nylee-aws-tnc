// src/utils/authHelper.ts
import { getCurrentUser, signIn, signUp, signOut, confirmSignUp, resetPassword } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';

/**
 * 로그인 처리 함수
 */
export async function handleSignIn(username: string, password: string) {
  try {
    const signInResult = await signIn({ username, password });
    return {
      success: true,
      isSignedIn: signInResult.isSignedIn,
      nextStep: signInResult.nextStep
    };
  } catch (error) {
    console.error('로그인 오류:', error);
    return {
      success: false,
      error,
      message: error instanceof Error ? error.message : '로그인 실패'
    };
  }
}

/**
 * 인증된 API 클라이언트 가져오기
 */
export function getApiClient() {
  return generateClient();
}

/**
 * 현재 사용자 가져오기
 */
export async function checkAuthStatus() {
  try {
    const user = await getCurrentUser();
    return { isAuthenticated: true, user };
  } catch {
    return { isAuthenticated: false };
  }
}
