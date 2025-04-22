import json

# Tnc-CourseCatalog.json 데이터 (여러 과정 포함)
course_catalog_data = [
    {
        "catalogId": "400-AWWABP",
        "version": "1",
        "title": "Advanced AWS Well-Architected Best Practices",
        "awsCode": "94643",
        "description": "실무 위주의 본 고급 기술 수준 강사 주도형 교육에서는 효과적이고 효율적인 AWS Well-Architected Framework 검토를 실시하는 데 도움이 되는 Amazon Web Services(AWS) 모범 사례를 심층적으로 분석합니다. 이 과정에서는 검토를 준비하는 방법, 검토를 실행하는 방법, 검토 후 지침을 받는 방법을 포함하여 각 검토 단계를 다룹니다. 이 과정은 AWS 고객 및 파트너를 위해 설계되었습니다. 참가자는 이 과정에 대한 200 레벨 중급 선행 과정에서 다루는 AWS 개념, 용어, 서비스 및 도구에 익숙해야 합니다.",
        "level": "고급",
        "duration": "1일",
        "deliveryMethod": "강의식 교육(ILT), 실습, 데모 및 그룹 활동",
        "objectives": [
            "워크로드 정의 및 주요 개념",
            "AWS Well-Architected Framework 검토 단계, 프로세스, 모범 사례 및 안티 패턴",
            "고위험 및 중위험 파악",
            "AWS Well-Architected 워크플로에 대한 개선 우선순위 지정",
            "AWS Well-Architected Framework 백서, 실습, AWS 솔루션 라이브러리의 사전 구축된 솔루션, AWS Well-Architected Independent Software Vendor(ISV) 및 AWS Well-Architected 파트너 프로그램(WAPP) 찾기 및 활용"
        ],
        "audience": [
            "솔루션스 아키텍트",
            "클라우드 실무자",
            "데이터 엔지니어",
            "데이터 과학자",
            "개발자"
        ],
        "prerequisites": [
            "AWS Well-Architected Best Practices Intermediate - L200 과정 수강"
        ],
        "registrationUrl": "www.aws.training/training/schedule?courseId=94643"
    }
    # 여기에 추가 과정 데이터를 넣을 수 있습니다
]

# Tnc-CourseCatalog-Modules.json 데이터
modules_data = [
    {
        "catalogId": "400-AWWABP",
        "moduleNumber": "0",
        "moduleId": "400-AWWABP-MOD0",
        "title": "과정 소개",
        "description": "과정 소개 및 개요",
        "duration": "30분",
        "contentItems": []
    },
    {
        "catalogId": "400-AWWABP",
        "moduleNumber": "1",
        "moduleId": "400-AWWABP-MOD1",
        "title": "AWS Well-Architected Framework 검토",
        "description": "AWS Well-Architected Framework의 검토 절차 및 개념 이해",
        "duration": "2시간",
        "contentItems": [
            "워크로드 정의",
            "워크로드의 주요 개념",
            "AWS Well-Architected 검토 단계",
            "AWS Well-Architected 검토 접근 방식, 교훈 및 사용 사례",
            "AWS Well-Architected 검토 모범 사례",
            "AWS Well-Architected 검토 안티 패턴"
        ]
    },
    {
        "catalogId": "400-AWWABP",
        "moduleNumber": "2",
        "moduleId": "400-AWWABP-MOD2",
        "title": "고객 시나리오 그룹 세션",
        "description": "역할극을 통한 Well-Architected 원칙 검토 실습",
        "duration": "3시간",
        "contentItems": [
            "고객 사례 설명",
            "워크플로에 대한 설명",
            "그룹 실습",
            "데모: 운영 우수성 원칙에 대한 검토 실행",
            "역할극 연습 1: 보안 원칙에 대한 검토 실행",
            "역할극 연습 2: 신뢰성 원칙에 대한 검토 실행",
            "역할극 연습 3: 성능 효율성 원칙에 대한 검토 실행",
            "역할극 연습 4: 비용 최적화 원칙에 대한 검토 실행",
            "역할극 연습 5: 지속 가능성 원칙에 대한 검토 실행"
        ]
    },
    {
        "catalogId": "400-AWWABP",
        "moduleNumber": "3",
        "moduleId": "400-AWWABP-MOD3",
        "title": "위험 솔루션 및 우선순위",
        "description": "AWS Well-Architected 검토에서 위험 식별 및 우선순위 지정",
        "duration": "2시간",
        "contentItems": [
            "AWS Well-Architected 검토 참여 워크플로",
            "고위험 문제(HRI) 및 중위험 문제(MRI)",
            "위험 정의",
            "고위험 문제(HRI) 및 중위험 문제(MRI) 해결",
            "그룹토론: 각 원칙 별 위험 파악 및 해결",
            "운영우수성",
            "보안",
            "신뢰성",
            "성능 효율성",
            "비용 최적화",
            "개선 우선순위 지정",
            "AWS Well-Architected 개선 워크플로"
        ]
    },
    {
        "catalogId": "400-AWWABP",
        "moduleNumber": "4",
        "moduleId": "400-AWWABP-MOD4",
        "title": "리소스",
        "description": "AWS Well-Architected 관련 리소스 및 프로그램",
        "duration": "1시간",
        "contentItems": [
            "리소스 페이지",
            "AWS Well-Architected ISV",
            "AWS Well-Architected 파트너 프로그램(WAPP)"
        ]
    },
    {
        "catalogId": "400-AWWABP",
        "moduleNumber": "5",
        "moduleId": "400-AWWABP-MOD5",
        "title": "과정 요약",
        "description": "과정 내용 복습 및 다음 단계",
        "duration": "30분",
        "contentItems": [
            "복습",
            "다음 단계",
            "교육 과정 피드백"
        ]
    }
    # 다른 과정의 모듈을 추가할 수 있습니다
]

