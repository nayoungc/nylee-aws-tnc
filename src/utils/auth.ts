import { signIn, signUp, confirmSignUp, autoSignIn, fetchUserAttributes } from 'aws-amplify/auth';

export async function handleSignIn(username: string, password: string) {
  try {
    const signInOutput = await signIn({ 
      username, 
      password 
    });
    
    return signInOutput;
  } catch (error) {
    console.error('로그인 오류:', error);
    throw error;
  }
}

export async function handleSignUp(
  username: string,
  password: string,
  email: string,
  preferredLanguage: string,
  level: string
) {
  try {
    const signUpOutput = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email,
          'custom:preferredLanguage': preferredLanguage,
          'custom:level': level
        }
      }
    });
    
    return signUpOutput;
  } catch (error) {
    console.error('회원가입 오류:', error);
    throw error;
  }
}

export async function handleConfirmSignUp(username: string, confirmationCode: string) {
  try {
    const confirmSignUpOutput = await confirmSignUp({
      username,
      confirmationCode
    });
    
    // 자동 로그인 시도
    await autoSignIn();
    
    return confirmSignUpOutput;
  } catch (error) {
    console.error('인증 코드 확인 오류:', error);
    throw error;
  }
}

export async function getUserAttributes() {
  try {
    const userAttributes = await fetchUserAttributes();
    return userAttributes;
  } catch (error) {
    console.error('사용자 속성 가져오기 오류:', error);
    throw error;
  }
}
