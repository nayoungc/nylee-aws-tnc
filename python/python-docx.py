import os
import json
import boto3
import docx
from docx import Document
import time
from decimal import Decimal
import uuid

# 리전 설정
REGION_NAME = 'us-east-1'  # 필요에 따라 변경하세요
BEDROCK_REGION = 'us-east-1'  # Bedrock이 사용 가능한 리전

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

def extract_course_sections(paragraphs):
    """워드 문서에서 과정 섹션 추출"""
    # 과정 시작 식별자 - 대표적인 과정 제목들
    course_markers = [
        "AWS Cloud Practitioner Essentials", 
        "Architecting on AWS", 
        "AWS Security Essentials", 
        "AWS Technical Essentials",
        "DevOps Engineering on AWS",
        "Security Engineering on AWS",
        "Developing on AWS",
        "Developing Serverless Solutions on AWS",
        "AWS Cloud Essentials for Business Leaders",
        "AWS Migration Essentials",
        "AWS Well-Architected Best Practices",
        "Building Data Lakes on AWS"
    ]
    
    course_sections = []
    current_section = []
    in_course_section = False
    
    for para in paragraphs:
        # 새로운 과정 섹션의 시작 확인
        if any(marker in para for marker in course_markers):
            # 이전 섹션 저장
            if current_section:
                course_sections.append(current_section)
            
            # 새 섹션 시작
            current_section = [para]
            in_course_section = True
        
        # 현재 과정 섹션에 내용 추가
        elif in_course_section:
            current_section.append(para)
            
            # 과정 섹션 종료 조건 (다음 과정 시작 또는 문서 종료)
            if "Digital Classroom" in para or "과정 개요" in para:
                course_sections.append(current_section)
                current_section = []
                in_course_section = False
    
    # 마지막 섹션 처리
    if current_section:
        course_sections.append(current_section)
    
    return course_sections

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
        "AWS Technical Essentials"
    ]
    
    for para in paragraphs:
        # 새로운 과정 섹션 식별 로직
        if any(identifier in para for identifier in course_identifiers):
            # 이전 섹션 저장
            if current_section:
                sections.append({"course_id": current_course_id, "content": current_section})
            
            # 새로운 섹션 시작
            current_section = [para]
            # 과정 ID 추출 
            if "Cloud Practitioner" in para:
                current_course_id = "AWS-CPE"
            elif "Architecting" in para:
                current_course_id = "AWS-ARCH"
            elif "Security Essentials" in para:
                current_course_id = "AWS-SE"
            elif "DevOps Engineering" in para:
                current_course_id = "AWS-DEVOPS"
            elif "Security Engineering" in para:
                current_course_id = "AWS-SEC-ENG"
            elif "Developing on AWS" in para:
                current_course_id = "AWS-DEV"
            elif "Technical Essentials" in para:
                current_course_id = "AWS-TE"
            else:
                current_course_id = "UNKNOWN"
        else:
            # 현재 섹션에 단락 추가
            if current_section:
                current_section.append(para)
    
    # 마지막 섹션 저장
    if current_section:
        sections.append({"course_id": current_course_id, "content": current_section})
    
    return sections

