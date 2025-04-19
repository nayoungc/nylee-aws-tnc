import boto3
import re
import json
import uuid
import docx
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
from datetime import datetime
import time
from botocore.exceptions import ClientError
from tqdm import tqdm  # VS Code 콘솔 환경에 적합한 표준 tqdm 사용

# 데이터 클래스 정의
@dataclass
class Module:
    title: str
    topics: List[str] = field(default_factory=list)

@dataclass
class Lab:
    title: str
    description: str = ""

@dataclass
class Course:
    title: str
    description: str = ""
    level: str = ""
    delivery_method: str = ""
    duration: str = ""
    objectives: List[str] = field(default_factory=list)
    audience: List[str] = field(default_factory=list)
    prerequisites: List[str] = field(default_factory=list)
    registration_link: str = ""
    modules: List[Module] = field(default_factory=list)
    labs: List[Lab] = field(default_factory=list)

def extract_text_from_docx(file_path: str) -> str:
    """Word 문서에서 텍스트 추출"""
    try:
        doc = docx.Document(file_path)
        print(f"문서 파싱 중... (총 {len(doc.paragraphs)}개 단락)")
        full_text = []
        
        # 진행률 표시줄로 문서 단락 처리
        for para in tqdm(doc.paragraphs, desc="문서 단락 처리", ncols=100):
            full_text.append(para.text)
            
        return '\n'.join(full_text)
    except Exception as e:
        print(f"Word 문서 읽기 오류: {str(e)}")
        return ""

def extract_courses_from_text(text: str) -> List[Course]:
    """텍스트에서 과정 정보 추출"""
    courses = []
    
    # 정규 표현식 패턴으로 과정 블록 찾기
    course_blocks = re.findall(r'([^\n]+)\n\n과정 설명\n\n(.*?)(?=\n\n\t레벨\n\t제공 방법\n\t소요 시간|\n\n\n\n\n)', text, re.DOTALL)
    print(f"총 {len(course_blocks)}개 과정 블록 발견")
    
    # 진행률 표시줄로 과정 처리
    for title, content_block in tqdm(course_blocks, desc="과정 정보 추출", ncols=100):
        course = Course(title=title.strip())
        
        # 설명 추출
        description_match = re.search(r'과정 설명\n\n(.*?)(?=\n\n\t레벨)', content_block, re.DOTALL)
        if description_match:
            course.description = description_match.group(1).strip()
        
        # 레벨, 제공 방법, 소요 시간 추출
        level_match = re.search(r'\t레벨\n\n\t([^\n]+)', content_block)
        if level_match:
            course.level = level_match.group(1).strip()
            
        delivery_match = re.search(r'\t제공 방법\n\n\t([^\n]+)', content_block)
        if delivery_match:
            course.delivery_method = delivery_match.group(1).strip()
            
        duration_match = re.search(r'\t소요 시간\n\n\t([^\n]+)', content_block)
        if duration_match:
            course.duration = duration_match.group(1).strip()
        
        # 과정 목표 추출
        objectives_match = re.search(r'과정 목표\n\n이 과정에서 배우게 될 내용은 다음과 같습니다.\n\n(.*?)(?=\n\n수강 대상|\n\n등록)', content_block, re.DOTALL)
        if objectives_match:
            objectives_text = objectives_match.group(1)
            course.objectives = [obj.strip() for obj in re.findall(r'·\s*(.*?)(?=\n·|\n\n|\$)', objectives_text, re.DOTALL)]
        
        # 수강 대상 추출
        audience_match = re.search(r'수강 대상\n\n이 과정의 대상은 다음과 같습니다.\n\n(.*?)(?=\n\n수강 전 권장 사항|\n\n등록)', content_block, re.DOTALL)
        if audience_match:
            audience_text = audience_match.group(1)
            course.audience = [aud.strip() for aud in re.findall(r'·\s*(.*?)(?=\n·|\n\n|\$)', audience_text, re.DOTALL)]
        
        # 수강 전 권장 사항 추출
        prereq_match = re.search(r'수강 전 권장 사항\n\n이 과정을 수강하려면 다음 조건을 갖추는 것이 좋습니다.\n\n(.*?)(?=\n\n등록)', content_block, re.DOTALL)
        if prereq_match:
            prereq_text = prereq_match.group(1)
            course.prerequisites = [pre.strip() for pre in re.findall(r'·\s*(.*?)(?=\n·|\n\n|\$)', prereq_text, re.DOTALL)]
        
        # 등록 링크 추출
        reg_match = re.search(r'등록\n\n(.*?)(?=\n\n\t과정 개요|\n\n)', content_block, re.DOTALL)
        if reg_match:
            course.registration_link = reg_match.group(1).strip()
        
        # 과정 개요(모듈) 추출
        modules_section_match = re.search(r'\t과정 개요\n\n(.*?)(?=\n\n\d일 차|\n\n모듈|\n\n\$)', content_block, re.DOTALL)
        if modules_section_match:
            modules_text = modules_section_match.group(1)
            
            # 모듈 파싱
            module_blocks = re.findall(r'모듈 (\d+)[^:]*:\s*([^\n]+)\n\n(·[^모듈]*?)(?=모듈|\n\n\n|\$)', modules_text, re.DOTALL)
            if module_blocks:
                for _, title, topics_text in module_blocks:
                    module = Module(title=title.strip())
                    topics = re.findall(r'·\s*(.*?)(?=\n·|\n\n|\$)', topics_text, re.DOTALL)
                    module.topics = [topic.strip() for topic in topics]
                    course.modules.append(module)
            else:
                # 일 차 기준으로 모듈 추출 시도
                day_modules = re.findall(r'(\d일 차)\n\n(.*?)(?=\n\n\d일 차|\n\n\$)', content_block, re.DOTALL)
                for day, content in day_modules:
                    module = Module(title=f"{day} 강의 내용")
                    topics = re.findall(r'·\s*(.*?)(?=\n·|\n\n|\$)|모듈 \d+[^:]*:\s*([^\n]+)', content, re.DOTALL)
                    module.topics = [t[0] or t[1] for t in topics if t[0] or t[1]]
                    course.modules.append(module)
        
        # 실습 추출
        labs_match = re.findall(r'실습 (\d+)[^:]*:\s*([^\n]+)(?:\n\n([^실습].*?))?(?=\n\n실습|\n\n\n|\$)', content_block, re.DOTALL)
        
        for _, title, description in labs_match:
            lab = Lab(
                title=title.strip(),
                description=description.strip() if description else ""
            )
            course.labs.append(lab)
        
        courses.append(course)
    
    return courses

