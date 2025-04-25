// src/services/authService.ts
import { signIn, signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

// Gen 2 스타일 로그인
export async function login(username: string, password: string) {
  try {
    const result = await signIn({
      username,
      password
    });
    return result;
  } catch (error) {
    console.error('로그인 오류:', error);
    throw error;
  }
}

// Gen 2 스타일 로그아웃
export async function logout() {
  try {
    await signOut();
  } catch (error) {
    console.error('로그아웃 오류:', error);
    throw error;
  }
}

// Gen 2 스타일 현재 사용자 정보 가져오기
export async function getCurrentUserInfo() {
  try {
    const currentUser = await getCurrentUser();
    const userAttributes = await fetchUserAttributes();
    return {
      user: currentUser,
      attributes: userAttributes
    };
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    return null;
  }
}