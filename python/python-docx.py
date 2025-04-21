import boto3
from botocore.exceptions import ClientError
import time

def create_course_catalog_tables():
    """AWS 교육 과정 관련 DynamoDB 테이블들을 생성합니다."""
    
    dynamodb = boto3.client('dynamodb')
    
    # 1. Tnc-CourseCatalog 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-CourseCatalog',
            KeySchema=[
                {'AttributeName': 'catalogId', 'KeyType': 'HASH'},  # 파티션 키
                {'AttributeName': 'version', 'KeyType': 'RANGE'}    # 정렬 키
            ],
            AttributeDefinitions=[
                {'AttributeName': 'catalogId', 'AttributeType': 'S'},
                {'AttributeName': 'version', 'AttributeType': 'S'},
                {'AttributeName': 'title', 'AttributeType': 'S'},
                {'AttributeName': 'awsCode', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'title', 'KeyType': 'HASH'},
                        {'AttributeName': 'version', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'GSI2',
                    'KeySchema': [
                        {'AttributeName': 'awsCode', 'KeyType': 'HASH'},
                        {'AttributeName': 'version', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        print(f"테이블 생성 중: Tnc-CourseCatalog")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print(f"테이블이 이미 존재합니다: Tnc-CourseCatalog")
        else:
            print(f"Error: {e.response['Error']['Message']}")
    
    # 2. Tnc-CourseCatalog-Modules 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-CourseCatalog-Modules',
            KeySchema=[
                {'AttributeName': 'catalogId', 'KeyType': 'HASH'},
                {'AttributeName': 'moduleNumber', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'catalogId', 'AttributeType': 'S'},
                {'AttributeName': 'moduleNumber', 'AttributeType': 'S'},
                {'AttributeName': 'moduleId', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'moduleId', 'KeyType': 'HASH'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        print(f"테이블 생성 중: Tnc-CourseCatalog-Modules")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print(f"테이블이 이미 존재합니다: Tnc-CourseCatalog-Modules")
        else:
            print(f"Error: {e.response['Error']['Message']}")
    
    # 3. Tnc-CourseCatalog-Labs 테이블 생성
    try:
        response = dynamodb.create_table(
            TableName='Tnc-CourseCatalog-Labs',
            KeySchema=[
                {'AttributeName': 'catalogId', 'KeyType': 'HASH'},
                {'AttributeName': 'labId', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'catalogId', 'AttributeType': 'S'},
                {'AttributeName': 'labId', 'AttributeType': 'S'},
                {'AttributeName': 'moduleId', 'AttributeType': 'S'},
                {'AttributeName': 'labNumber', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'moduleId', 'KeyType': 'HASH'},
                        {'AttributeName': 'labNumber', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        print(f"테이블 생성 중: Tnc-CourseCatalog-Labs")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print(f"테이블이 이미 존재합니다: Tnc-CourseCatalog-Labs")
        else:
            print(f"Error: {e.response['Error']['Message']}")

    # 테이블 생성 완료 대기
    tables = ['Tnc-CourseCatalog', 'Tnc-CourseCatalog-Modules', 'Tnc-CourseCatalog-Labs']
    for table in tables:
        try:
            print(f"{table} 테이블 생성 상태 확인 중...")
            wait_for_table_creation(table)
        except Exception as e:
            print(f"테이블 상태 확인 오류 {table}: {str(e)}")

def wait_for_table_creation(table_name):
    """테이블이 생성될 때까지 대기합니다."""
    dynamodb = boto3.client('dynamodb')
    
    max_retries = 10
    retries = 0
    
    while retries < max_retries:
        try:
            response = dynamodb.describe_table(TableName=table_name)
            status = response['Table']['TableStatus']
            
            if status == 'ACTIVE':
                print(f"테이블 {table_name}이(가) 성공적으로 생성되었습니다!")
                return True
            
            print(f"테이블 {table_name} 상태: {status} - 대기 중...")
            time.sleep(5)  # 5초 대기
            retries += 1
        except ClientError as e:
            print(f"테이블 상태 확인 오류: {str(e)}")
            return False
    
    print(f"테이블 {table_name} 생성 시간 초과")
    return False

if __name__ == "__main__":
    create_course_catalog_tables()
2. Claude를 이용한 데이터 추출 및 DynamoDB 업로드 코드
import boto3
import json
import os
import anthropic
import docx
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Any
import time

# Anthropic Claude API 키 (환경 변수에서 가져옵니다)
CLAUDE_API_KEY = os.environ.get("CLAUDE_API_KEY")

def extract_text_from_docx(file_path):
    """워드 문서에서 텍스트를 추출합니다."""
    doc = docx.Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

def get_course_version_from_awstc(course_code):
    """releases.awstc.com에서 과정 버전 정보를 가져옵니다."""
    # 참고: 실제 구현에서는 사이트 접근 권한이 필요할 수 있습니다
    # 여기서는 가상의 버전 정보를 반환합니다
    default_versions = {
        "ARCHAWS": "3.0",
        "SECUR": "3.1",
        "DEVOPS": "2.5",
        "DEVELOPING": "3.2",
        "MLOPS": "1.0",
        "WELLARCH": "2.0",
        "TECHDCT": "3.0"
    }
    
    return default_versions.get(course_code, "1.0")

def extract_data_with_claude(text, prompt_type):
    """Claude AI를 사용하여 텍스트에서 정보를 추출합니다."""
    client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)
    
    prompts = {
        "catalog": """
        다음 문서는 AWS 교육 과정 카탈로그 정보입니다. 이 텍스트에서 모든 교육 과정에 대한 정보를 추출하여 다음 JSON 형식으로 반환해주세요:
        
        [
          {
            "catalogId": "과정 레벨-과정코드 형식으로",
            "title": "과정 제목",
            "awsCode": "AWS 공식 과정 코드",
            "level": "교육 레벨 (100, 200, 300 중 하나)",
            "delivery_method": "강의형태",
            "duration": "소요 시간",
            "objectives": ["교육 목표1", "교육 목표2", ...],
            "target_audience": ["교육 대상1", "교육 대상2", ...],
            "prerequisites": ["사전 요구사항1", "사전 요구사항2", ...],
            "status": "활성",
            "created_date": "2023-01-01",
            "source_url": "https://releases.awstc.com/과정코드",
            "aws_services": ["관련 서비스1", "관련 서비스2", ...],
            "keywords": ["키워드1", "키워드2", ...]
          },
          ...
        ]
        
        과정 레벨은 초급의 경우 100, 중급의 경우 200, 고급의 경우 300으로 설정하세요.
        """,
        
        "modules": """
        다음 문서는 AWS 교육 과정의 모듈 정보입니다. 이 텍스트에서 각 과정의 모듈 정보를 추출하여 다음 JSON 형식으로 반환해주세요:
        
        [
          {
            "catalogId": "과정 레벨-과정코드 형식으로",
            "moduleNumber": "모듈 번호 (01, 02 등)",
            "moduleId": "카탈로그ID-M번호 형식",
            "module_title": "모듈 제목",
            "description": "모듈 설명",
            "duration": "예상 소요시간",
            "catalog_version": "연결된 카탈로그 버전"
          },
          ...
        ]
        
        각 과정에 포함된 모든 모듈을 추출해주세요.
        """,
        
        "labs": """
        다음 문서는 AWS 교육 과정의 실습 정보입니다. 이 텍스트에서 각 과정의 실습 정보를 추출하여 다음 JSON 형식으로 반환해주세요:
        
        [
          {
            "catalogId": "과정 레벨-과정코드 형식으로",
            "labId": "LAB-일련번호",
            "moduleId": "관련 모듈 ID",
            "labNumber": "실습 번호",
            "lab_title": "실습 제목",
            "description": "실습 설명",
            "duration": "예상 소요시간",
            "difficulty": "난이도 (1-5)",
            "catalog_version": "연결된 카탈로그 버전"
          },
          ...
        ]
        
        각 과정에 포함된 모든 실습을 추출해주세요.
        """
    }
    
    message = client.messages.create(
        model="claude-2",
        max_tokens=4000,
        temperature=0.0,
        system="당신은 텍스트에서 정보를 추출하여 구조화된 데이터로 반환하는 도우미입니다.",
        messages=[
            {"role": "user", "content": prompts[prompt_type] + "\n\n문서 내용:\n" + text}
        ]
    )
    
    # 결과에서 JSON 부분만 추출
    response_text = message.content[0].text
    json_start = response_text.find('[')
    json_end = response_text.rfind(']') + 1
    
    if json_start >= 0 and json_end > json_start:
        json_str = response_text[json_start:json_end]
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            print(f"JSON 파싱 오류, 전체 응답: {response_text}")
            return []
    else:
        print(f"JSON 데이터를 찾을 수 없음, 전체 응답: {response_text}")
        return []

def save_to_json(data, filename):
    """데이터를 JSON 파일로 저장합니다."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"{filename} 파일이 생성되었습니다.")

def upload_to_dynamodb(table_name, items, ask_confirmation=True):
    """데이터를 DynamoDB 테이블에 업로드합니다."""
    if ask_confirmation:
        confirmation = input(f"{len(items)}개의 항목을 {table_name} 테이블에 업로드하시겠습니까? (y/n): ")
        if confirmation.lower() != 'y':
            print("업로드가 취소되었습니다.")
            return False
    
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)
    
    # 배치로 항목 추가
    with table.batch_writer() as batch:
        for item in items:
            batch.put_item(Item=item)
    
    print(f"{len(items)}개의 항목이 {table_name} 테이블에 업로드되었습니다.")
    return True

def process_documents():
    """워드 문서를 처리하고 데이터를 추출합니다."""
    
    # 1. 문서에서 텍스트 추출
    tnc_text = extract_text_from_docx("AWS TnC _ILT_DILT.docx")
    
    # 2. Claude를 이용한 데이터 추출
    print("카탈로그 정보 추출 중...")
    catalog_data = extract_data_with_claude(tnc_text, "catalog")
    
    print("모듈 정보 추출 중...")
    modules_data = extract_data_with_claude(tnc_text, "modules")
    
    print("실습 정보 추출 중...")
    labs_data = extract_data_with_claude(tnc_text, "labs")
    
    # 3. 버전 정보 추가
    for item in catalog_data:
        aws_code = item.get("awsCode", "")
        version = get_course_version_from_awstc(aws_code)
        item["version"] = version
    
    # 4. 데이터를 JSON 파일로 저장
    save_to_json(catalog_data, "course_catalog.json")
    save_to_json(modules_data, "course_modules.json")
    save_to_json(labs_data, "course_labs.json")
    
    # 5. 사용자 확인 후 DynamoDB에 업로드
    print("\nJSON 파일이 생성되었습니다. DynamoDB에 업로드하시겠습니까?")
    if input("계속 진행하려면 'y'를 입력하세요: ").lower() == 'y':
        upload_to_dynamodb("Tnc-CourseCatalog", catalog_data)
        upload_to_dynamodb("Tnc-CourseCatalog-Modules", modules_data)
        upload_to_dynamodb("Tnc-CourseCatalog-Labs", labs_data)
    else:
        print("DynamoDB 업로드를 건너뛰었습니다. JSON 파일을 확인하고 나중에 업로드할 수 있습니다.")

if __name__ == "__main__":
    print("AWS 교육 과정 데이터 추출 및 DynamoDB 업로드 시작")
    
    # 환경 변수 확인
    if not CLAUDE_API_KEY:
        print("오류: CLAUDE_API_KEY 환경 변수가 설정되지 않았습니다.")
        print("다음 명령으로 API 키를 설정하세요:")
        print("export CLAUDE_API_KEY=your_api_key_here (Linux/Mac)")
        print("set CLAUDE_API_KEY=your_api_key_here (Windows)")
        exit(1)
    
    # 1. 먼저 테이블 생성
    create_choice = input("DynamoDB 테이블을 생성하시겠습니까? (y/n): ")
    if create_choice.lower() == 'y':
        create_course_catalog_tables()
    
    # 2. 데이터 추출 및 업로드
    extract_choice = input("워드 문서에서 데이터를 추출하시겠습니까? (y/n): ")
    if extract_choice.lower() == 'y':
        process_documents()
    
    print("프로세스가 완료되었습니다.")