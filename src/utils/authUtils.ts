// src/utils/authUtils.ts
// 로그인 폼 검증 함수
export function validateLoginForm(username: string, password: string) {
  const errors: { username?: string; password?: string } = {};
  
  if (!username.trim()) {
    errors.username = '사용자 이름을 입력해주세요';
  }
  
  if (!password) {
    errors.password = '비밀번호를 입력해주세요';
  } else if (password.length < 8) {
    errors.password = '비밀번호는 8자 이상이어야 합니다';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// 로컬 스토리지에 인증 정보 임시 저장 (필요한 경우)
export function storeAuthState(isAuthenticated: boolean) {
  localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
}

// 로컬 스토리지에서 인증 정보 가져오기 (필요한 경우)
export function getAuthState(): boolean {
  const stored = localStorage.getItem('isAuthenticated');
  return stored ? JSON.parse(stored) : false;
}

// 로그인 오류 메시지 변환
export function getLoginErrorMessage(error: any): string {
  const errorMap: Record<string, string> = {
    'UserNotFoundException': '사용자를 찾을 수 없습니다',
    'NotAuthorizedException': '사용자 이름 또는 비밀번호가 올바르지 않습니다',
    'UserNotConfirmedException': '사용자가 확인되지 않았습니다',
    'PasswordResetRequiredException': '비밀번호 재설정이 필요합니다',
  };
  
  if (error.name && errorMap[error.name]) {
    return errorMap[error.name];
  }
  
  return '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';
}