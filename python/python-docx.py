import json
import re
import uuid
import boto3
import time
from botocore.exceptions import ClientError
from docx import Document  # python-docx 라이브러리 사용

# Bedrock 클라이언트 설정
bedrock = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-east-1'  # 사용 중인 리전으로 변경하세요
)

# DynamoDB 클라이언트 설정
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')  # 사용 중인 리전으로 변경하세요
course_table = dynamodb.Table('Tnc-CourseCatalog')
module_table = dynamodb.Table('Tnc-CourseCatalog-Modules')

def read_docx_file(file_path):
    """DOCX 파일을 읽어 텍스트 내용을 추출합니다"""
    try:
        doc = Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            if para.text.strip():  # 빈 줄 제외
                full_text.append(para.text)
        return '\n'.join(full_text)
    except Exception as e:
        print(f"DOCX 파일 읽기 오류: {e}")
        return None

def extract_text_from_document():
    """문서에서 텍스트를 추출하는 대체 방법 (docx 파일을 읽을 수 없는 경우)"""
    with open("aws_courses_content.txt", "r", encoding="utf-8") as f:
        return f.read()

def split_text_into_chunks(text, max_chunk_size=10000):
    """긴 텍스트를 더 작은 청크로 분할합니다"""
    paragraphs = text.split('\n')
    chunks = []
    current_chunk = []
    current_size = 0
    
    for paragraph in paragraphs:
        # 이 단락을 추가하면 청크 크기가 제한을 초과하는지 확인
        if current_size + len(paragraph) > max_chunk_size and current_chunk:
            # 현재 청크를 청크 목록에 추가하고 새 청크 시작
            chunks.append('\n'.join(current_chunk))
            current_chunk = []
            current_size = 0
        
        current_chunk.append(paragraph)
        current_size += len(paragraph)
    
    # 마지막 청크 추가
    if current_chunk:
        chunks.append('\n'.join(current_chunk))
    
    return chunks

def safe_invoke_bedrock(prompt, max_retries=5, retry_delay=10):
    """재시도 로직이 있는 Bedrock 모델 호출"""
    retries = 0
    while retries < max_retries:
        try:
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
            return content
        
        except ClientError as e:
            if e.response['Error']['Code'] == 'ThrottlingException':
                retries += 1
                if retries < max_retries:
                    sleep_time = retry_delay * (2 ** (retries - 1))  # 지수 백오프
                    print(f"토큰 제한에 도달했습니다. {sleep_time}초 후에 재시도합니다 ({retries}/{max_retries})...")
                    time.sleep(sleep_time)
                else:
                    print("최대 재시도 횟수에 도달했습니다.")
                    raise
            else:
                raise

def extract_course_info_from_chunks(chunks):
    """여러 청크에서 과정 정보를 추출하고 결과 병합"""
    all_courses = []
    
    for i, chunk in enumerate(chunks):
        print(f"청크 {i+1}/{len(chunks)} 처리 중...")
        
        prompt = f"""
        다음 문서 청크에서 AWS 교육 과정의 정보를 추출해주세요:
        1. 과정명
        2. 레벨 (초급, 중급, 고급)
        3. 제공 방법
        4. 소요 시간
        5. 과정 목표 (bullet point 형태로 제공된 목표 목록)
        6. 수강 대상 (bullet point 형태로 제공된 대상 목록)
        7. 수강 전 권장 사항 (bullet point 형태로 제공된 권장사항 목록)
        
        이 청크에서 발견되는 과정만 추출하세요. 정보가 완전하지 않은 경우 해당 필드는 빈 목록으로 두세요.
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
        
        문서 청크:
        {chunk}
        """
        
        try:
            content = safe_invoke_bedrock(prompt)
            
            # JSON 부분 추출
            json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # JSON 형식으로 되어있지만 코드블록이 없는 경우 처리
                json_match = re.search(r'(\{.*\})', content, re.DOTALL)
                if json_match:
                    json_str = json_match.group(1)
                else:
                    print(f"청크 {i+1}에서 JSON을 찾을 수 없습니다.")
                    continue
            
            chunk_courses = json.loads(json_str).get('courses', [])
            
            # 고유 ID 추가
            for course in chunk_courses:
                if 'id' not in course or not course['id']:
                    course['id'] = str(uuid.uuid4())
            
            all_courses.extend(chunk_courses)
            
            # API 제한을 방지하기 위한 지연
            time.sleep(3)
            
        except Exception as e:
            print(f"청크 {i+1} 처리 중 오류: {e}")
    
    return {"courses": all_courses}

