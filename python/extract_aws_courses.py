import boto3
import re
import json
import uuid
import os
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

def analyze_document_structure(doc_path):
    """문서 구조를 분석하여 패턴 파악"""
    doc = docx.Document(doc_path)
    print(f"문서 분석 - 총 {len(doc.paragraphs)} 단락")
    
    # 주요 구조 패턴 찾기
    patterns = {
        "과정 설명": 0,
        "레벨": 0,
        "제공 방법": 0,
        "소요 시간": 0,
        "과정 목표": 0,
        "수강 대상": 0,
        "수강 전 권장 사항": 0,
        "등록": 0,
        "과정 개요": 0
    }
    
    # 단락 내용 분석
    for i, para in enumerate(doc.paragraphs[:min(500, len(doc.paragraphs))]):
        text = para.text.strip()
        for pattern in patterns:
            if text == pattern:
                patterns[pattern] += 1
                print(f"발견: '{pattern}' at 단락 {i}")
                
                # 다음 5개 단락 확인
                context = []
                for j in range(1, 6):
                    if i+j < len(doc.paragraphs):
                        next_text = doc.paragraphs[i+j].text.strip()
                        if next_text:
                            context.append(next_text)
                print(f"  다음 내용: {context[:3]}...")
    
    print("\n주요 패턴 발견 횟수:")
    for pattern, count in patterns.items():
        print(f"  '{pattern}': {count}회")
    
    # 목차 또는 구조가 있는지 확인
    print("\n문서 처음 20줄:")
    for i, para in enumerate(doc.paragraphs[:20]):
        if para.text.strip():
            print(f"{i:3d}: {para.text}")
    
    return patterns

