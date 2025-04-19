import {
    fetchAuthSession,
    signIn,
    signUp,
    confirmSignUp,
    resendSignUpCode,
    fetchUserAttributes,
    getCurrentUser,
    type SignInOutput,
    type SignUpOutput,
    type ConfirmSignUpOutput,
    type UserAttributeKey  // 추가된 타입 임포트
} from 'aws-amplify/auth';

// 타입 정의
export interface SignUpParams {
    username: string;
    password: string;
    email: string;
    phone?: string;
    options?: {
        userAttributes?: Record<string, string>;
    };
}

export interface AuthTokens {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
}

export interface SignInResult {
    isSignedIn: boolean;
    nextStep?: {
        signInStep: string;
        missingAttributes?: string[];
    };
}

export interface AuthState {
    isAuthenticated: boolean;
    username?: string;
    attributes?: Partial<Record<UserAttributeKey, string>>; // 수정된 타입
}

// SignUp 함수 구현
export const handleSignUp = async (params: SignUpParams): Promise<{
    isSignUpComplete: boolean;
    nextStep?: SignUpOutput['nextStep'];
    userId?: string;
}> => {
    try {
        const { username, password, email, phone, options } = params;

        // 기본 사용자 속성
        const userAttributes: Record<string, string> = {
            email,
            ...(phone ? { phone_number: phone } : {}),
            ...(options?.userAttributes || {})
        };

        // Gen 2 방식의 signUp 호출
        const result = await signUp({
            username,
            password,
            options: {
                userAttributes
            }
        });

        return {
            isSignUpComplete: result.isSignUpComplete,
            nextStep: result.nextStep,
            userId: result.userId
        };
    } catch (error) {
        console.error('회원가입 오류:', error);
        throw error;
    }
};

// 로그인 함수
export const handleSignIn = async (username: string, password: string): Promise<SignInResult> => {
    try {
        console.log('로그인 시도:', username);

        // Amplify Gen 2 방식으로 로그인
        const { isSignedIn, nextStep } = await signIn({
            username,
            password,
        });

        console.log('로그인 응답:', { isSignedIn, nextStep });

        if (isSignedIn) {
            // 세션 강제 갱신으로 토큰 최신화 확보
            const session = await fetchAuthSession({ forceRefresh: true });

            // 토큰 저장 로직
            if (session.tokens?.idToken) {
                localStorage.setItem('userToken', session.tokens.idToken.toString());
                localStorage.setItem('lastLoginTime', Date.now().toString());

                // 사용자 속성 조회 및 캐싱 (선택적)
                try {
                    const attributes = await fetchUserAttributes();
                    if (attributes) {
                        localStorage.setItem('userAttributes', JSON.stringify(attributes));
                    }
                } catch (attrError) {
                    console.warn('사용자 속성 조회 실패:', attrError);
                }
            } else {
                console.warn('ID 토큰을 찾을 수 없습니다');
            }
        }

        return {
            isSignedIn,
            nextStep: nextStep ? {
                signInStep: nextStep.signInStep,
                missingAttributes: nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED' ?
                    [] : undefined
            } : undefined
        };
    } catch (error) {
        console.error('로그인 오류:', error);
        throw error;
    }
};

// 계정 인증 함수
export const handleConfirmSignUp = async (
    username: string,
    confirmationCode: string
): Promise<{
    isSignUpComplete: boolean;
    nextStep?: ConfirmSignUpOutput['nextStep'];
    autoSignIn?: SignInResult | null;
}> => {
    try {
        // Gen 2 방식으로 계정 인증
        const { isSignUpComplete, nextStep } = await confirmSignUp({
            username,
            confirmationCode
        });

        console.log('인증 완료:', isSignUpComplete);

        // 자동 로그인 시도 (필요한 경우)
        let autoSignIn = null;

        if (isSignUpComplete) {
            try {
                const signInResult = await signIn({
                    username,
                    options: {
                        authFlowType: 'USER_PASSWORD_AUTH'
                    }
                });

                if (signInResult.isSignedIn) {
                    // 세션 갱신
                    await fetchAuthSession({ forceRefresh: true });

                    autoSignIn = {
                        isSignedIn: true,
                        nextStep: { signInStep: 'DONE' }
                    };
                }
            } catch (signInError) {
                console.log('자동 로그인 실패, 수동 로그인 필요:', signInError);
            }
        }

        return {
            isSignUpComplete,
            nextStep,
            autoSignIn
        };
    } catch (error) {
        console.error('계정 인증 오류:', error);
        throw error;
    }
};

