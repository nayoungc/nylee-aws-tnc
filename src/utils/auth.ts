// src/utils/auth.ts
import { signIn, signUp, confirmSignUp, autoSignIn, confirmSignIn, signOut, fetchUserAttributes } from 'aws-amplify/auth';
import { ConfirmSignUpOutput, SignInOutput } from '@aws-amplify/auth';

// 확장된 반환 타입을 정의
interface ExtendedConfirmSignUpOutput extends ConfirmSignUpOutput {
  autoSignIn?: SignInOutput;
}

// 회원가입 함수
export async function handleSignUp(
  username: string,
  password: string,
  email: string,
  phoneNumber?: string,
  userAttributes?: Record<string, string>
) {
  try {
    const signUpOutput = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email,
          ...(phoneNumber && { phone_number: phoneNumber }),
          ...userAttributes,
        },
        autoSignIn: {
          authFlowType: 'USER_AUTH'
        }
      }
    });
    
    console.log('회원가입 응답:', signUpOutput);
    return signUpOutput;
  } catch (error) {
    console.error('회원가입 오류:', error);
    throw error;
  }
}

// 회원가입 확인 함수
export async function handleConfirmSignUp(username: string, confirmationCode: string): Promise<ExtendedConfirmSignUpOutput> {
  try {
    const confirmSignUpOutput = await confirmSignUp({
      username,
      confirmationCode
    });
    
    console.log('회원가입 확인 응답:', confirmSignUpOutput);
    
    // 자동 로그인이 필요한 경우
    if (confirmSignUpOutput.nextStep?.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
      console.log('자동 로그인 시작');
      const autoSignInOutput = await autoSignIn();
      console.log('자동 로그인 응답:', autoSignInOutput);
      return { ...confirmSignUpOutput, autoSignIn: autoSignInOutput };
    }
    
    return confirmSignUpOutput;
  } catch (error) {
    console.error('회원가입 확인 오류:', error);
    throw error;
  }
}

// 로그인 함수
export async function handleSignIn(username: string, password: string) {
  try {
    const signInOutput = await signIn({ 
      username, 
      password 
    });
    
    console.log('로그인 응답:', signInOutput);
    return signInOutput;
  } catch (error) {
    console.error('로그인 오류:', error);
    throw error;
  }
}

// 비밀번호 변경 확인 함수
export async function handleConfirmNewPassword(newPassword: string) {
  try {
    const confirmSignInOutput = await confirmSignIn({
      challengeResponse: newPassword
    });
    
    return confirmSignInOutput;
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    throw error;
  }
}

// 로그아웃 함수
export async function handleSignOut() {
  try {
    await signOut();
    return { success: true };
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return { success: false, error };
  }
}

// 사용자 정보 가져오기 함수
export async function getUserAttributes() {
  try {
    const attributes = await fetchUserAttributes();
    return attributes;
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    throw error;
  }
}