def direct_extract_courses_from_docx(file_path):
    """docx 파일에서 직접 과정 정보 추출"""
    doc = docx.Document(file_path)
    courses = []
    
    # 과정 검색을 위한 조건
    is_course_title = lambda text: (
        text and 
        not text.startswith("AWS ") and 
        not text.startswith("Digital") and
        len(text) > 5 and
        "소개" not in text and
        "과정" not in text and
        "모듈" not in text and
        "개요" not in text
    )
    
    course_blocks = []
    current_block = []
    current_title = None
    
    print("문서에서 과정 블록 찾는 중...")
    for i, para in enumerate(tqdm(doc.paragraphs, desc="문서 스캔 중", ncols=100)):
        text = para.text.strip()
        
        # 새로운 과정 시작 감지
        if is_course_title(text) and not current_block:
            current_title = text
            current_block = [text]
        # 기존 블록에 추가
        elif current_block:
            current_block.append(text)
            
            # 다음 과정의 시작 또는 문서 끝
            if is_course_title(text) and text != current_title:
                course_blocks.append(current_block[:-1])  # 현재 줄은 제외
                current_title = text
                current_block = [text]
    
    # 마지막 블록 추가
    if current_block:
        course_blocks.append(current_block)
    
    print(f"{len(course_blocks)}개의 과정 블록을 찾았습니다.")
    
    # 각 과정 블록에서 정보 추출
    for block in tqdm(course_blocks, desc="과정 정보 추출 중", ncols=100):
        if len(block) < 10:  # 너무 짧은 블록은 무시
            continue
        
        course = Course(title=block[0])
        
        # 블록 내에서 텍스트 검색
        block_text = "\n".join(block)
        
        # 설명 추출
        match = re.search(r"과정 설명\s*(.*?)(?=\s*레벨|\s*제공 방법|\s*소요 시간|\$)", block_text, re.DOTALL)
        if match and match.group(1).strip():
            course.description = match.group(1).strip()
        
        # 레벨 추출
        match = re.search(r"레벨\s*(.*?)(?=\s*제공 방법|\s*소요 시간|\$)", block_text, re.DOTALL)
        if match and match.group(1).strip():
            course.level = match.group(1).strip()
            
        # 제공 방법 추출
        match = re.search(r"제공 방법\s*(.*?)(?=\s*소요 시간|\$)", block_text, re.DOTALL)
        if match and match.group(1).strip():
            course.delivery_method = match.group(1).strip()
            
        # 소요 시간 추출
        match = re.search(r"소요 시간\s*(.*?)(?=\s*과정 목표|\$)", block_text, re.DOTALL)
        if match and match.group(1).strip():
            course.duration = match.group(1).strip()
        
        # 과정 목표 추출
        match = re.search(r"과정 목표\s*(.*?)(?=\s*수강 대상|\$)", block_text, re.DOTALL)
        if match and match.group(1).strip():
            objectives_text = match.group(1)
            course.objectives = [
                obj.strip() for obj in re.findall(r"·\s*(.*?)(?=\s*·|\s*\$)", objectives_text)
            ]
        
        # 수강 대상 추출
        match = re.search(r"수강 대상\s*(.*?)(?=\s*수강 전 권장 사항|\$)", block_text, re.DOTALL)
        if match and match.group(1).strip():
            audience_text = match.group(1)
            course.audience = [
                aud.strip() for aud in re.findall(r"·\s*(.*?)(?=\s*·|\s*\$)", audience_text)
            ]
        
        # 수강 전 권장 사항 추출
        match = re.search(r"수강 전 권장 사항\s*(.*?)(?=\s*등록|\$)", block_text, re.DOTALL)
        if match and match.group(1).strip():
            prereq_text = match.group(1)
            course.prerequisites = [
                pre.strip() for pre in re.findall(r"·\s*(.*?)(?=\s*·|\s*\$)", prereq_text)
            ]
        
        # 등록 링크 추출
        match = re.search(r"등록\s*(.*?)(?=\s*과정 개요|\$)", block_text, re.DOTALL)
        if match and match.group(1).strip():
            course.registration_link = match.group(1).strip()
        
        # 과정 개요(모듈) 추출
        match = re.search(r"과정 개요\s*(.*?)\$", block_text, re.DOTALL)
        if match and match.group(1).strip():
            modules_text = match.group(1).strip()
            
            # 모듈 추출 시도
            module_matches = re.findall(r"모듈 (\d+)[^:]*:\s*([^\n]+)\n((?:·[^\n]*\n)*)", modules_text)
            if module_matches:
                for _, title, topics_text in module_matches:
                    module = Module(title=title.strip())
                    topics = re.findall(r"·\s*([^\n]+)", topics_text)
                    module.topics = [topic.strip() for topic in topics]
                    course.modules.append(module)
            
            # 일 차 기준 추출 시도
            day_matches = re.findall(r"(\d일 차)\s*(.*?)(?=\s*\d일 차|\s*\$)", modules_text, re.DOTALL)
            if day_matches and not course.modules:
                for day, content in day_matches:
                    module = Module(title=f"{day} 강의 내용")
                    topics = re.findall(r"·\s*([^\n]+)", content)
                    module.topics = [topic.strip() for topic in topics]
                    course.modules.append(module)
            
            # 실습 추출
            lab_matches = re.findall(r"실습 (\d+)[^:]*:\s*([^\n]+)(?:\n\n([^실습].*?))?(?=\s*실습|\s*\$)", modules_text, re.DOTALL)
            for _, title, description in lab_matches:
                lab = Lab(
                    title=title.strip(),
                    description=description.strip() if description else ""
                )
                course.labs.append(lab)
        
        # 과정 정보가 충분한 경우에만 추가
        if course.title and (course.description or course.level or course.modules):
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
    all_items = []
    
    # 과정 데이터가 충분한지 검사
    valid_courses = []
    for course in courses:
        if course.title and course.registration_link:  # 최소한의 필수 필드 확인
            valid_courses.append(course)
        else:
            print(f"데이터가 불충분한 과정 제외: {course.title}")
    
    if not valid_courses:
        print("저장할 유효한 과정 데이터가 없습니다!")
        return
        
    print(f"저장할 유효한 과정 데이터: {len(valid_courses)}개")
    
    # 진행률 표시줄로 과정 저장 진행 표시
    for course in tqdm(valid_courses, desc="과정 데이터 준비", ncols=100):
        course_id = str(uuid.uuid4())
        
        # 과정 메타데이터 항목 - 모든 필드에 기본값 설정
        course_item = {
            'PK': f"COURSE#{course_id}",
            'SK': f"METADATA#{course_id}",
            'id': course_id,
            'title': course.title,
            'description': course.description if course.description else "설명 없음",
            'level': course.level if course.level else "미지정",
            'deliveryMethod': course.delivery_method if course.delivery_method else "미지정",
            'duration': course.duration if course.duration else "미지정",
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
    REGION = 'ap-northeast-2'
    DOC_FILE = 'AWS TnC _ILT_DILT.docx'
    
    try:
        # 필요한 라이브러리 설치 확인
        import importlib
        missing_libs = []
        for lib in ["tqdm", "docx"]:
            if importlib.util.find_spec(lib) is None:
                missing_libs.append(lib)
        
        if missing_libs:
            print(f"필요한 라이브러리 설치 중: {', '.join(missing_libs)}")
            import sys
            import subprocess
            if "tqdm" in missing_libs:
                subprocess.check_call([sys.executable, "-m", "pip", "install", "tqdm"])
            if "docx" in missing_libs:
                subprocess.check_call([sys.executable, "-m", "pip", "install", "python-docx"])
            print("라이브러리 설치 완료")
        
        # 파일 존재 확인
        if not os.path.exists(DOC_FILE):
            print(f"오류: 파일 '{DOC_FILE}'을 찾을 수 없습니다.")
            print(f"현재 디렉토리: {os.getcwd()}")
            print(f"디렉토리 내 파일: {os.listdir('.')}")
            return
        
        # 문서 구조 분석
        print(f"문서 '{DOC_FILE}' 구조 분석 중...")
        patterns = analyze_document_structure(DOC_FILE)
        
        # 테이블 삭제 및 재생성
        delete_table_if_exists(TABLE_NAME, REGION)
        if not create_table_with_indexes(TABLE_NAME, REGION):
            print("테이블 생성에 실패했습니다. 작업을 중단합니다.")
            return
        
        # 직접 문서에서 과정 정보 추출
        print(f"문서 '{DOC_FILE}'에서 과정 정보 직접 추출 중...")
        courses = direct_extract_courses_from_docx(DOC_FILE)
        
        if not courses:
            print("과정 정보를 추출하지 못했습니다. 작업을 중단합니다.")
            return
            
        print(f"{len(courses)}개의 과정 추출 완료")
        
        # 디버깅용 JSON 저장
        with open('extracted_courses.json', 'w', encoding='utf-8') as f:
            json.dump([asdict(course) for course in courses], f, ensure_ascii=False, indent=2)
        
        # 추출된 과정의 품질 확인
        print("\n추출된 과정 정보 요약:")
        for i, course in enumerate(courses[:5]):  # 처음 5개만 출력
            print(f"과정 {i+1}: {course.title}")
            print(f"  설명: {course.description[:100]}..." if course.description else "  설명: 없음")
            print(f"  레벨: {course.level}")
            print(f"  제공 방법: {course.delivery_method}")
            print(f"  소요 시간: {course.duration}")
            print(f"  목표: {len(course.objectives)}개")
            print(f"  모듈: {len(course.modules)}개")
            print(f"  실습: {len(course.labs)}개")
        print(f"... 외 {len(courses)-5}개 과정")
        
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