// 인증 코드 재전송 함수
export const handleResendConfirmationCode = async (username: string): Promise<{
    destination: string;
    isSuccess: boolean;
}> => {
    try {
        const result = await resendSignUpCode({
            username
        });

        console.log('코드 재전송 결과:', result);

        return {
            destination: username.includes('@') ?
                username.replace(/(.{2})(.*)(@.*)/, '\$1***\$3') :
                username.replace(/(\d{2})(\d+)(\d{2})/, '\$1****\$3'),
            isSuccess: true
        };
    } catch (error) {
        console.error('인증 코드 재전송 오류:', error);
        throw error;
    }
};

// 토큰 갱신 함수
export const refreshAuthToken = async (): Promise<boolean> => {
    try {
        const lastLoginTime = localStorage.getItem('lastLoginTime');
        const now = Date.now();
        const tokenMaxAge = 55 * 60 * 1000; // 55분 (1시간 토큰의 안전 마진)

        // 마지막 로그인 후 55분이 지났거나 로그인 시간 기록이 없는 경우
        if (!lastLoginTime || (now - Number(lastLoginTime)) > tokenMaxAge) {
            const session = await fetchAuthSession({ forceRefresh: true });

            if (session.tokens?.idToken) {
                localStorage.setItem('userToken', session.tokens.idToken.toString());
                localStorage.setItem('lastLoginTime', now.toString());
                return true;
            }
        }
        return true;
    } catch (error) {
        console.error('토큰 갱신 실패:', error);
        return false;
    }
};

// API 호출용 인증 래퍼
export const callAuthenticatedApi = async <T>(
    apiFunction: (...args: any[]) => Promise<T>,
    ...args: any[]
): Promise<T> => {
    try {
        // API 호출 전 토큰 새로고침
        await refreshAuthToken();
        return await apiFunction(...args);
    } catch (error: any) {
        if (error.name === 'UserUnAuthenticatedException') {
            console.error('사용자 세션이 만료되었습니다');
            window.location.href = '/signin?expired=true';
            throw new Error('인증 세션이 만료되었습니다. 다시 로그인해주세요.');
        }
        throw error;
    }
};

// 인증 상태 확인 함수
export const checkAuthState = async (): Promise<boolean> => {
    try {
        const user = await getCurrentUser();
        return !!user;
    } catch (error) {
        console.error('인증 상태 확인 오류:', error);
        return false;
    }
};

// 인증된 세션 토큰 가져오기
export const getAuthToken = async (): Promise<string | null> => {
    try {
        const session = await fetchAuthSession();
        return session.tokens?.idToken?.toString() || null;
    } catch (error) {
        console.error('토큰 가져오기 오류:', error);
        return null;
    }
};

// 사용자 속성 가져오기 - 반환 타입 수정
export const getUserAttributes = async (): Promise<Partial<Record<UserAttributeKey, string>>> => {
    try {
        const attributes = await fetchUserAttributes();
        return attributes;
    } catch (error) {
        console.error('사용자 속성 가져오기 오류:', error);
        throw error;
    }
};

// 현재 인증 상태 가져오기 - 반환 타입 수정
export const getCurrentAuthState = async (): Promise<AuthState> => {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      return {
        isAuthenticated: true,
        username: user.username,
        attributes
      };
    } catch (error) {
      return { isAuthenticated: false };
    }
  };