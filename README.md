# 교육 관리 시스템 (AWS Amplify Gen 2)

## 프로젝트 개요
AWS Amplify Gen 2를 사용하여 구축된 교육 관리 시스템입니다.

## 기술 스택
- AWS Amplify Gen 2
- React
- TypeScript
- AWS Cloudscape Design System
- AWS Cognito (인증)
- AWS DynamoDB (데이터베이스)
- AWS S3 (저장소)
- AWS Bedrock Claude 3.5 (AI 기능)

## 시작하기

### 사전 요구 사항
- Node.js v16 이상
- AWS 계정
- AWS CLI 구성

### 설치
```bash
# 의존성 설치
npm install
로컬 개발
# Amplify 로컬 개발 환경 실행
amplify sandbox

# 개발 서버 시작
npm run dev
배포
# AWS에 백엔드 배포
amplify deploy

# 프론트엔드 배포 (Amplify 호스팅 사용 시)
amplify publish
기존 AWS 리소스
Cognito 사용자 풀 ID: us-east-1_AFeIVnWIU
S3 버킷: nylee-aws-tnc
AppSync 엔드포인트: https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql 
Bedrock 지식 베이스: 9NFEGNPEJ9
디렉토리 구조
/src - 프론트엔드 소스 코드
/backend - Amplify Gen 2 백엔드 정의
/src/models - 데이터 모델
/src/services - API 서비스
/src/pages - 애플리케이션 페이지
/src/components - 재사용 가능한 UI 컴포넌트
/src/layouts - 레이아웃 컴포넌트
/src/bedrock - Bedrock AI 통합 코드 EOL
echo "✅ 스크립트 실행이 완료되었습니다!" echo "📝 다음 단계:" echo "1. npm install - 의존성을 설치합니다" echo "2. amplify sandbox - 로컬 개발 환경을 실행합니다" echo "3. npm run dev - 개발 서버를 시작합니다"


이 스크립트는 다음 작업을 수행합니다:

1. Amplify Gen 2 프로젝트 생성
2. 기존 AWS 리소스(Cognito, DynamoDB, AppSync, S3, Bedrock)를 연결하도록 설정
3. 14개 DynamoDB 테이블 모델 정의 및 서비스 레이어 생성
4. Cloudscape UI 컴포넌트 및 레이아웃 설정
5. 기본 인증 흐름 구성
6. Bedrock Claude 3.5 통합

스크립트를 실행하기 전에:
1. `chmod +x setup-script.sh` 명령으로 실행 권한을 부여하세요
2. `./setup-script.sh` 명령으로 스크립트를 실행하세요

완료 후에는 가이드에 따라 의존성을 설치하고 개발 환경을 시작하면 됩니다.
