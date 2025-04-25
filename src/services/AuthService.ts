// src/services/AuthService.ts
import { 
  signIn, 
  signOut, 
  getCurrentUser, 
  fetchUserAttributes,
  confirmSignUp,
  signUp
} from 'aws-amplify/auth';

// 현재 사용자 정보 조회
export const getCurrentUserInfo = async () => {
  try {
    const user = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    return { 
      success: true, 
      user: { ...user, attributes }
    };
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return { success: false, error };
  }
};

// 로그인
export const login = async (username: string, password: string) => {
  try {
    const result = await signIn({ username, password });
    return { success: true, user: result };
  } catch (error) {
    console.error('로그인 오류:', error);
    return { success: false, error };
  }
};

// 로그아웃
export const logout = async () => {
  try {
    await signOut();
    return { success: true };
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return { success: false, error };
  }
};

// 회원가입
export const register = async (username: string, password: string, email: string) => {
  try {
    // 원래 함수 이름 그대로 사용
    const result = await signUp({
      username,
      password,
      options: {
        userAttributes: { email }
      }
    });
    return { success: true, result };
  } catch (error) {
    console.error('회원가입 오류:', error);
    return { success: false, error };
  }
};

// 회원가입 확인
export const confirmUserSignUp = async (username: string, confirmationCode: string) => {
  try {
    await confirmSignUp({ username, confirmationCode });
    return { success: true };
  } catch (error) {
    console.error('회원가입 확인 오류:', error);
    return { success: false, error };
  }
};

// 비밀번호 재설정 요청
// export const requestPasswordReset = async (username: string) => {
//   try {
//     await forgotPassword({ username });
//     return { success: true };
//   } catch (error) {
//     console.error('비밀번호 재설정 요청 오류:', error);
//     return { success: false, error };
//   }
// };

// 비밀번호 재설정 완료
// export const completePasswordReset = async (username: string, confirmationCode: string, newPassword: string) => {
//   try {
//     await forgotPasswordSubmit({ username, confirmationCode, newPassword });
//     return { success: true };
//   } catch (error) {
//     console.error('비밀번호 재설정 완료 오류:', error);
//     return { success: false, error };
//   }
// };

// 기본 내보내기 - 함수 이름 매핑을 통일
const AuthService = {
  getCurrentUserInfo,
  login,
  logout,
  register,
  confirmSignUp: confirmUserSignUp,
  // requestPasswordReset,
  // completePasswordReset
};

export default AuthService;