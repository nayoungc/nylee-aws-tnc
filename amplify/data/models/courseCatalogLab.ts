// amplify/data/models/courseCatalogLab.ts
import { a } from '@aws-amplify/backend';

export const courseCatalogLabSchema = a.schema({
  CourseCatalogLab: a
    .model({
      // 기본 필드
      catalogId: a.string().required(),   // 복합 키의 일부 (파티션 키)
      labId: a.string().required(),       // 복합 키의 일부 (정렬 키)
      moduleId: a.string().required(),    // 외래 키, GSI 파티션 키
      labNumber: a.string().required(),   // GSI 정렬 키
      title: a.string().required(),       // 실습 제목
      description: a.string(),            // 실습 설명
      content: a.string(),                // 실습 내용
      duration: a.integer(),              // 실습 예상 소요 시간(분)
      order: a.integer().required(),      // 실습 순서
      isPublished: a.boolean().required(), // 출판 여부
      createdAt: a.datetime(),            // 생성 시간
      updatedAt: a.datetime(),            // 수정 시간
      
      // 관계 정의
      courseCatalog: a.belongsTo('CourseCatalog', 'catalogId'),
      module: a.belongsTo('CourseCatalogModule', 'moduleId')
    })
    // 모델의 식별자(기본 키) 설정 - 복합 키
    .identifier(['catalogId', 'labId'])
    // 보조 인덱스 설정
    .secondaryIndexes((index) => [
      // 모듈별 실습 조회용 GSI
      index('moduleId').sortKeys(['labNumber']).name('byModule')
    ])
})