// src/api/types/report.ts
import { CourseCatalog } from './catalog';

// 보고서 유형 정의
export interface ReportType {
    id: string;
    title: string;
    description: string;
    icon: string;
}

// 보고서 형식 정의
export interface ReportFormat {
    id: string;
    label: string;
    type: 'pdf' | 'excel' | 'csv' | 'html';
}

// 생성된 보고서 정의
export interface GeneratedReport {
    id: string;
    title: string;
    type: string;
    courseId: string;
    courseName: string;
    format: string;
    createdAt: string;
    updatedAt?: string;
    url?: string;
    status: 'completed' | 'in-progress' | 'failed';
}

// 보고서 생성 요청 매개변수
export interface ReportGenerationParams {
    courseId: string | number; // string | number 타입으로 정의
    courseName: string;
    reportType: string;
    startDate: string;
    endDate: string;
    format: string;
    title: string;
}

// 보고서 삭제 응답
export interface DeleteReportResponse {
    success: boolean;
    message?: string;
}

// 보고서 미리보기 데이터 구조
export interface ReportPreviewData {
    quizComparison?: {
        labels: string[];
        preSeries: number[];
        postSeries: number[];
        averageImprovement: string;
    };
    surveyAnalysis?: {
        satisfaction: {
            labels: string[];
            data: number[];
        };
        recommendationScore: number;
        topComments: string[];
    };
}

// 보고서 목록 필터 옵션
export interface ReportFilterOptions {
    courseId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    status?: 'completed' | 'in-progress' | 'failed';
    limit?: number;
}

// 보고서 API 응답 구조
export interface ReportApiResponse {
    data?: GeneratedReport[] | GeneratedReport;
    errors?: any[];
    nextToken?: string;
  }