def wait_with_progress(check_function, max_attempts=30, delay=2, desc="작업 진행 중"):
    """진행률 표시줄과 함께 작업이 완료될 때까지 대기"""
    for i in tqdm(range(max_attempts), desc=desc, ncols=100):
        if check_function():
            return True
        time.sleep(delay)
    return False

def delete_table_if_exists(table_name: str, region: str = 'ap-northeast-2'):
    """테이블이 존재하면 삭제"""
    dynamodb = boto3.client('dynamodb', region_name=region)
    
    try:
        dynamodb.describe_table(TableName=table_name)
        print(f"테이블 '{table_name}'이 존재합니다. 삭제 중...")
        dynamodb.delete_table(TableName=table_name)
        
        # 테이블 삭제가 완료될 때까지 대기
        def check_table_deleted():
            try:
                dynamodb.describe_table(TableName=table_name)
                return False
            except ClientError as e:
                if e.response['Error']['Code'] == 'ResourceNotFoundException':
                    return True
                raise e
        
        if wait_with_progress(check_table_deleted, desc="테이블 삭제 대기"):
            print(f"테이블 '{table_name}' 삭제 완료")
        else:
            print(f"테이블 '{table_name}' 삭제 대기 시간 초과")
        
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            print(f"테이블 '{table_name}'이 존재하지 않습니다.")
        else:
            raise e