def analyze_with_bedrock_course(section_text):
    """Amazon Bedrock을 사용하여 과정 정보를 JSON으로 구조화"""
    try:
        # Bedrock 클라이언트 생성
        bedrock_runtime = boto3.client(
            service_name='bedrock-runtime',
            region_name=BEDROCK_REGION
        )
        
        # 프롬프트 작성
        prompt = f"""
        다음은 AWS 교육 과정에 대한 설명입니다. 이 텍스트를 분석하여 과정에 대한 정보를 추출해주세요.
        
        텍스트:
        {section_text}
        
        결과는 다음과 같은 JSON 형식으로 반환해주세요:
        {{
            "course_id": "과정의 약어 또는 코드 (예: AWS-CPE, AWS-ARCH 등)",
            "course_name": "과정의 전체 이름",
            "level": "과정 레벨 (초급/중급/고급)",
            "duration": "과정 소요 시간 (예: 1일, 2일, 3일)",
            "delivery_method": "강의 방식 (예: 강의식 교육(ILT) 및 실습)",
            "description": "과정에 대한 간략한 설명",
            "objectives": ["과정 목표 1", "과정 목표 2", ...],
            "target_audience": ["대상 1", "대상 2", ...]
        }}
        
        - course_id는 과정 이름의 영문 약어를 사용해 만들어주세요 (예: AWS Cloud Practitioner Essentials -> AWS-CPE)
        - 모든 필드를 최대한 정확하게 작성해주세요
        - 정보를 찾을 수 없는 경우 해당 필드를 제외하세요
        - 최대한 정확하게 분석해주세요
        """
        
        # Claude 모델 선택
        model_id = 'anthropic.claude-v2'
        
        # Bedrock API 호출
        response = bedrock_runtime.invoke_model(
            modelId=model_id,
            body=json.dumps({
                "prompt": f"\n\nHuman: {prompt}\n\nAssistant: ",
                "max_tokens_to_sample": 4000,
                "temperature": 0.0,
                "top_p": 1
            })
        )
        
        # 응답 처리
        response_body = json.loads(response['body'].read())
        result = response_body.get('completion', '').strip()
        
        # 추가: 원시 응답 로그 기록 (디버깅용)
        print(f"원시 응답: {result[:100]}...") # 응답의 앞부분만 출력
        
        # 개선된 JSON 추출
        try:
            # 먼저 전체 텍스트에서 JSON 형식 찾기 시도
            json_start = result.find('{')
            json_end = result.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_text = result[json_start:json_end]
                
                # 중간에 있는 특수 문자나 이스케이프 문자 처리
                json_text = json_text.replace('\n', ' ').replace('\r', '')
                
                # 추가 데이터 확인
                if json_end < len(result):
                    print(f"경고: JSON 이후 추가 데이터 발견 - {result[json_end:json_end+30]}...")
                
                # JSON 파싱 시도
                try:
                    return json.loads(json_text)
                except json.JSONDecodeError as e:
                    print(f"JSON 파싱 오류: {e}")
                    print(f"문제의 JSON 문자열: {json_text[:50]}...{json_text[-50:]} (총 {len(json_text)}자)")
                    
                    # 정규식을 사용하여 가장 바깥쪽 JSON 객체 추출 시도
                    import re
                    json_pattern = re.compile(r'(\{.*\})', re.DOTALL)
                    match = json_pattern.search(result)
                    if match:
                        try:
                            return json.loads(match.group(1))
                        except json.JSONDecodeError:
                            pass
            
            # 여전히 실패한 경우
            print("JSON 형식을 추출할 수 없음")
            return None
                
        except Exception as e:
            print(f"JSON 추출 중 오류: {e}")
            return None
            
    except Exception as e:
        print(f"Bedrock 분석 오류: {str(e)}")
        return None


def analyze_with_bedrock_module(section_text, course_id):
    """Amazon Bedrock을 사용하여 모듈 정보를 JSON으로 구조화"""
    try:
        # Bedrock 클라이언트 생성
        bedrock_runtime = boto3.client(
            service_name='bedrock-runtime',
            region_name=BEDROCK_REGION
        )
        
        # 프롬프트 작성
        prompt = f"""
        다음은 AWS 교육 과정 '{course_id}'의 내용입니다. 이 텍스트를 분석하여 교육 모듈과 실습에 대한 정보를 추출해주세요.
        
        텍스트:
        {section_text}
        
        결과는 다음과 같은 JSON 형식으로 반환해주세요:
        [
            {{
                "module_id": "과정ID-M숫자" 또는 "과정ID-LAB숫자",
                "course_id": "과정ID",
                "module_number": 숫자 또는 "LAB숫자",
                "module_name": "모듈 이름",
                "module_type": "강의" 또는 "실습",
                "module_description": "모듈 설명 요약"
            }},
            ...
        ]
        
        - module_id는 과정ID-M숫자(강의) 또는 과정ID-LAB숫자(실습) 형식이어야 합니다.
        - course_id는 '{course_id}'와 같은 형식입니다.
        - module_number는 강의의 경우 숫자, 실습의 경우 "LAB숫자" 형식입니다.
        - module_type은 "강의" 또는 "실습"으로 구분합니다.
        - 모듈이 발견되지 않으면 빈 배열 []을 반환합니다.
        - 최대한 정확하게 분석해주세요.
        """
        
        # Claude 모델 선택
        model_id = 'anthropic.claude-instant-v1'
        
        # Bedrock API 호출
        response = bedrock_runtime.invoke_model(
            modelId=model_id,
            body=json.dumps({
                "prompt": prompt,
                "max_tokens_to_sample": 4000,
                "temperature": 0.0,
                "top_p": 1
            })
        )
        
        # 응답 처리
        response_body = json.loads(response['body'].read())
        result = response_body.get('completion', '').strip()
        
        # JSON 부분 추출
        json_start = result.find('[')
        json_end = result.rfind(']') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_text = result[json_start:json_end]
            return json.loads(json_text)
        else:
            print(f"JSON 형식을 찾을 수 없음: {result}")
            return []
            
    except Exception as e:
        print(f"Bedrock 분석 오류: {str(e)}")
        return []

