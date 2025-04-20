import os
import json
import boto3
import docx
from docx import Document
import time
from decimal import Decimal
import argparse
import re

# 리전 설정
REGION_NAME = 'us-east-1'  # 필요에 따라 변경
BEDROCK_REGION = 'us-east-1'  # Bedrock 사용 가능한 리전

# 테이블 이름 정의
COURSE_TABLE_NAME = 'Tnc-CourseCatalog'
MODULE_TABLE_NAME = 'Tnc-CourseCatalog-Modules'

# 워드 파일 경로
DOCX_FILE_PATH = "AWS TnC_ILT_DILT.docx"

def extract_text_from_docx(file_path):
    """워드 파일에서 텍스트 추출"""
    try:
        doc = Document(file_path)
        full_text = []
        
        for para in doc.paragraphs:
            if para.text.strip():  # 빈 줄 제외
                full_text.append(para.text.strip())
        
        # 테이블 내용 추출
        for table in doc.tables:
            for row in table.rows:
                row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_text:
                    full_text.append(" | ".join(row_text))
        
        return full_text
    except Exception as e:
        print(f"워드 파일 읽기 오류: {str(e)}")
        return []

def extract_course_modules_sections(paragraphs):
    """워드 문서에서 과목별 모듈 섹션 추출"""
    sections = []
    current_section = []
    current_course_id = None
    
    course_identifiers = [
        "AWS Cloud Practitioner Essentials", 
        "Architecting on AWS", 
        "AWS Security Essentials", 
        "DevOps Engineering on AWS",
        "Security Engineering on AWS",
        "Developing on AWS",
        "AWS Technical Essentials",
        "AWS Well-Architected Best Practices",
        "Data Warehousing on AWS",
        "Developing Serverless Solutions on AWS",
        "Building Data Lakes on AWS",
        "AWS Migration Essentials"
    ]
    
    course_id_mapping = {
        "Cloud Practitioner": "AWS-CPE",
        "Architecting": "AWS-ARCH",
        "Security Essentials": "AWS-SE",
        "DevOps Engineering": "AWS-DEVOPS",
        "Security Engineering": "AWS-SEC-ENG",
        "Developing on AWS": "AWS-DEV",
        "Technical Essentials": "AWS-TE",
        "Well-Architected": "AWS-WABP",
        "Data Warehousing": "AWS-DW",
        "Serverless": "AWS-DSVS",
        "Data Lakes": "AWS-BDLAS",
        "Migration Essentials": "AWS-MIGESS"
    }
    
    for para in paragraphs:
        # 새로운 과정 섹션 식별 로직
        if any(identifier in para for identifier in course_identifiers):
            # 이전 섹션 저장
            if current_section:
                sections.append({"course_id": current_course_id, "content": current_section})
            
            # 새로운 섹션 시작
            current_section = [para]
            # 과정 ID 추출 - 매핑 테이블 사용
            current_course_id = "UNKNOWN"
            for key, value in course_id_mapping.items():
                if key in para:
                    current_course_id = value
                    break
        else:
            # 현재 섹션에 단락 추가
            if current_section:
                current_section.append(para)
    
    # 마지막 섹션 저장
    if current_section:
        sections.append({"course_id": current_course_id, "content": current_section})
    
    return sections

def analyze_with_bedrock_module(section_text, course_id):
    """Amazon Bedrock을 사용하여 모듈 정보를 JSON으로 구조화"""
    try:
        # Bedrock 클라이언트 생성
        bedrock_runtime = boto3.client(
            service_name='bedrock-runtime',
            region_name=BEDROCK_REGION
        )
        
        # 프롬프트 작성 - Claude 형식에 맞게 수정
        prompt_content = f"""
        다음은 AWS 교육 과정 '{course_id}'의 내용입니다. 이 텍스트를 분석하여 교육 모듈과 실습에 대한 정보를 추출해주세요.
        
        텍스트:
        {section_text}
        
        결과는 다음과 같은 JSON 형식으로 반환해주세요:
        [
            {{
                "module_id": "{course_id}-M1",
                "course_id": "{course_id}",
                "module_number": 1,
                "module_name": "모듈 이름",
                "module_type": "강의",
                "module_description": "모듈 설명 요약"
            }},
            {{
                "module_id": "{course_id}-LAB1",
                "course_id": "{course_id}",
                "module_number": "LAB1",
                "module_name": "실습 이름",
                "module_type": "실습",
                "module_description": "실습 설명 요약"
            }}
        ]
        
        - module_id는 과정ID-M숫자(강의) 또는 과정ID-LAB숫자(실습) 형식이어야 합니다.
        - course_id는 '{course_id}'와 같은 형식입니다.
        - module_number는 강의의 경우 숫자, 실습의 경우 "LAB숫자" 형식입니다.
        - module_type은 "강의" 또는 "실습"으로 구분합니다.
        - 모듈이 발견되지 않으면 빈 배열 []을 반환합니다.
        - 순전히 JSON 배열만 반환하고 다른 설명은 추가하지 마세요.
        """
        
        # Bedrock API 호출 - Claude 형식에 맞게 수정
        response = bedrock_runtime.invoke_model(
            modelId=model_id,
            body=json.dumps({
                "prompt": f"\n\nHuman: {prompt_content}\n\nAssistant: ",
                "max_tokens_to_sample": 4000,
                "temperature": 0.0,
                "top_p": 1
            })
        )
        
        # 응답 처리
        response_body = json.loads(response['body'].read())
        result = response_body.get('completion', '').strip()
        
        # JSON 부분 추출 - 정규식 사용
        json_pattern = re.compile(r'$$.*?$$', re.DOTALL)
        match = json_pattern.search(result)
        
        if match:
            json_text = match.group(0)
            try:
                return json.loads(json_text)
            except json.JSONDecodeError as e:
                print(f"JSON 파싱 오류: {e}")
                # 특수 문자 및 이스케이프 문자 처리 시도
                cleaned_json = json_text.replace('\n', ' ').replace('\r', '')
                try:
                    return json.loads(cleaned_json)
                except:
                    print("정제된 JSON도 파싱 실패")
                    return []
        else:
            print(f"JSON 형식을 찾을 수 없음")
            return []
            
    except Exception as e:
        print(f"Bedrock 분석 오류: {str(e)}")
        return []

