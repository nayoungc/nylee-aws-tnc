#!/bin/bash
# AWS Amplify Gen 2 프로젝트 설정 스크립트
# 기존 AWS 리소스(Cognito, DynamoDB, S3, Bedrock, AppSync) 연결

echo "🚀 Amplify Gen 2 프로젝트 설정 시작..."

# 1. 기본 프로젝트 생성
echo "📂 Amplify 프로젝트 생성 중..."
npm create amplify@latest

# 2. 필요한 패키지 설치
echo "📦 필수 패키지 설치 중..."
npm install @cloudscape-design/components @cloudscape-design/global-styles @aws-sdk/client-dynamodb @aws-sdk/client-bedrock-runtime @aws-sdk/lib-dynamodb aws-amplify

# 3. 프로젝트 디렉토리 구조 생성
echo "📂 프로젝트 디렉토리 구조 생성 중..."
mkdir -p src/components/common
mkdir -p src/layouts
mkdir -p src/routes
mkdir -p src/hooks
mkdir -p src/pages/auth
mkdir -p src/themes
mkdir -p src/utils
mkdir -p src/bedrock
mkdir -p src/models
mkdir -p public
mkdir -p backend/auth
mkdir -p backend/data/models
mkdir -p backend/api
mkdir -p backend/function
mkdir -p backend/storage
mkdir -p backend/bedrock

# 4. AWS 설정 파일 생성
echo "📄 AWS 설정 파일 생성 중..."
cat > src/aws-config.ts << 'EOL'
// AWS 리소스 설정 정보
export const awsConfig = {
  region: 'us-east-1',
  userPoolId: 'us-east-1_AFeIVnWIU',
  userPoolWebClientId: '6tdhvgmafd2uuhbc2naqg96g12',
  appsyncApiEndpoint: 'https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql',
  s3Bucket: 'nylee-aws-tnc',
  bedrockModel: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
  bedrockKnowledgeBaseId: '9NFEGNPEJ9'
};

// Amplify 설정
export const amplifyConfig = {
  Auth: {
    region: awsConfig.region,
    userPoolId: awsConfig.userPoolId,
    userPoolWebClientId: awsConfig.userPoolWebClientId
  },
  API: {
    graphql_endpoint: awsConfig.appsyncApiEndpoint,
    graphql_headers: async () => ({
      'x-api-key': '', // API 키가 있는 경우 추가
    })
  },
  Storage: {
    AWSS3: {
      bucket: awsConfig.s3Bucket,
      region: awsConfig.region
    }
  }
};
EOL

# 5. Amplify 구성 파일 생성
echo "📄 Amplify 구성 파일 생성 중..."
cat > amplifyconfiguration.json << 'EOL'
{
  "aws_project_region": "us-east-1",
  "aws_cognito_region": "us-east-1",
  "aws_user_pools_id": "us-east-1_AFeIVnWIU",
  "aws_user_pools_web_client_id": "6tdhvgmafd2uuhbc2naqg96g12",
  "aws_appsync_graphqlEndpoint": "https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql",
  "aws_appsync_region": "us-east-1",
  "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
  "aws_user_files_s3_bucket": "nylee-aws-tnc",
  "aws_user_files_s3_bucket_region": "us-east-1"
}
EOL

# 6. Amplify 설정 파일 생성
echo "📄 Amplify 설정 파일 생성 중..."
cat > src/amplify-config.ts << 'EOL'
import { Amplify } from 'aws-amplify';
import { amplifyConfig } from './aws-config';

export const configureAmplify = () => {
  Amplify.configure(amplifyConfig);
};
EOL