def process_docx_and_create_json():
    """워드 문서에서 과정 정보와 모듈 정보를 추출하여 JSON 파일 생성"""
    # 워드 파일 존재 여부 확인
    if not os.path.exists(DOCX_FILE_PATH):
        print(f"파일이 존재하지 않습니다: {DOCX_FILE_PATH}")
        return False, False
    
    # 워드 파일에서 텍스트 추출
    paragraphs = extract_text_from_docx(DOCX_FILE_PATH)
    if not paragraphs:
        print("워드 파일 내용이 없거나 읽을 수 없습니다.")
        return False, False
    
    # courses.json 생성
    if not os.path.exists('courses.json'):
        print("courses.json 파일 생성 중...")
        
        # 과정별 섹션 추출
        course_sections = extract_course_sections(paragraphs)
        if not course_sections:
            print("과정 섹션을 식별할 수 없습니다.")
            return False, False
        
        # 모든 과정 정보를 저장할 리스트
        all_courses = []
        
        # 각 섹션별로 Bedrock 분석 수행
        for i, section in enumerate(course_sections):
            section_text = "\n".join(section)
            
            print(f"과정 {i+1}/{len(course_sections)} 분석 중...")
            
            # 재시도 로직 추가
            max_retries = 2
            retry_count = 0
            course_info = None
            
            while retry_count <= max_retries and course_info is None:
                if retry_count > 0:
                    print(f"과정 {i+1} 분석 재시도 중... (시도 {retry_count}/{max_retries})")
                
                # Bedrock 호출 레이트 제한 방지를 위한 딜레이
                time.sleep(3)
                
                try:
                    # Bedrock 분석
                    course_info = analyze_with_bedrock_course(section_text)
                    
                    # 성공한 경우 루프 종료
                    if course_info:
                        break
                except Exception as e:
                    print(f"과정 {i+1} 분석 중 예외 발생: {e}")
                
                retry_count += 1
            
            # 분석된 과정 추가
            if course_info:
                all_courses.append(course_info)
                print(f"'{course_info.get('course_name', 'Unknown')}' 과정 정보 추출 완료")
            else:
                print(f"과정 {i+1} 정보 추출 실패 (최대 재시도 횟수 초과)")
        
        # 중복 제거 (course_id 기준)
        unique_courses = []
        course_ids = set()
        
        for course in all_courses:
            if course.get('course_id') and course['course_id'] not in course_ids:
                unique_courses.append(course)
                course_ids.add(course['course_id'])
        
        # courses.json 파일 생성
        with open('courses.json', 'w', encoding='utf-8') as f:
            json.dump(unique_courses, f, ensure_ascii=False, indent=4)
        
        print(f"{len(unique_courses)}개의 과정 정보가 courses.json에 저장되었습니다.")
        courses_created = True
    else:
        print("courses.json 파일이 이미 존재합니다.")
        courses_created = True
    
    # modules.json 생성
    if not os.path.exists('modules.json'):
        print("modules.json 파일 생성 중...")
        
        # 과정별 모듈 섹션 추출
        module_sections = extract_course_modules_sections(paragraphs)
        if not module_sections:
            print("모듈 섹션을 식별할 수 없습니다.")
            return courses_created, False
        
        # 모든 모듈 정보를 저장할 리스트
        all_modules = []
        
        # 각 섹션별로 Bedrock 분석 수행
        for section in module_sections:
            course_id = section["course_id"]
            section_text = "\n".join(section["content"])
            
            print(f"'{course_id}' 과정 모듈 분석 중...")
            
            # Bedrock 호출 레이트 제한 방지를 위한 딜레이
            time.sleep(3)
            
            # Bedrock 분석
            modules = analyze_with_bedrock_module(section_text, course_id)
            
            # 분석된 모듈 추가
            all_modules.extend(modules)
            
            print(f"'{course_id}' 과정에서 {len(modules)}개 모듈/실습 정보 추출 완료")
        
        # modules.json 파일 생성
        with open('modules.json', 'w', encoding='utf-8') as f:
            json.dump(all_modules, f, ensure_ascii=False, indent=4)
        
        print(f"{len(all_modules)}개의 모듈 정보가 modules.json에 저장되었습니다.")
        modules_created = True
    else:
        print("modules.json 파일이 이미 존재합니다.")
        modules_created = True
    
    return courses_created, modules_created

def load_json_data():
    """JSON 파일에서 데이터 로드"""
    
    # courses.json 로드
    with open('courses.json', 'r', encoding='utf-8') as f:
        courses_data = json.load(f)
    
    # modules.json 로드
    with open('modules.json', 'r', encoding='utf-8') as f:
        modules_data = json.load(f)
    
    return courses_data, modules_data