def create_table_with_indexes(table_name: str, region: str = 'ap-northeast-2'):
    """GSI와 LSI를 포함한 새 테이블 생성"""
    dynamodb = boto3.client('dynamodb', region_name=region)
    
    try:
        print(f"테이블 '{table_name}' 생성 중...")
        response = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {'AttributeName': 'PK', 'KeyType': 'HASH'},
                {'AttributeName': 'SK', 'KeyType': 'RANGE'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'PK', 'AttributeType': 'S'},
                {'AttributeName': 'SK', 'AttributeType': 'S'},
                {'AttributeName': 'type', 'AttributeType': 'S'},
                {'AttributeName': 'level', 'AttributeType': 'S'},
                {'AttributeName': 'deliveryMethod', 'AttributeType': 'S'},
                {'AttributeName': 'duration', 'AttributeType': 'S'},
                {'AttributeName': 'title', 'AttributeType': 'S'},
                {'AttributeName': 'moduleOrder', 'AttributeType': 'N'},
                {'AttributeName': 'labOrder', 'AttributeType': 'N'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'TypeIndex',
                    'KeySchema': [
                        {'AttributeName': 'type', 'KeyType': 'HASH'},
                        {'AttributeName': 'title', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'LevelIndex',
                    'KeySchema': [
                        {'AttributeName': 'level', 'KeyType': 'HASH'},
                        {'AttributeName': 'title', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'DeliveryMethodIndex',
                    'KeySchema': [
                        {'AttributeName': 'deliveryMethod', 'KeyType': 'HASH'},
                        {'AttributeName': 'title', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'DurationIndex',
                    'KeySchema': [
                        {'AttributeName': 'duration', 'KeyType': 'HASH'},
                        {'AttributeName': 'title', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'},
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            LocalSecondaryIndexes=[
                {
                    'IndexName': 'ModuleOrderIndex',
                    'KeySchema': [
                        {'AttributeName': 'PK', 'KeyType': 'HASH'},
                        {'AttributeName': 'moduleOrder', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                },
                {
                    'IndexName': 'LabOrderIndex',
                    'KeySchema': [
                        {'AttributeName': 'PK', 'KeyType': 'HASH'},
                        {'AttributeName': 'labOrder', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        
        # 테이블 생성이 완료될 때까지 대기
        def check_table_active():
            try:
                response = dynamodb.describe_table(TableName=table_name)
                return response['Table']['TableStatus'] == 'ACTIVE'
            except:
                return False
                
        if wait_with_progress(check_table_active, desc="테이블 생성 대기"):
            print(f"테이블 '{table_name}' 생성 완료 (GSI 및 LSI 포함)")
            return True
        else:
            print(f"테이블 '{table_name}' 생성 대기 시간 초과")
            return False
            
    except Exception as e:
        print(f"테이블 생성 중 오류 발생: {str(e)}")
        return False

def save_courses_to_dynamodb(courses: List[Course], table_name: str, region: str = 'ap-northeast-2'):
    """과정 데이터를 DynamoDB에 저장"""
    dynamodb = boto3.resource('dynamodb', region_name=region)
    table = dynamodb.Table(table_name)
    timestamp = datetime.now().isoformat()
    
    total_items = 0
    all_items = []  # 모든 항목을 저장
    
    # 진행률 표시줄로 과정 저장 진행 표시
    for course in tqdm(courses, desc="과정 데이터 준비", ncols=100):
        # 과정 ID 생성 (UUID v4)
        course_id = str(uuid.uuid4())
        
        # 과정 메타데이터 항목
        course_item = {
            'PK': f"COURSE#{course_id}",
            'SK': f"METADATA#{course_id}",
            'id': course_id,
            'title': course.title,
            'description': course.description,
            'level': course.level,
            'deliveryMethod': course.delivery_method,
            'duration': course.duration,
            'registrationLink': course.registration_link,
            'type': 'Course',
            'createdAt': timestamp,
            'updatedAt': timestamp
        }
        
        if course.objectives:
            course_item['objectives'] = course.objectives
            
        if course.audience:
            course_item['audience'] = course.audience
            
        if course.prerequisites:
            course_item['prerequisites'] = course.prerequisites
        
        all_items.append(course_item)
        total_items += 1
        
        # 모듈 항목 준비
        for idx, module in enumerate(course.modules):
            module_index = str(idx).zfill(3)  # 001, 002, 003, ...
            module_item = {
                'PK': f"COURSE#{course_id}",
                'SK': f"MODULE#{module_index}",
                'id': f"{course_id}#MODULE#{module_index}",
                'title': module.title,
                'topics': module.topics if module.topics else [],
                'moduleOrder': idx,
                'type': 'Module',
                'courseId': course_id,
                'createdAt': timestamp,
                'updatedAt': timestamp
            }
            all_items.append(module_item)
            total_items += 1
        
        # 실습 항목 준비
        for idx, lab in enumerate(course.labs):
            lab_index = str(idx).zfill(3)  # 001, 002, 003, ...
            lab_item = {
                'PK': f"COURSE#{course_id}",
                'SK': f"LAB#{lab_index}",
                'id': f"{course_id}#LAB#{lab_index}",
                'title': lab.title,
                'description': lab.description,
                'labOrder': idx,
                'type': 'Lab',
                'courseId': course_id,
                'createdAt': timestamp,
                'updatedAt': timestamp
            }
            all_items.append(lab_item)
            total_items += 1
    
    # 배치로 항목 저장
    batch_size = 25  # DynamoDB 배치 쓰기 제한
    
    # 계산된 배치 수
    num_batches = (len(all_items) + batch_size - 1) // batch_size
    
    print(f"총 {len(all_items)}개 항목을 {num_batches}개 배치로 저장합니다.")
    
    # 배치 처리 진행률 표시 (VS Code에 맞는 표준 tqdm)
    for i in tqdm(range(0, len(all_items), batch_size), desc="DynamoDB에 데이터 저장", ncols=100):
        batch = all_items[i:i+batch_size]
        try:
            with table.batch_writer() as writer:
                for item in batch:
                    writer.put_item(Item=item)
        except Exception as e:
            print(f"배치 저장 중 오류 발생: {str(e)}")
            continue
    
    print(f"전체 {len(courses)}개 과정에서 총 {total_items}개 항목 저장 완료")

def main():
    # 설정값
    TABLE_NAME = 'Tnc-CourseCatalog'
    REGION = 'ap-northeast-2'  # 필요하면 변경
    DOC_FILE = 'AWS TnC _ILT_DILT.docx'
    
    try:
        # tqdm을 올바르게 설치했는지 확인
        import importlib
        if importlib.util.find_spec("tqdm") is None:
            print("tqdm 라이브러리 설치 중...")
            import sys
            import subprocess
            subprocess.check_call([sys.executable, "-m", "pip", "install", "tqdm"])
            print("tqdm 설치 완료")
        
        # python-docx 설치 확인
        if importlib.util.find_spec("docx") is None:
            print("python-docx 라이브러리 설치 중...")
            import sys
            import subprocess
            subprocess.check_call([sys.executable, "-m", "pip", "install", "python-docx"])
            print("python-docx 설치 완료")
        
        # 테이블 삭제 및 재생성
        delete_table_if_exists(TABLE_NAME, REGION)
        if not create_table_with_indexes(TABLE_NAME, REGION):
            print("테이블 생성에 실패했습니다. 작업을 중단합니다.")
            return
        
        # Word 문서에서 텍스트 추출
        print(f"문서 '{DOC_FILE}'에서 텍스트 추출 중...")
        text = extract_text_from_docx(DOC_FILE)
        if not text:
            print(f"파일 '{DOC_FILE}'에서 텍스트를 추출할 수 없습니다.")
            return
            
        # 텍스트 파일로 저장 (디버깅용)
        with open('extracted_text.txt', 'w', encoding='utf-8') as f:
            f.write(text)
            
        # 과정 추출
        print("과정 정보 추출 중...")
        courses = extract_courses_from_text(text)
        print(f"{len(courses)}개의 과정 추출 완료")
        
        # 디버깅용 JSON 저장
        with open('extracted_courses.json', 'w', encoding='utf-8') as f:
            json.dump([asdict(course) for course in courses], f, ensure_ascii=False, indent=2)
        
        # DynamoDB에 저장
        print("DynamoDB에 데이터 저장 중...")
        save_courses_to_dynamodb(courses, TABLE_NAME, REGION)
        print("모든 처리가 완료되었습니다.")
        
    except Exception as e:
        print(f"오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()