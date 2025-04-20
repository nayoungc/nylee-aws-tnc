// amplify/auth/resource.ts
import { defineAuth } from "@aws-amplify/backend";

// 간단한 인증 구성
export const auth = defineAuth({
  loginWith: {
    email: true,
  }
  // 기존 사용자 풀 연결은 백엔드 스택에서 별도로 처리
});
