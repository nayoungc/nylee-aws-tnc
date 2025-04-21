// src/services/ai/quizGenerator.ts
import { v4 as uuidv4 } from 'uuid';
import { client } from '../../graphql/client';

interface Question {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string | number;
  explanation?: string;
  difficulty?: string;
  tags?: string[];
  quality?: number;
}

interface GenerateQuizOptions {
  courseId: string;
  quizType: string;
  modelType?: 'basic' | 'advanced';
  questionCount?: number;
  contextPrompt?: string;
}

/**
 * 코스 자료를 기반으로 AI가 퀴즈 문제를 자동 생성합니다
 * AWS Bedrock 또는 다른 LLM 서비스 활용
 */
export async function generateQuizFromContent(options: GenerateQuizOptions): Promise<Question[]> {
  try {
    // API Gateway를 통해 Lambda 함수 호출 (실제 구현)
    const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: \${response.statusText}`);
    }

    const result = await response.json();
    return result.questions.map((q: any) => ({
      ...q,
      id: uuidv4()
    }));
  } catch (error) {
    console.error('퀴즈 생성 오류:', error);
    
    // 개발 환경에서는 예제 질문 반환
    if (process.env.NODE_ENV === 'development') {
      return generateDummyQuestions(options);
    }
    
    throw error;
  }
}

/**
 * 개발 환경을 위한 더미 질문 생성 (실제 API 연동 전 테스트용)
 */
function generateDummyQuestions(options: GenerateQuizOptions): Question[] {
  const { quizType, questionCount = 5 } = options;
  const questions: Question[] = [];
  const topics = ['AWS 서비스', '클라우드 보안', 'DevOps', '데이터베이스', '네트워킹'];
  
  const questionTemplates = {
    pre: [
      '____에 대해 올바르게 설명한 것은 무엇인가요?',
      '다음 중 ____ 서비스의 주요 특징이 아닌 것은?',
      '____의 주요 이점으로 볼 수 없는 것은?',
      '____ 리전을 선택할 때 고려해야 할 요소는?',
      '____ 구성 요소 중 가장 중요한 것은?'
    ],
    post: [
      '다음 시나리오에서 ____ 문제를 해결하기 위한 최적의 방법은?',
      '고객이 ____ 요구사항을 가지고 있을 때, 최적의 AWS 서비스 조합은?',
      '____ 아키텍처에서 확장성을 개선하기 위한 최선의 방법은?',
      '다음 ____ 구성에서 보안 위험이 있는 것은?',
      '비용 효율적인 ____ 솔루션을 설계할 때 가장 중요한 고려사항은?'
    ]
  };
  
  for (let i = 0; i < questionCount; i++) {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const templates = questionTemplates[quizType as 'pre' | 'post'] || questionTemplates.pre;
    const questionTemplate = templates[i % templates.length];
    
    const question = questionTemplate.replace('____', topic);
    const options = [
      `\${topic}의 첫 번째 특성`,
      `\${topic}의 두 번째 특성`,
      `\${topic}의 세 번째 특성`, 
      `\${topic}의 네 번째 특성`
    ];
    
    const correctAnswer = Math.floor(Math.random() * 4);
    const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
    const quality = Math.random() * 0.4 + 0.5; // 0.5-0.9 사이 랜덤 값
    
    questions.push({
      id: uuidv4(),
      question,
      options,
      correctAnswer,
      explanation: `이 문제는 \${topic}에 대한 이해도를 테스트합니다.`,
      difficulty,
      tags: [topic, difficulty],
      quality
    });
  }
  
  return questions;
}

/**
 * RAG(Retrieval-Augmented Generation)를 활용한 고급 퀴즈 생성
 * 코스 자료를 검색하고 문맥에 맞는 질문 생성
 */
export async function generateQuizWithRAG(courseId: string, options: Partial<GenerateQuizOptions> = {}): Promise<Question[]> {
  try {
    // 1. 코스 자료 검색 (실제 구현에서는 코스 자료를 가져오는 API 호출)
    const courseMaterials = await fetchCourseMaterials(courseId);
    
    // 2. 자료 청크로 분할 및 임베딩 처리 (실제 구현에서는 이 부분도 API로 처리)
    const chunks = splitIntoChunks(courseMaterials);
    
    // 3. RAG를 통한 질문 생성 요청 (Lambda 함수 호출)
    const response = await fetch('/api/rag-generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        courseId,
        chunks,
        ...options
      })
    });
    
    if (!response.ok) {
      throw new Error(`RAG API 요청 실패: \${response.statusText}`);
    }
    
    const result = await response.json();
    return result.questions;
    
  } catch (error) {
    console.error('RAG 퀴즈 생성 오류:', error);
    
    // 개발 환경에서는 예제 질문 반환
    if (process.env.NODE_ENV === 'development') {
      return generateDummyQuestions({ courseId, ...options });
    }
    
    throw error;
  }
}

// 코스 자료 가져오기 (실제 구현에서는 API 호출)
async function fetchCourseMaterials(courseId: string): Promise<string[]> {
    // 실제 구현에서는 코스 자료를 가져오는 API 호출
    return [
      '코스 자료 1: AWS 클라우드 컴퓨팅의 기초와 이점',
      '코스 자료 2: EC2 인스턴스 유형 및 사용 사례',
      '코스 자료 3: S3 스토리지 클래스 및 라이프사이클 관리',
      '코스 자료 4: VPC 구조와 서브넷 설계',
      '코스 자료 5: IAM 보안 모델 및 모범 사례'
    ];
  }
  
  // 텍스트 청크로 분할 (RAG 처리용)
  function splitIntoChunks(texts: string[]): string[] {
    // 실제로는 더 복잡한 텍스트 처리 및 최적의 청크 크기 계산이 필요
    const chunks: string[] = [];
    
    for (const text of texts) {
      // 각 텍스트를 더 작은 청크로 분할
      const words = text.split(' ');
      const chunkSize = 50; // 예: 50단어씩 청크로 분할
      
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        chunks.push(chunk);
      }
    }
    
    return chunks;
  }