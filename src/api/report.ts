// src/api/report.ts - 수정 버전

import { post } from 'aws-amplify/api';
import { documentClient, getCurrentTimestamp } from './config';
import { 
  ReportGenerationParams, 
  GeneratedReport, 
  ReportFilterOptions, 
  DeleteReportResponse,
  ReportApiResponse
} from './types/report';

const REPORTS_TABLE = 'Tnc-Reports'; // 실제 테이블 이름으로 변경

/**
 * 보고서 목록 가져오기
 */
export async function listReports(options?: ReportFilterOptions): Promise<ReportApiResponse> {
  try {
    let params: any = {
      TableName: REPORTS_TABLE
    };
    
    // 필터링 옵션 적용
    if (options) {
      let filterExpressions: string[] = [];
      let expressionAttributeValues: any = {};
      
      if (options.courseId) {
        filterExpressions.push('courseId = :courseId');
        expressionAttributeValues[':courseId'] = options.courseId;
      }
      
      if (options.type) {
        filterExpressions.push('type = :type');
        expressionAttributeValues[':type'] = options.type;
      }
      
      if (options.status) {
        filterExpressions.push('status = :status');
        expressionAttributeValues[':status'] = options.status;
      }
      
      if (options.startDate) {
        filterExpressions.push('createdAt >= :startDate');
        expressionAttributeValues[':startDate'] = options.startDate;
      }
      
      if (options.endDate) {
        filterExpressions.push('createdAt <= :endDate');
        expressionAttributeValues[':endDate'] = options.endDate;
      }
      
      if (filterExpressions.length > 0) {
        params.FilterExpression = filterExpressions.join(' AND ');
        params.ExpressionAttributeValues = expressionAttributeValues;
      }
      
      if (options.limit) {
        params.Limit = options.limit;
      }
    }
    
    const result = await documentClient.scan(params).promise();
    
    return {
      data: result.Items as GeneratedReport[],
      nextToken: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : undefined
    };
  } catch (error) {
    console.error('Error listing reports:', error);
    throw error;
  }
}

/**
 * 단일 보고서 조회
 */
export async function getReport(reportId: string): Promise<ReportApiResponse> {
  try {
    const params = {
      TableName: REPORTS_TABLE,
      Key: {
        id: reportId
      }
    };
    
    const result = await documentClient.get(params).promise();
    
    return {
      data: result.Item as GeneratedReport
    };
  } catch (error) {
    console.error('Error getting report:', error);
    throw error;
  }
}

/**
 * 보고서 생성 요청
 */
export async function generateReport(params: ReportGenerationParams): Promise<GeneratedReport> {
  try {
    // API 호출
    const response = await post({
      apiName: 'reportApi',
      path: '/generate-report',
      options: {
        body: JSON.stringify(params)
      }
    }).response;

    // 타입 변환 오류 수정: unknown으로 먼저 변환 후 타입 단언
    const rawData = await response.body.json();
    return rawData as unknown as GeneratedReport;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

/**
 * 보고서 삭제
 */
export async function deleteReport(reportId: string): Promise<DeleteReportResponse> {
  try {
    const response = await post({
      apiName: 'reportApi',
      path: '/delete-report',
      options: {
        body: JSON.stringify({ reportId })
      }
    }).response;
    
    // 타입 변환 오류 수정
    const rawData = await response.body.json();
    return rawData as unknown as DeleteReportResponse;
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
}

/**
 * 보고서 미리보기 데이터 가져오기
 */
export async function getReportPreview(params: {
  courseId: string;
  reportType: string;
  startDate: string;
  endDate: string;
}) {
  try {
    const response = await post({
      apiName: 'reportApi',
      path: '/report-preview',
      options: {
        body: JSON.stringify(params)
      }
    }).response;
    
    const rawData = await response.body.json();
    return rawData as unknown as any; // 적절한 타입으로 변경 필요
  } catch (error) {
    console.error('Error getting report preview:', error);
    throw error;
  }
}

/**
 * 보고서 다운로드 URL 가져오기
 */
export async function getReportDownloadUrl(reportId: string): Promise<string> {
  try {
    const response = await post({
      apiName: 'reportApi',
      path: '/get-report-url',
      options: {
        body: JSON.stringify({ reportId })
      }
    }).response;
    
    const rawData = await response.body.json() as unknown as { url: string };
    return rawData.url;
  } catch (error) {
    console.error('Error getting report download URL:', error);
    throw error;
  }
}