def import_data_to_dynamodb():
    """DynamoDB에 데이터 임포트"""

    # 세션 생성
    session = boto3.Session(region_name=REGION_NAME)
    
    # DynamoDB 리소스 및 클라이언트 생성
    dynamodb = session.resource('dynamodb')
    dynamodb_client = session.client('dynamodb')
    
    # 기존 테이블 목록 가져오기
    existing_tables = dynamodb_client.list_tables()['TableNames']
    
    # 과정 테이블 생성 (존재하지 않는 경우)
    if COURSE_TABLE_NAME not in existing_tables:
        print(f"테이블 생성 중: {COURSE_TABLE_NAME}")
        dynamodb_client.create_table(
            TableName=COURSE_TABLE_NAME,
            KeySchema=[
                {'AttributeName': 'id', 'KeyType': 'HASH'}  # 파티션 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'id', 'AttributeType': 'S'}
            ],
            ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
        )
        print(f"테이블 생성 완료: {COURSE_TABLE_NAME}")
        
        # 테이블이 활성화될 때까지 대기
        waiter = dynamodb_client.get_waiter('table_exists')
        print(f"{COURSE_TABLE_NAME} 테이블이 활성화될 때까지 대기 중...")
        waiter.wait(TableName=COURSE_TABLE_NAME)
    else:
        print(f"테이블이 이미 존재합니다: {COURSE_TABLE_NAME}")
    
    # 모듈 테이블 생성 (존재하지 않는 경우)
    if MODULE_TABLE_NAME not in existing_tables:
        print(f"테이블 생성 중: {MODULE_TABLE_NAME}")
        dynamodb_client.create_table(
            TableName=MODULE_TABLE_NAME,
            KeySchema=[
                {'AttributeName': 'module_id', 'KeyType': 'HASH'},  # 파티션 키
                {'AttributeName': 'course_id', 'KeyType': 'RANGE'}  # 정렬 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'module_id', 'AttributeType': 'S'},
                {'AttributeName': 'course_id', 'AttributeType': 'S'}
            ],
            ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
        )
        print(f"테이블 생성 완료: {MODULE_TABLE_NAME}")
        
        # 테이블이 활성화될 때까지 대기
        waiter = dynamodb_client.get_waiter('table_exists')
        print(f"{MODULE_TABLE_NAME} 테이블이 활성화될 때까지 대기 중...")
        waiter.wait(TableName=MODULE_TABLE_NAME)
    else:
        print(f"테이블이 이미 존재합니다: {MODULE_TABLE_NAME}")
    
    # 테이블 참조 가져오기
    course_table = dynamodb.Table(COURSE_TABLE_NAME)
    module_table = dynamodb.Table(MODULE_TABLE_NAME)
    
    # JSON 파일에서 데이터 로드
    courses_data, modules_data = load_json_data()
    
    # 과정 데이터 삽입
    print("과정 데이터 삽입 중...")
    for course in courses_data:
        # DynamoDB는 Decimal 형식을 사용하므로 JSON을 DynamoDB 형식으로 변환
        course_item = json.loads(json.dumps(course), parse_float=Decimal)
        
        # 테이블 키 매핑 - course_id를 id 키로 사용
        course_table.put_item(Item={
            'id': course['course_id'],  # course_id 값을 id 키로 사용
            **{k: v for k, v in course_item.items() if k != 'id'}  # 나머지 필드는 그대로 유지
        })
    print(f"{len(courses_data)}개의 과정 데이터 삽입 완료")
    
    # 모듈 데이터 삽입 - 모듈 테이블은 module_id, course_id가 이미 키로 사용됨
    print("모듈 데이터 삽입 중...")
    for module in modules_data:
        module_item = json.loads(json.dumps(module), parse_float=Decimal)
        module_table.put_item(Item=module_item)
    print(f"{len(modules_data)}개의 모듈 데이터 삽입 완료")
    
    print("모든 데이터가 성공적으로 DynamoDB에 저장되었습니다!")
    return True

def main():
    try:
        print("AWS 교육 과정 정보 추출 및 DynamoDB 저장 프로그램을 시작합니다.")
        
        # 1. 워드 문서에서 과정 및 모듈 정보 추출 & JSON 파일 생성
        courses_created, modules_created = process_docx_and_create_json()
        
        # 2. JSON 파일이 생성되었으면 DynamoDB에 데이터 임포트
        if courses_created and modules_created:
            import_data_to_dynamodb()
        else:
            print("JSON 파일 생성에 실패했습니다. DynamoDB 데이터 임포트를 건너뜁니다.")
        
        print("프로그램 실행이 완료되었습니다.")
        
    except Exception as e:
        print(f"오류 발생: {e}")

if __name__ == "__main__":
    main()