# 7. Bedrock 유틸리티 파일 생성
echo "📄 Bedrock 유틸리티 파일 생성 중..."
cat > src/bedrock/bedrock-service.ts << 'EOL'
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export class BedrockService {
  private client: BedrockRuntimeClient;
  private model: string;
  private kbId: string;

  constructor() {
    this.client = new BedrockRuntimeClient({ region: "us-east-1" });
    this.model = "anthropic.claude-3-5-sonnet-20240620-v1:0";
    this.kbId = "9NFEGNPEJ9";
  }

  async generateText(prompt: string): Promise<string> {
    const input = {
      modelId: this.model,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ]
      })
    };

    try {
      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);
      
      // Parse response
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.content[0].text;
    } catch (error) {
      console.error("Error calling Bedrock:", error);
      throw error;
    }
  }

  // Knowledge Base 쿼리 메서드는 필요에 따라 추가
}

export const bedrockService = new BedrockService();
EOL

# 8. 인증 컨텍스트 파일 생성
echo "📄 인증 컨텍스트 파일 생성 중..."
cat > src/auth/auth-context.tsx << 'EOL'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, signIn, signOut, signUp, confirmSignUp } from 'aws-amplify/auth';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (username: string, password: string, email: string) => Promise<any>;
  confirmRegistration: (username: string, code: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAuthentication();
  }, []);

  const checkUserAuthentication = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const result = await signIn({ username, password });
      await checkUserAuthentication();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, password: string, email: string) => {
    try {
      return await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
          }
        }
      });
    } catch (error) {
      throw error;
    }
  };

  const confirmRegistration = async (username: string, code: string) => {
    try {
      return await confirmSignUp({ username, confirmationCode: code });
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    confirmRegistration
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
EOL

# 9. DynamoDB 모델 파일 생성
echo "📄 DynamoDB 모델 파일 생성 중..."

# 데이터 모델 인덱스 파일
cat > src/models/index.ts << 'EOL'
export * from './course-catalog';
export * from './course-modules';
export * from './course-labs';
export * from './course-materials';
export * from './course-quizzes';
export * from './course-questions';
export * from './courses';
export * from './customers';
export * from './user-quizzes';
export * from './user-responses';
export * from './user-surveys';
export * from './user-survey-responses';
export * from './survey-analytics';
export * from './dashboard-metrics';
EOL

# 데이터 모델 인터페이스 파일들 생성
cat > src/models/course-catalog.ts << 'EOL'
export interface CourseCatalog {
  catalogId: string;
  title: string;
  version: string;
  awsCode?: string;
  description?: string;
  hours?: number;
  level?: string;
  createdAt?: string;
  updatedAt?: string;
}
EOL

cat > src/models/course-modules.ts << 'EOL'
export interface CourseModule {
  catalogId: string;
  moduleNumber: string;
  moduleId: string;
  title?: string;
  description?: string;
  duration?: string;
  objectives?: string[];
  order?: number;
}
EOL

cat > src/models/course-labs.ts << 'EOL'
export interface CourseLab {
  catalogId: string;
  labId: string;
  moduleId: string;
  labNumber: string;
  title?: string;
  description?: string;
  duration?: string;
  difficulty?: string;
  instructions?: string;
}
EOL

cat > src/models/course-materials.ts << 'EOL'
export interface CourseMaterial {
  catalogId: string;
  materialTypeId: string;
  moduleId: string;
  materialType: string;
  title?: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  order?: number;
}
EOL

cat > src/models/course-quizzes.ts << 'EOL'
export interface CourseQuiz {
  catalogId: string;
  quizTypeId: string;
  quizType: string;
  moduleId: string;
  quizId: string;
  title?: string;
  description?: string;
  passingScore?: number;
  timeLimit?: number;
}
EOL

cat > src/models/course-questions.ts << 'EOL'
export interface CourseQuestion {
  quizId: string;
  questionNumber: string;
  catalogId: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points?: number;
}
EOL

cat > src/models/courses.ts << 'EOL'
export interface Course {
  courseId: string;
  startDate: string;
  catalogId: string;
  shareCode: string;
  instructor: string;
  customerId: string;
  endDate?: string;
  location?: string;
  maxStudents?: number;
  currentStudents?: number;
  status?: string;
}
EOL

cat > src/models/customers.ts << 'EOL'
export interface Customer {
  customerId: string;
  customerName: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  industry?: string;
  notes?: string;
}
EOL

cat > src/models/user-quizzes.ts << 'EOL'
export interface UserQuiz {
  userId: string;
  courseId_quizType_quizId: string;
  courseId: string;
  quizId: string;
  completionTime: string;
  score?: number;
  passed?: boolean;
  attemptNumber?: number;
  duration?: number;
}
EOL

cat > src/models/user-responses.ts << 'EOL'
export interface UserResponse {
  userId_courseId_quizId: string;
  questionNumber_attemptNumber: string;
  quizId: string;
  questionNumber: string;
  courseId: string;
  isCorrect: string;
  selectedAnswer?: string;
  timeSpent?: number;
  submitTime?: string;
}
EOL

cat > src/models/user-surveys.ts << 'EOL'
export interface UserSurvey {
  randomId: string;
  courseId_surveyType_surveyId: string;
  courseId: string;
  surveyType: string;
  surveyId: string;
  completionTime: string;
  feedback?: string;
  rating?: number;
}
EOL

cat > src/models/user-survey-responses.ts << 'EOL'
export interface UserSurveyResponse {
  randomId_courseId_surveyId: string;
  questionNumber: string;
  surveyId: string;
  courseId: string;
  response?: string;
  rating?: number;
  comment?: string;
}
EOL

cat > src/models/survey-analytics.ts << 'EOL'
export interface SurveyAnalytic {
  surveyId: string;
  courseId: string;
  updatedAt: string;
  averageRating?: number;
  participationRate?: number;
  positiveResponses?: number;
  negativeResponses?: number;
  keyThemes?: string[];
}
EOL

cat > src/models/dashboard-metrics.ts << 'EOL'
export interface DashboardMetric {
  metricType: string;
  timeFrame_entityId: string;
  entityId: string;
  value?: number;
  previousValue?: number;
  change?: number;
  trend?: string;
  updatedAt?: string;
}
EOL

# 10. DynamoDB 서비스 파일 생성
echo "📄 DynamoDB 서비스 파일 생성 중..."
mkdir -p src/services

cat > src/services/dynamodb-service.ts << 'EOL'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  QueryCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

class DynamoDBService {
  private client: DynamoDBDocumentClient;
  
  constructor() {
    const dbClient = new DynamoDBClient({ region: "us-east-1" });
    this.client = DynamoDBDocumentClient.from(dbClient);
  }

  // 테이블별 기본 서비스 메서드
  
  // CourseCatalog 메서드
  async getCourseCatalogById(catalogId: string, title: string): Promise<any> {
    const params = {
      TableName: "Tnc-CourseCatalog",
      Key: {
        catalogId: catalogId,
        title: title
      }
    };
    
    const { Item } = await this.client.send(new GetCommand(params));
    return Item;
  }

  async queryCourseCatalogsByTitle(title: string): Promise<any> {
    const params = {
      TableName: "Tnc-CourseCatalog",
      IndexName: "CourseCatalog-GSI1",
      KeyConditionExpression: "title = :title",
      ExpressionAttributeValues: {
        ":title": title
      }
    };
    
    const { Items } = await this.client.send(new QueryCommand(params));
    return Items;
  }

  async queryCourseCatalogsByAwsCode(awsCode: string): Promise<any> {
    const params = {
      TableName: "Tnc-CourseCatalog",
      IndexName: "CourseCatalog-GSI2",
      KeyConditionExpression: "awsCode = :awsCode",
      ExpressionAttributeValues: {
        ":awsCode": awsCode
      }
    };
    
    const { Items } = await this.client.send(new QueryCommand(params));
    return Items;
  }

  // Course Modules 메서드
  async getModulesByCatalogId(catalogId: string): Promise<any> {
    const params = {
      TableName: "Tnc-CourseCatalog-Modules",
      KeyConditionExpression: "catalogId = :catalogId",
      ExpressionAttributeValues: {
        ":catalogId": catalogId
      }
    };
    
    const { Items } = await this.client.send(new QueryCommand(params));
    return Items;
  }

  async getModuleById(moduleId: string): Promise<any> {
    const params = {
      TableName: "Tnc-CourseCatalog-Modules",
      IndexName: "ourseCatalog-Modules-GSI1",
      KeyConditionExpression: "moduleId = :moduleId",
      ExpressionAttributeValues: {
        ":moduleId": moduleId
      }
    };
    
    const { Items } = await this.client.send(new QueryCommand(params));
    return Items && Items.length > 0 ? Items[0] : null;
  }

  // 나머지 테이블에 대한 메서드도 유사하게 구현할 수 있습니다
  // 각 테이블에 대한 기본적인 CRUD 작업을 정의합니다

  // 일반 CRUD 메서드
  async getItem(tableName: string, key: Record<string, any>): Promise<any> {
    const params = {
      TableName: tableName,
      Key: key
    };
    
    const { Item } = await this.client.send(new GetCommand(params));
    return Item;
  }

  async putItem(tableName: string, item: Record<string, any>): Promise<any> {
    const params = {
      TableName: tableName,
      Item: item
    };
    
    return await this.client.send(new PutCommand(params));
  }

  async queryItems(
    tableName: string, 
    keyCondition: string, 
    values: Record<string, any>, 
    indexName?: string
  ): Promise<any[]> {
    const params = {
      TableName: tableName,
      ...(indexName && { IndexName: indexName }),
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: values
    };
    
    const { Items } = await this.client.send(new QueryCommand(params));
    return Items || [];
  }
  
  async scanItems(
    tableName: string, 
    filterExpression?: string, 
    values?: Record<string, any>
  ): Promise<any[]> {
    const params = {
      TableName: tableName,
      ...(filterExpression && { FilterExpression: filterExpression }),
      ...(values && { ExpressionAttributeValues: values })
    };
    
    const { Items } = await this.client.send(new ScanCommand(params));
    return Items || [];
  }
}

export const dynamoDBService = new DynamoDBService();
EOL

# 11. Cloudscape 앱 레이아웃 파일 생성
echo "📄 앱 레이아웃 파일 생성 중..."
cat > src/layouts/app-layout.tsx << 'EOL'
import React, { useState } from 'react';
import {
  AppLayout,
  SideNavigation,
  TopNavigation,
  BreadcrumbGroup
} from '@cloudscape-design/components';
import { useAuth } from '../auth/auth-context';

interface MainLayoutProps {
  children: React.ReactNode;
  activeHref?: string;
  breadcrumbs?: { text: string; href: string }[];
  title?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeHref = '/',
  breadcrumbs = [],
  title = '교육 관리 시스템'
}) => {
  const { user, logout } = useAuth();
  const [navigationOpen, setNavigationOpen] = useState(true);

  const navItems = [
    { type: 'link', text: '대시보드', href: '/' },
    { 
      type: 'section', 
      text: '과정 카탈로그', 
      items: [
        { type: 'link', text: '카탈로그', href: '/catalogs' },
        { type: 'link', text: '모듈', href: '/modules' },
        { type: 'link', text: '실습', href: '/labs' }
      ]
    },
    { 
      type: 'section', 
      text: '과정 관리', 
      items: [
        { type: 'link', text: '과정 목록', href: '/courses' },
        { type: 'link', text: '고객사', href: '/customers' }
      ]
    },
    { 
      type: 'section', 
      text: '평가 및 설문', 
      items: [
        { type: 'link', text: '퀴즈', href: '/quizzes' },
        { type: 'link', text: '설문', href: '/surveys' },
        { type: 'link', text: '분석', href: '/analytics' }
      ]
    }
  ];

  const handleSignOut = () => {
    logout();
  };

  return (
    <AppLayout
      navigation={
        <SideNavigation
          items={navItems}
          header={{ text: title, href: '/' }}
          activeHref={activeHref}
        />
      }
      navigationOpen={navigationOpen}
      onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
      breadcrumbs={
        <BreadcrumbGroup items={breadcrumbs} />
      }
      toolsHide={true}
      content={children}
      headerSelector="#header"
    />
  );
};
EOL

# 12. 메인 앱 파일 생성
echo "📄 메인 앱 파일 생성 중..."
cat > src/App.tsx << 'EOL'
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { configureAmplify } from './amplify-config';
import { AuthProvider } from './auth/auth-context';
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';
import DashboardPage from './pages/dashboard';
import '@cloudscape-design/global-styles/index.css';

// Amplify 설정
configureAmplify();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<DashboardPage />} />
          {/* 추가 경로 설정 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
EOL

# 13. 백엔드 설정 파일 생성
echo "📄 백엔드 설정 파일 생성 중..."
cat > backend.ts << 'EOL'
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './backend/auth/resource';
import { data } from './backend/api/resource';
import { storage } from './backend/storage/resource';

const backend = defineBackend({
  auth,
  data,
  storage
});
EOL

# 14. 인증 리소스 설정 파일
cat > backend/auth/resource.ts << 'EOL'
import { defineAuth } from '@aws-amplify/backend';

// 기존 Cognito 사용자 풀 사용
export const auth = defineAuth({
  loginWith: {
    email: true,
    phone: false,
    username: true
  },
  // 기존 Cognito 사용자 풀 연결
  userPoolId: 'us-east-1_AFeIVnWIU',
  userPoolClientId: '6tdhvgmafd2uuhbc2naqg96g12'
});
EOL

# 15. API 리소스 설정 파일
cat > backend/api/resource.ts << 'EOL'
import { defineData } from '@aws-amplify/backend';
import { schema } from '../data/schema';

// 기존 AppSync API 연결
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
  // 기존 API 연결
  apiId: '34jyk55wjngtlbwbbzdjfraooe' // AppSync URL에서 추출한 ID
});
EOL

# 16. 스토리지 리소스 설정 파일
cat > backend/storage/resource.ts << 'EOL'
import { defineStorage } from '@aws-amplify/backend';

// 기존 S3 버킷 연결
export const storage = defineStorage({
  name: 'nylee-aws-tnc',
  access: 'auth'
});
EOL

# 17. 데이터 스키마 설정 파일
cat > backend/data/schema.ts << 'EOL'
import { a } from '@aws-amplify/backend';

// 기존 DynamoDB 테이블을 모델로 정의
export const schema = a.schema({
  // CourseCatalog
  CourseCatalog: a.model({
    catalogId: a.id().required(),
    title: a.string().required(),
    version: a.string().required(),
    awsCode: a.string(),
    description: a.string(),
    hours: a.number(),
    level: a.string()
  }).authorization((allow) => [
    allow.authenticated().to(['read']),
    allow.admin().to(['create', 'update', 'delete'])
  ]),

  // CourseModule
  CourseModule: a.model({
    catalogId: a.id().required(),
    moduleNumber: a.string().required(),
    moduleId: a.string().required(),
    title: a.string(),
    description: a.string(),
    duration: a.string(),
    objectives: a.array(a.string()),
    order: a.number()
  }).authorization((allow) => [
    allow.authenticated().to(['read']),
    allow.admin().to(['create', 'update', 'delete'])
  ]),

  // 나머지 모델도 동일한 방식으로 정의
  // CourseLab, CourseMaterial, CourseQuiz, CourseQuestion, Course, Customer, UserQuiz, 
  // UserResponse, UserSurvey, UserSurveyResponse, SurveyAnalytic, DashboardMetric
  
  // 예시로 몇 개만 더 추가
  CourseLab: a.model({
    catalogId: a.id().required(),
    labId: a.string().required(),
    moduleId: a.string().required(),
    labNumber: a.string().required(),
    title: a.string(),
    description: a.string(),
    duration: a.string(),
    difficulty: a.string(),
    instructions: a.string()
  }).authorization((allow) => [
    allow.authenticated().to(['read']),
    allow.admin().to(['create', 'update', 'delete'])
  ]),

  Course: a.model({
    courseId: a.id().required(),
    startDate: a.string().required(),
    catalogId: a.string().required(),
    shareCode: a.string().required(),
    instructor: a.string().required(),
    customerId: a.string().required(),
    endDate: a.string(),
    location: a.string(),
    maxStudents: a.number(),
    currentStudents: a.number(),
    status: a.string()
  }).authorization((allow) => [
    allow.authenticated().to(['read']),
    allow.admin().to(['create', 'update', 'delete'])
  ]),

  Customer: a.model({
    customerId: a.id().required(),
    customerName: a.string().required(),
    contactEmail: a.string(),
    contactPhone: a.string(),
    address: a.string(),
    industry: a.string(),
    notes: a.string()
  }).authorization((allow) => [
    allow.authenticated().to(['read']),
    allow.admin().to(['create', 'update', 'delete'])
  ])
});
EOL

# 18. 간단한 페이지 컴포넌트 생성
echo "📄 기본 페이지 컴포넌트 생성 중..."
mkdir -p src/pages/auth
mkdir -p src/pages/dashboard

cat > src/pages/auth/login.tsx << 'EOL'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  SpaceBetween, 
  Form, 
  FormField, 
  Input, 
  Button, 
  Header 
} from '@cloudscape-design/components';
import { useAuth } from '../../auth/auth-context';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <form onSubmit={handleLogin}>
        <Form
          header={<Header variant="h1">교육 관리 시스템 로그인</Header>}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => navigate('/register')}
              >
                계정 생성
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={loading}
              >
                로그인
              </Button>
            </SpaceBetween>
          }
          errorText={error}
        >
          <SpaceBetween direction="vertical" size="l">
            <FormField label="사용자 이름">
              <Input
                type="text"
                value={username}
                onChange={({ detail }) => setUsername(detail.value)}
              />
            </FormField>
            <FormField label="비밀번호">
              <Input
                type="password"
                value={password}
                onChange={({ detail }) => setPassword(detail.value)}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </form>
    </Container>
  );
};

export default LoginPage;
EOL

cat > src/pages/auth/register.tsx << 'EOL'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  SpaceBetween, 
  Form, 
  FormField, 
  Input, 
  Button, 
  Header 
} from '@cloudscape-design/components';
import { useAuth } from '../../auth/auth-context';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [code, setCode] = useState('');

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      await register(username, password, email);
      setConfirmation(true);
    } catch (err: any) {
      setError(err.message || '등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {!confirmation ? (
        <form onSubmit={handleRegister}>
          <Form
            header={<Header variant="h1">계정 생성</Header>}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="link"
                  onClick={() => navigate('/login')}
                >
                  로그인 화면으로 돌아가기
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  loading={loading}
                >
                  등록
                </Button>
              </SpaceBetween>
            }
            errorText={error}
          >
            <SpaceBetween direction="vertical" size="l">
              <FormField label="사용자 이름">
                <Input
                  type="text"
                  value={username}
                  onChange={({ detail }) => setUsername(detail.value)}
                />
              </FormField>
              <FormField label="이메일">
                <Input
                  type="email"
                  value={email}
                  onChange={({ detail }) => setEmail(detail.value)}
                />
              </FormField>
              <FormField label="비밀번호">
                <Input
                  type="password"
                  value={password}
                  onChange={({ detail }) => setPassword(detail.value)}
                />
              </FormField>
              <FormField label="비밀번호 확인">
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={({ detail }) => setConfirmPassword(detail.value)}
                />
              </FormField>
            </SpaceBetween>
          </Form>
        </form>
      ) : (
        <Form
          header={<Header variant="h1">계정 확인</Header>}
          actions={
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
            >
              확인 완료
            </Button>
          }
        >
          <SpaceBetween direction="vertical" size="l">
            <FormField label="인증 코드">
              <Input
                type="text"
                value={code}
                onChange={({ detail }) => setCode(detail.value)}
              />
            </FormField>
            <Button
              onClick={async () => {
                try {
                  // 인증 로직 구현
                  // await confirmRegistration(username, code);
                  navigate('/login');
                } catch (err: any) {
                  setError(err.message || '인증 중 오류가 발생했습니다.');
                }
              }}
            >
              코드 확인
            </Button>
          </SpaceBetween>
        </Form>
      )}
    </Container>
  );
};

export default RegisterPage;
EOL

cat > src/pages/dashboard/index.tsx << 'EOL'
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cards,
  Container, 
  Header,
  SpaceBetween,
  ColumnLayout
} from '@cloudscape-design/components';
import { MainLayout } from '../../layouts/app-layout';
import { useAuth } from '../../auth/auth-context';
import { dynamoDBService } from '../../services/dynamodb-service';
import { DashboardMetric } from '../../models/dashboard-metrics';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const result = await dynamoDBService.scanItems('Tnc-DashboardMetrics');
        setMetrics(result as DashboardMetric[]);
      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout activeHref="/" title="교육 관리 시스템">
      <SpaceBetween size="xl">
        <Container
          header={
            <Header variant="h2">
              대시보드
            </Header>
          }
        >
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <h3>환영합니다, {user.username || '사용자'}님!</h3>
              <p>교육 관리 시스템에 오신 것을 환영합니다.</p>
            </div>
            <div>
              <h3>최근 활동</h3>
              <p>과정 및 활동 데이터를 확인하세요.</p>
            </div>
          </ColumnLayout>
        </Container>

        <Container
          header={
            <Header variant="h2">주요 지표</Header>
          }
        >
          <Cards
            cardDefinition={{
              header: item => item.metricType,
              sections: [
                {
                  id: "value",
                  header: "값",
                  content: item => item.value
                },
                {
                  id: "change",
                  header: "변화",
                  content: item => `\${item.change || 0}%`
                }
              ]
            }}
            cardsPerRow={[
              { cards: 1 },
              { minWidth: 500, cards: 2 },
              { minWidth: 992, cards: 3 }
            ]}
            items={metrics}
            loading={dataLoading}
            loadingText="데이터 로딩 중"
            empty={
              <div>데이터가 없습니다</div>
            }
          />
        </Container>
      </SpaceBetween>
    </MainLayout>
  );
};

export default DashboardPage;
EOL

# 19. 필요한 패키지들 package.json 업데이트
echo "📄 package.json 파일 업데이트 중..."
# 기존 package.json이 있다면 업데이트, 없다면 새로 만듭니다
if [ -f "package.json" ]; then
  # 실제 환경에서 package.json 수정이 필요하다면 jq 등의 도구를 사용해 자동화할 수 있습니다
  echo "package.json 파일이 이미 존재합니다. 필요한 의존성은 수동으로 추가하세요."
fi

# 20. 기본 환경 변수 파일 생성
echo "📄 환경 변수 파일 생성 중..."
cat > .env.local << 'EOL'
# 로컬 개발 환경 변수
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_AFeIVnWIU
VITE_USER_POOL_WEB_CLIENT_ID=6tdhvgmafd2uuhbc2naqg96g12
VITE_S3_BUCKET=nylee-aws-tnc
VITE_APPSYNC_ENDPOINT=https://34jyk55wjngtlbwbbzdjfraooe.appsync-api.us-east-1.amazonaws.com/graphql
VITE_BEDROCK_KB_ID=9NFEGNPEJ9
EOL

# 21. GitIgnore 파일 생성
echo "📄 .gitignore 파일 생성 중..."
cat > .gitignore << 'EOL'
# 의존성
/node_modules
/.pnp
.pnp.js
npm-debug.log*
yarn-debug.log*
yarn-error.log*
yarn.lock
package-lock.json

# 테스팅
/coverage

# 빌드 결과물
/build
/dist
/.next

# 개발 환경
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE 설정
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Amplify 설정
/amplify
.amplify/

# 배포 결과물
/out
EOL

# 22. README 파일 생성
echo "📄 README.md 파일 생성 중..."
cat > README.md << 'EOL'
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