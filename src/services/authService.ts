// src/services/authService.ts
import { signIn, signOut, fetchUserAttributes, getCurrentUser, AuthUser, UserAttributeKey } from 'aws-amplify/auth';

// UserInfo 타입 정의 (훅과 일치시키기)
interface UserInfo {
  user: AuthUser;
  attributes: Partial<Record<UserAttributeKey, string>>;
}

// 현재 사용자 정보 가져오기
export async function getCurrentUserInfo(): Promise<UserInfo | null> {
  try {
    const currentUser = await getCurrentUser();
    const userAttributes = await fetchUserAttributes();
    
    return {
      user: currentUser,
      attributes: userAttributes,
    };
  } catch (error) {
    console.error('사용자 정보 가져오기 에러:', error);
    return null;
  }
}

// 로그인 함수
export async function login(username: string, password: string) {
  try {
    const signInResult = await signIn({
      username,
      password,
    });
    return signInResult;
  } catch (error) {
    console.error('로그인 에러:', error);
    throw error;
  }
}

// 로그아웃 함수
export async function logout() {
  try {
    await signOut();
  } catch (error) {
    console.error('로그아웃 에러:', error);
    throw error;
  }
}

// 사용자 권한 확인 (관리자 또는 강사인지)
export async function checkUserRole() {
  try {
    const attributes = await fetchUserAttributes();
    // 'custom:role' 속성으로 역할 확인 (사용자 풀에 해당 속성이 설정되어 있어야 함)
    const role = attributes['custom:role'] || '';
    
    return {
      isAdmin: role === 'admin',
      isInstructor: role === 'instructor',
      role: role,
    };
  } catch (error) {
    console.error('권한 확인 에러:', error);
    return {
      isAdmin: false,
      isInstructor: false,
      role: '',
    };
  }
}
