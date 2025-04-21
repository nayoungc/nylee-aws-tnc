import json
import re
import uuid
import boto3
from botocore.exceptions import ClientError

# Bedrock 클라이언트 설정
bedrock = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-east-1'  # 사용 중인 리전으로 변경하세요
)

# DynamoDB 클라이언트 설정
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')  # 사용 중인 리전으로 변경하세요
course_table = dynamodb.Table('Tnc-CourseCatalog')
module_table = dynamodb.Table('Tnc-CourseCatalog-Modules')

def extract_course_info(document_content):
    """Bedrock Claude를 사용하여 과정 정보를 추출합니다"""
    
    prompt = f"""
    다음 문서에서 각 AWS 교육 과정의 정보를 추출해주세요:
    1. 과정명
    2. 레벨 (초급, 중급, 고급)
    3. 제공 방법
    4. 소요 시간
    5. 과정 목표
    6. 수강 대상
    7. 수강 전 권장 사항
    
    각 과정마다 명확하게 구분하여 JSON 형식으로 응답해주세요.
    JSON 형식은 정확히 다음과 같아야 합니다:
    {{
        "courses": [
            {{
                "id": "고유식별자",
                "title": "과정명",
                "level": "레벨",
                "delivery_method": "제공 방법",
                "duration": "소요 시간",
                "objectives": ["목표1", "목표2", ...],
                "target_audience": ["대상1", "대상2", ...],
                "prerequisites": ["권장사항1", "권장사항2", ...]
            }},
            ...
        ]
    }}
    
    문서 내용:
    {document_content}
    """
    
    response = bedrock.invoke_model(
        modelId='anthropic.claude-3-sonnet-20240229-v1:0',
        contentType='application/json',
        accept='application/json',
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 8000,
            "temperature": 0,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })
    )
    
    response_body = json.loads(response['body'].read().decode('utf-8'))
    content = response_body['content'][0]['text']
    
    # JSON 부분 추출 (```json과 ``` 사이의 내용)
    json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
    else:
        # JSON 형식으로 되어있지만 코드블록이 없는 경우 처리
        json_str = re.search(r'(\{.*\})', content, re.DOTALL).group(1)
    
    return json.loads(json_str)

def extract_modules_and_labs(document_content):
    """Bedrock Claude를 사용하여 모듈 및 실습 정보를 추출합니다"""
    
    prompt = f"""
    다음 문서에서 각 AWS 교육 과정의 모듈 및 실습 정보를 추출해주세요:
    1. 과정명
    2. 모듈 번호
    3. 모듈명
    4. 실습 번호 (있는 경우)
    5. 실습명 (있는 경우)
    
    모든 모듈과 실습을 찾아서 정확하게, 과정별로 그룹화하여 JSON 형식으로 응답해주세요.
    JSON 형식은 정확히 다음과 같아야 합니다:
    {{
        "modules_and_labs": [
            {{
                "id": "고유식별자",
                "course_title": "과정명",
                "module_number": "모듈 번호",
                "module_title": "모듈명",
                "lab_number": "실습 번호 (없으면 null)",
                "lab_title": "실습명 (없으면 null)"
            }},
            ...
        ]
    }}
    
    각 모듈과 실습에 대해 별도의 항목이 있어야 합니다.
    문서 내용:
    {document_content}
    """
    
    response = bedrock.invoke_model(
        modelId='anthropic.claude-3-sonnet-20240229-v1:0',
        contentType='application/json',
        accept='application/json',
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 8000,
            "temperature": 0,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })
    )
    
    response_body = json.loads(response['body'].read().decode('utf-8'))
    content = response_body['content'][0]['text']
    
    # JSON 부분 추출
    json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
    else:
        # JSON 형식으로 되어있지만 코드블록이 없는 경우 처리
        json_str = re.search(r'(\{.*\})', content, re.DOTALL).group(1)
    
    return json.loads(json_str)

def save_to_json(data, filename):
    """데이터를 JSON 파일로 저장합니다"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def upload_to_dynamodb(courses_data, modules_data):
    """추출한 데이터를 DynamoDB에 업로드합니다"""
    # 과정 정보 업로드
    for course in courses_data['courses']:
        try:
            course_table.put_item(Item=course)
            print(f"과정 정보 업로드 성공: {course['title']}")
        except ClientError as e:
            print(f"과정 정보 업로드 실패: {e}")
    
    # 모듈 및 실습 정보 업로드
    for module in modules_data['modules_and_labs']:
        try:
            module_table.put_item(Item=module)
            print(f"모듈 정보 업로드 성공: {module['course_title']} - {module['module_title']}")
        except ClientError as e:
            print(f"모듈 정보 업로드 실패: {e}")

def process_document(file_path):
    """문서를 처리하고 정보를 추출합니다"""
    with open(file_path, 'r', encoding='utf-8') as file:
        document_content = file.read()
    
    # 교육 과정 정보 추출
    print("과정 정보 추출 중...")
    courses_data = extract_course_info(document_content)
    save_to_json(courses_data, 'courses.json')
    print("courses.json 파일이 생성되었습니다.")
    
    # 모듈 및 실습 정보 추출
    print("모듈 및 실습 정보 추출 중...")
    modules_data = extract_modules_and_labs(document_content)
    save_to_json(modules_data, 'modules_and_labs.json')
    print("modules_and_labs.json 파일이 생성되었습니다.")
    
    # DynamoDB에 업로드
    print("DynamoDB에 데이터 업로드 중...")
    upload_to_dynamodb(courses_data, modules_data)
    print("DynamoDB 업로드가 완료되었습니다.")

if __name__ == "__main__":
    document_file_path = "aws_tnc_courses.txt"  # 문서 파일 경로
    process_document(document_file_path)