def create_modules_json():
    """워드 문서에서 모듈 정보를 추출하여 modules.json 생성"""
    # 워드 파일 존재 여부 확인
    if not os.path.exists(DOCX_FILE_PATH):
        print(f"파일이 존재하지 않습니다: {DOCX_FILE_PATH}")
        return False
    
    # 워드 파일에서 텍스트 추출
    paragraphs = extract_text_from_docx(DOCX_FILE_PATH)
    if not paragraphs:
        print("워드 파일 내용이 없거나 읽을 수 없습니다.")
        return False
    
    # 과정별 모듈 섹션 추출
    module_sections = extract_course_modules_sections(paragraphs)
    if not module_sections:
        print("모듈 섹션을 식별할 수 없습니다.")
        return False
    
    # 모든 모듈 정보를 저장할 리스트
    all_modules = []
    
    # 각 섹션별로 Bedrock 분석 수행
    for section in module_sections:
        course_id = section["course_id"]
        section_text = "\n".join(section["content"])
        
        print(f"'{course_id}' 과정 모듈 분석 중...")
        
        # 재시도 로직 추가
        max_retries = 2
        retry_count = 0
        modules = []
        
        while retry_count <= max_retries and not modules:
            if retry_count > 0:
                print(f"'{course_id}' 과정 분석 재시도 중... (시도 {retry_count}/{max_retries})")
            
            # Bedrock 호출 레이트 제한 방지를 위한 딜레이
            time.sleep(3)
            
            # Bedrock 분석
            modules = analyze_with_bedrock_module(section_text, course_id)
            retry_count += 1
        
        # 분석된 모듈 추가
        if modules:
            all_modules.extend(modules)
            print(f"'{course_id}' 과정에서 {len(modules)}개 모듈/실습 정보 추출 완료")
        else:
            print(f"'{course_id}' 과정 모듈 정보 추출 실패")
    
    # modules.json 파일 생성
    with open('modules.json', 'w', encoding='utf-8') as f:
        json.dump(all_modules, f, ensure_ascii=False, indent=4)
    
    print(f"{len(all_modules)}개의 모듈 정보가 modules.json에 저장되었습니다.")
    return len(all_modules) > 0

def create_sample_modules_json():
    """샘플 modules.json 파일 생성"""
    sample_modules = [
        {
            "module_id": "AWS-CPE-M1",
            "course_id": "AWS-CPE",
            "module_number": 1,
            "module_name": "Amazon Web Services 소개",
            "module_type": "강의",
            "module_description": "AWS 용어집, 클라우드 컴퓨팅 유형, AWS를 이용한 클라우드 컴퓨팅"
        },
        {
            "module_id": "AWS-CPE-M2",
            "course_id": "AWS-CPE",
            "module_number": 2,
            "module_name": "클라우드 컴퓨팅",
            "module_type": "강의",
            "module_description": "AWS에서의 컴퓨팅, AWS 컴퓨팅 서비스, 카테고리 심층 분석: 서버리스"
        },
        {
            "module_id": "AWS-CPE-LAB1",
            "course_id": "AWS-CPE",
            "module_number": "LAB1",
            "module_name": "Amazon Simple Storage Service(S3) 입문",
            "module_type": "실습",
            "module_description": "S3 버킷 생성 및 객체 업로드/다운로드 실습"
        },
        {
            "module_id": "AWS-ARCH-M1",
            "course_id": "AWS-ARCH",
            "module_number": 1,
            "module_name": "아키텍팅 기본 사항",
            "module_type": "강의",
            "module_description": "AWS 서비스 및 인프라, 인프라 모델, AWS API 도구, 인프라 보안, Well-Architected Framework"
        },
        {
            "module_id": "AWS-ARCH-LAB1",
            "course_id": "AWS-ARCH",
            "module_number": "LAB1",
            "module_name": "AWS API 도구를 사용한 EC2 인스턴스 배포 살펴보기",
            "module_type": "실습",
            "module_description": "AWS Management Console과 CLI를 활용한 EC2 인스턴스 배포 실습"
        },
        {
            "module_id": "AWS-SE-M1",
            "course_id": "AWS-SE",
            "module_number": 1,
            "module_name": "AWS 기반 보안",
            "module_type": "강의",
            "module_description": "AWS 클라우드의 보안 설계 원칙, AWS 공동 책임 모델"
        }
    ]
    
    with open('modules.json', 'w', encoding='utf-8') as f:
        json.dump(sample_modules, f, ensure_ascii=False, indent=4)
    print(f"{len(sample_modules)}개의 샘플 모듈 정보가 modules.json에 저장되었습니다.")
    return True

