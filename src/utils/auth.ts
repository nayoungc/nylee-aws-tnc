import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import type { GraphQLQuery, GraphQLResult } from '@aws-amplify/api';

// 인증된 API 클라이언트 반환 함수
export const getAuthenticatedApiClient = async () => {
  try {
    // 인증 확인만 수행
    await getCurrentUser();
    
    // API 클라이언트 생성 및 반환
    return generateClient();
  } catch (error) {
    console.error('인증된 API 클라이언트 생성 오류:', error);
    throw new Error('API 접근을 위한 인증이 필요합니다.');
  }
};

// GraphQL 쿼리 실행 헬퍼 함수
export const executeGraphQL = async <T = any>(
  query: string,
  variables?: Record<string, any>,
  authMode: 'apiKey' | 'userPool' | 'iam' | 'oidc' | 'lambda' = 'userPool'
): Promise<T> => {
  try {
    const client = await getAuthenticatedApiClient();
    
    // any로 타입 캐스팅하여 타입 오류 우회
    const response = await client.graphql({
      query,
      // @ts-ignore - variables 타입 오류 무시
      variables,
      authMode
    });
    
    // 응답 데이터 확인 및 반환
    if (response && 'data' in response && response.data) {
      return response.data as T;
    } else {
      throw new Error('GraphQL 응답에 데이터가 없습니다');
    }
  } catch (error) {
    console.error('GraphQL 쿼리 실행 오류:', error);
    throw error;
  }
};

// 회원가입 함수
export const handleSignUp = async (username: string, password: string, email: string, additionalFields?: Record<string, any>) => {
  try {
    const { signUp } = await import('aws-amplify/auth');
    const result = await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email,
          ...additionalFields
        },
        autoSignIn: true
      }
    });
    
    return {
      success: true,
      data: result,
      message: '회원가입에 성공했습니다. 이메일로 전송된 확인 코드를 입력하세요.',
      isComplete: result.isSignUpComplete,
      nextStep: result.nextStep
    };
  } catch (error) {
    console.error('회원가입 오류:', error);
    return {
      success: false,
      error,
      message: error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.'
    };
  }
};

// 로그인 함수
export const handleSignIn = async (username: string, password: string) => {
  try {
    const { signIn } = await import('aws-amplify/auth');
    const result = await signIn({
      username,
      password
    });
    
    return {
      success: true,
      data: result,
      message: '로그인에 성공했습니다.',
      isComplete: result.isSignedIn,
      nextStep: result.nextStep
    };
  } catch (error) {
    console.error('로그인 오류:', error);
    return {
      success: false,
      error,
      message: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.'
    };
  }
};

// 확인 코드 확인 함수
export const handleConfirmSignUp = async (username: string, confirmationCode: string) => {
  try {
    const { confirmSignUp } = await import('aws-amplify/auth');
    const result = await confirmSignUp({
      username,
      confirmationCode
    });
    
    // AWS Amplify v6에서는 상태를 isSignUpComplete로 확인
    const isCompleted = result.isSignUpComplete;
    
    return {
      success: true,
      data: result,
      message: '이메일 확인이 완료되었습니다. 이제 로그인할 수 있습니다.',
      isComplete: isCompleted,
      nextStep: result.nextStep
    };
  } catch (error) {
    console.error('확인 코드 확인 오류:', error);
    return {
      success: false,
      error,
      message: error instanceof Error ? error.message : '확인 코드 확인 중 오류가 발생했습니다.'
    };
  }
};

// 확인 코드 재전송 함수
export const handleResendConfirmationCode = async (username: string) => {
  try {
    const { resendSignUpCode } = await import('aws-amplify/auth');
    const result = await resendSignUpCode({
      username
    });
    
    return {
      success: true,
      data: result,
      message: '확인 코드가 재전송되었습니다. 이메일을 확인해주세요.',
      destination: result.destination,
      deliveryMedium: result.deliveryMedium
    };
  } catch (error) {
    console.error('확인 코드 재전송 오류:', error);
    return {
      success: false,
      error,
      message: error instanceof Error ? error.message : '확인 코드 재전송 중 오류가 발생했습니다.'
    };
  }
};

// 비밀번호 재설정 요청 함수
export const handleForgotPassword = async (username: string) => {
  try {
    const { resetPassword } = await import('aws-amplify/auth');
    const result = await resetPassword({ username });
    
    return {
      success: true,
      data: result,
      message: '비밀번호 재설정 코드가 이메일로 전송되었습니다.',
      nextStep: result.nextStep
    };
  } catch (error) {
    console.error('비밀번호 재설정 요청 오류:', error);
    return {
      success: false,
      error,
      message: error instanceof Error ? error.message : '비밀번호 재설정 요청 중 오류가 발생했습니다.'
    };
  }
};

// 비밀번호 재설정 확인 함수
export const handleConfirmForgotPassword = async (username: string, newPassword: string, confirmationCode: string) => {
  try {
    const { confirmResetPassword } = await import('aws-amplify/auth');
    await confirmResetPassword({
      username,
      newPassword,
      confirmationCode
    });
    
    return {
      success: true,
      message: '비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인하세요.'
    };
  } catch (error) {
    console.error('비밀번호 재설정 확인 오류:', error);
    return {
      success: false,
      error,
      message: error instanceof Error ? error.message : '비밀번호 재설정 확인 중 오류가 발생했습니다.'
    };
  }
};

// 로그아웃 함수
export const handleSignOut = async (global: boolean = false) => {
  try {
    const { signOut } = await import('aws-amplify/auth');
    await signOut({ global });
    
    return {
      success: true,
      message: '로그아웃되었습니다.'
    };
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return {
      success: false,
      error,
      message: error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.'
    };
  }
};

// 현재 인증된 사용자 가져오기
export const fetchCurrentUser = async () => {
  try {
    const { getCurrentUser } = await import('aws-amplify/auth');
    const user = await getCurrentUser();
    
    return {
      success: true,
      user,
      message: '사용자 정보를 성공적으로 가져왔습니다.'
    };
  } catch (error) {
    console.error('사용자 정보 가져오기 오류:', error);
    return {
      success: false,
      error,
      message: error instanceof Error ? error.message : '사용자 정보를 가져오는 중 오류가 발생했습니다.'
    };
  }
};

// 사용자 속성 가져오기
export const fetchUserAttributes = async () => {
  try {
    const { fetchUserAttributes } = await import('aws-amplify/auth');
    const attributes = await fetchUserAttributes();
    
    return {
      success: true,
      attributes,
      message: '사용자 속성을 성공적으로 가져왔습니다.'
    };
  } catch (error) {
    console.error('사용자 속성 가져오기 오류:', error);
    return {
      success: false,
      error,
      message: error instanceof Error ? error.message : '사용자 속성을 가져오는 중 오류가 발생했습니다.'
    };
  }
};

// 사용자 속성 업데이트
export const updateUserAttributes = async (attributes: Record<string, string>) => {
  try {
    const { updateUserAttributes } = await import('aws-amplify/auth');
    const result = await updateUserAttributes({
      userAttributes: attributes
    });
    
    return {
      success: true,
      result,
      message: '사용자 속성이 성공적으로 업데이트되었습니다.'
    };
  } catch (error) {
    console.error('사용자 속성 업데이트 오류:', error);
    return {
      success: false,
      error,
      message: error instanceof Error ? error.message : '사용자 속성을 업데이트하는 중 오류가 발생했습니다.'
    };
  }
};