import {
    fetchAuthSession,
    signIn,
    signUp,
    confirmSignUp,
    resendSignUpCode,
    fetchUserAttributes,
    getCurrentUser
} from 'aws-amplify/auth';

// SignUp 함수의 인터페이스 정의
export interface SignUpParams {
    username: string;
    password: string;
    email: string;
    phone?: string;
    options?: {
        userAttributes?: Record<string, string>;
    };
}

// SignUp 함수 구현 - export 추가
export const handleSignUp = async (params: SignUpParams) => {
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

export const handleSignIn = async (username: string, password: string) => {
    try {
        console.log('로그인 시도:', username);

        // Amplify Gen 2 방식으로 로그인
        const { isSignedIn, nextStep } = await signIn({
            username,
            password,
        });

        console.log('로그인 응답:', { isSignedIn, nextStep });

        if (isSignedIn) {
            // 새로운 방식으로 세션 토큰 가져오기 및 타입 처리
            const session = await fetchAuthSession();

            // 타입 안전성을 위한 조건문 추가
            if (session.tokens?.idToken) {
                sessionStorage.setItem('userToken', session.tokens.idToken.toString());
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
export const handleConfirmSignUp = async (username: string, confirmationCode: string) => {
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
                // 일부 앱에서는 자동 로그인이 필요할 수 있음
                const signInResult = await signIn({
                    username,
                    options: {
                        authFlowType: 'USER_PASSWORD_AUTH'
                    }
                });

                if (signInResult.isSignedIn) {
                    autoSignIn = {
                        isSignedIn: true,
                        nextStep: { signInStep: 'DONE' }
                    };
                }
            } catch (signInError) {
                console.log('자동 로그인 실패, 수동 로그인 필요:', signInError);
                // 자동 로그인 실패해도 인증 자체는 성공했으므로 오류 무시
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
export const handleResendConfirmationCode = async (username: string) => {
    try {
        const result = await resendSignUpCode({
            username
        });

        console.log('코드 재전송 결과:', result);

        // Gen 2에서는 반환 타입이 변경됨 - 결과 객체를 그대로 반환
        return {
            // 실제 destination 정보는 현재 사용 불가능할 수 있어 username 기반 메시지 반환
            destination: username.includes('@') ?
                username.replace(/(.{2})(.*)(@.*)/, '\$1***\$3') : // 이메일 형식이면 마스킹
                username.replace(/(\d{2})(\d+)(\d{2})/, '\$1****\$3'), // 아니면 다른 형식으로 마스킹
            isSuccess: true
        };
    } catch (error) {
        console.error('인증 코드 재전송 오류:', error);
        throw error;
    }
};

// 인증 상태 확인 헬퍼 함수
export const checkAuthState = async () => {
    try {
        // Gen 2 방식으로 현재 사용자 확인
        const user = await getCurrentUser();
        return !!user;
    } catch (error) {
        console.error('인증 상태 확인 오류:', error);
        return false;
    }
};

// 인증된 세션 토큰 가져오기 함수
export const getAuthToken = async () => {
    try {
        const session = await fetchAuthSession();
        return session.tokens?.idToken?.toString() || null;
    } catch (error) {
        console.error('토큰 가져오기 오류:', error);
        return null;
    }
};

// 사용자 속성 가져오기
export const getUserAttributes = async () => {
    try {
        const attributes = await fetchUserAttributes();
        return attributes;
    } catch (error) {
        console.error('사용자 속성 가져오기 오류:', error);
        throw error;
    }
};