# Tnc-CourseCatalog-Labs.json 데이터
labs_data = [
    {
        "catalogId": "400-AWWABP",
        "labId": "400-AWWABP-LAB1",
        "moduleId": "400-AWWABP-MOD2",
        "labNumber": "1",
        "title": "운영 우수성 원칙 검토 실습",
        "description": "AWS Well-Architected Tool을 사용하여 운영 우수성 원칙 검토 실행",
        "duration": "45분",
        "type": "그룹 실습",
        "instructions": "AWS Well-Architected Tool을 통해 샘플 워크로드에 대한 운영 우수성 원칙을 검토하고 위험 요소를 식별합니다."
    },
    {
        "catalogId": "400-AWWABP",
        "labId": "400-AWWABP-LAB2",
        "moduleId": "400-AWWABP-MOD2",
        "labNumber": "2",
        "title": "보안 원칙 검토 실습",
        "description": "AWS Well-Architected Tool을 사용하여 보안 원칙 검토 실행",
        "duration": "45분",
        "type": "역할극 실습",
        "instructions": "AWS Well-Architected Tool을 통해 샘플 워크로드에 대한 보안 원칙을 검토하고 위험 요소를 식별합니다."
    },
    {
        "catalogId": "400-AWWABP",
        "labId": "400-AWWABP-LAB3",
        "moduleId": "400-AWWABP-MOD3",
        "labNumber": "1",
        "title": "위험 우선순위 지정 실습",
        "description": "식별된 위험에 대한 우선순위 지정 및 해결 방안 수립",
        "duration": "60분",
        "type": "그룹토론 실습",
        "instructions": "고위험 및 중위험 문제를 식별하고 이에 대한 우선순위를 지정하여 개선 계획을 수립합니다."
    },
    {
        "catalogId": "400-AWWABP",
        "labId": "400-AWWABP-LAB4",
        "moduleId": "400-AWWABP-MOD4",
        "labNumber": "1",
        "title": "리소스 활용 실습",
        "description": "AWS Well-Architected 리소스를 활용한 문제 해결 방안 탐색",
        "duration": "30분",
        "type": "개인 실습",
        "instructions": "AWS Well-Architected 리소스 페이지, ISV 및 WAPP를 탐색하여 특정 문제에 대한 해결책을 찾습니다."
    }
    # 다른 과정의 실습을 추가할 수 있습니다
]

# JSON 파일로 저장
with open('Tnc-CourseCatalog.json', 'w', encoding='utf-8') as f:
    json.dump(course_catalog_data, f, ensure_ascii=False, indent=2)
    
with open('Tnc-CourseCatalog-Modules.json', 'w', encoding='utf-8') as f:
    json.dump(modules_data, f, ensure_ascii=False, indent=2)
    
with open('Tnc-CourseCatalog-Labs.json', 'w', encoding='utf-8') as f:
    json.dump(labs_data, f, ensure_ascii=False, indent=2)

print("JSON 파일 3개가 성공적으로 생성되었습니다.")