def extract_modules_and_labs_from_chunks(chunks):
    """여러 청크에서 모듈 및 실습 정보를 추출하고 결과 병합"""
    all_modules_and_labs = []
    
    for i, chunk in enumerate(chunks):
        print(f"모듈/실습 청크 {i+1}/{len(chunks)} 처리 중...")
        
        prompt = f"""
        다음 문서 청크에서 AWS 교육 과정의 모듈 및 실습 정보를 추출해주세요:
        1. 과정명
        2. 모듈 번호
        3. 모듈명
        4. 실습 번호 (있는 경우)
        5. 실습명 (있는 경우)
        
        이 청크에서 발견되는 정보만 추출하세요. 각 모듈과 실습을 별도의 항목으로 추출해주세요.
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
        
        문서 청크:
        {chunk}
        """
        
        try:
            content = safe_invoke_bedrock(prompt)
            
            # JSON 부분 추출
            json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # JSON 형식으로 되어있지만 코드블록이 없는 경우 처리
                json_match = re.search(r'(\{.*\})', content, re.DOTALL)
                if json_match:
                    json_str = json_match.group(1)
                else:
                    print(f"청크 {i+1}에서 JSON을 찾을 수 없습니다.")
                    continue
            
            chunk_modules = json.loads(json_str).get('modules_and_labs', [])
            
            # 고유 ID 추가
            for module in chunk_modules:
                if 'id' not in module or not module['id']:
                    module['id'] = str(uuid.uuid4())
            
            all_modules_and_labs.extend(chunk_modules)
            
            # API 제한을 방지하기 위한 지연
            time.sleep(3)
            
        except Exception as e:
            print(f"모듈/실습 청크 {i+1} 처리 중 오류: {e}")
    
    return {"modules_and_labs": all_modules_and_labs}

def save_to_json(data, filename):
    """데이터를 JSON 파일로 저장합니다"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"{filename} 파일이 생성되었습니다.")

def upload_to_dynamodb(courses_data, modules_data):
    """추출한 데이터를 DynamoDB에 업로드합니다"""
    # 과정 정보 업로드
    course_count = 0
    for course in courses_data['courses']:
        try:
            course_table.put_item(Item=course)
            course_count += 1
        except ClientError as e:
            print(f"과정 정보 업로드 실패: {e}")
    
    print(f"{course_count}개 과정 정보 업로드 완료")
    
    # 모듈 및 실습 정보 업로드
    module_count = 0
    for module in modules_data['modules_and_labs']:
        try:
            module_table.put_item(Item=module)
            module_count += 1
        except ClientError as e:
            print(f"모듈 정보 업로드 실패: {e}")
    
    print(f"{module_count}개 모듈/실습 정보 업로드 완료")

def process_document(file_path):
    """문서를 처리하고 정보를 추출합니다"""
    try:
        # DOCX 파일 읽기 시도
        print("DOCX 파일 읽기를 시도합니다...")
        document_content = read_docx_file(file_path)
        
        # DOCX 파일 읽기 실패 시 대체 방법 사용
        if not document_content:
            print("DOCX 파일을 읽을 수 없습니다. 대체 방법을 사용합니다...")
            document_content = extract_text_from_document()
        
        # 문서 내용을 청크로 분할
        print("문서를 청크로 분할합니다...")
        chunks = split_text_into_chunks(document_content)
        print(f"총 {len(chunks)}개의 청크로 분할되었습니다.")
        
        # 교육 과정 정보 추출 (청크별)
        print("과정 정보 추출 중...")
        courses_data = extract_course_info_from_chunks(chunks)
        if not courses_data['courses']:
            print("추출된 과정이 없습니다.")
            return
        
        save_to_json(courses_data, 'courses.json')
        
        # 모듈 및 실습 정보 추출 (청크별)
        print("모듈 및 실습 정보 추출 중...")
        modules_data = extract_modules_and_labs_from_chunks(chunks)
        save_to_json(modules_data, 'modules_and_labs.json')
        
        # DynamoDB에 업로드
        print("DynamoDB에 데이터 업로드 중...")
        upload_to_dynamodb(courses_data, modules_data)
        print("DynamoDB 업로드가 완료되었습니다.")
        
    except Exception as e:
        print(f"처리 중 오류 발생: {e}")

# 텍스트 파일에서 직접 읽는 방법
def create_text_from_content(content_str):
    """문서 내용을 텍스트 파일로 저장합니다"""
    with open("aws_courses_content.txt", "w", encoding="utf-8") as f:
        f.write(content_str)
    print("파일에서 내용을 성공적으로 저장했습니다.")

if __name__ == "__main__":
    # AWS TnC_ILT_DILT.docx 파일 경로
    document_file_path = "AWS TnC_ILT_DILT.docx"
    
    # 문서 처리
    process_document(document_file_path)