def load_json_data():
    """JSON 파일에서 데이터 로드"""
    courses_data = []
    modules_data = []
    
    # courses.json 로드
    if os.path.exists('courses.json'):
        with open('courses.json', 'r', encoding='utf-8') as f:
            courses_data = json.load(f)
        print(f"courses.json에서 {len(courses_data)}개 과정 정보 로드 완료")
    else:
        print("courses.json 파일이 존재하지 않습니다.")
    
    # modules.json 로드
    if os.path.exists('modules.json'):
        with open('modules.json', 'r', encoding='utf-8') as f:
            modules_data = json.load(f)
        print(f"modules.json에서 {len(modules_data)}개 모듈 정보 로드 완료")
    else:
        print("modules.json 파일이 존재하지 않습니다.")
    
    return courses_data, modules_data

def import_data_to_dynamodb():
    """DynamoDB에 데이터 임포트"""
    # 세션 생성
    session = boto3.Session(region_name=REGION_NAME)
    
    # DynamoDB 리소스 생성
    dynamodb = session.resource('dynamodb')
    
    # JSON 파일에서 데이터 로드
    _, modules_data = load_json_data()
    
    # 데이터가 없으면 경고 출력
    if not modules_data:
        print("모듈 데이터가 없습니다. 테이블에 데이터가 추가되지 않습니다.")
        return False
    
    # 테이블 참조 가져오기
    module_table = dynamodb.Table(MODULE_TABLE_NAME)
    
    # 모듈 데이터 삽입
    print("모듈 데이터 삽입 중...")
    for module in modules_data:
        module_item = json.loads(json.dumps(module), parse_float=Decimal)
        module_table.put_item(Item=module_item)
    print(f"{len(modules_data)}개의 모듈 데이터 삽입 완료")
    
    print("모든 데이터가 성공적으로 DynamoDB에 저장되었습니다!")
    return True

def main():
    try:
        parser = argparse.ArgumentParser(description='AWS 교육 과정 모듈 정보 추출 및 DynamoDB 저장 프로그램')
        parser.add_argument('--extract', action='store_true', help='워드 파일에서 모듈 정보 추출')
        parser.add_argument('--sample', action='store_true', help='샘플 모듈 데이터 생성')
        parser.add_argument('--import-only', action='store_true', help='기존 JSON에서 DynamoDB로만 임포트')
        args = parser.parse_args()
        
        print("AWS 교육 과정 모듈 정보 추출 및 DynamoDB 저장 프로그램을 시작합니다.")
        
        modules_created = False
        
        if args.extract:
            # 워드 파일에서 모듈 정보 추출
            modules_created = create_modules_json()
        elif args.sample:
            # 샘플 모듈 데이터 생성
            modules_created = create_sample_modules_json()
        elif args.import_only:
            # 기존 JSON만 임포트
            modules_created = os.path.exists('modules.json')
        else:
            # 기본: 워드 파일이 있으면 추출, 없으면 샘플 생성
            if os.path.exists(DOCX_FILE_PATH):
                modules_created = create_modules_json()
            else:
                print(f"워드 파일이 없습니다: {DOCX_FILE_PATH}")
                if not os.path.exists('modules.json'):
                    print("샘플 모듈 데이터를 생성합니다.")
                    modules_created = create_sample_modules_json()
                else:
                    modules_created = True
        
        # DynamoDB에 데이터 임포트
        if modules_created or os.path.exists('modules.json'):
            import_data_to_dynamodb()
        else:
            print("모듈 정보 추출 또는 샘플 생성에 실패했습니다.")
        
        print("프로그램 실행이 완료되었습니다.")
        
    except Exception as e:
        print(f"오류 발생: {str(e)}")

if __name__ == "__main__":
    main()