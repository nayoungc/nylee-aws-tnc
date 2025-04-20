// amplify/backend.ts
import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import * as cdk from "aws-cdk-lib";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";

// 백엔드 정의
const backend = defineBackend({
  auth,
  data,
});

// 새 스택에서 기존 사용자 풀 참조
const customResources = backend.createStack("CustomResources");

// 기존 사용자 풀 참조 (읽기 전용)
const existingUserPool = UserPool.fromUserPoolId(
  customResources, 
  'ExistingUserPool', 
  'us-east-1_AFeIVnWIU'
);

// 필요한 추가 참조나 리소스 생성
// 참고: 이 코드는 기존 리소스를 참조만 하고 새 리소스는 만들지 않음

export { backend };